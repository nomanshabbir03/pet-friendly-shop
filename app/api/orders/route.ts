import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';

const orderSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(/^(03\d{9}|\+923\d{9})$/),
  address: z.string().trim().min(1).max(300),
  city: z.string().trim().min(1).max(100),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      name: z.string().trim().min(1),
      variantLabel: z.string().nullable().optional(),
      price: z.number().nonnegative(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  subtotal: z.number().nonnegative().optional(),
  notes: z.string().trim().max(500).optional(),
});

// Simple in-memory rate limiting for a single-server deployment. It resets on restart and does not share state across multiple instances.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const clientIp = forwardedFor?.split(',')[0]?.trim();

  return clientIp || req.headers.get('x-real-ip') || 'unknown';
}

function applyRateLimit(req: NextRequest) {
  const ip = getClientIp(req);
  const now = Date.now();
  const previous = rateLimitMap.get(ip) ?? [];
  const recent = previous.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(ip, recent);
    return false;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

export async function POST(req: NextRequest) {
  if (!applyRateLimit(req)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    await connectDB();

    const body = await req.json();
    const validation = validateRequestBody(body, orderSchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const { customerName, phone, address, city, items, subtotal = 0, notes } = validation.data;

    // Re-check selected packaging sizes are still in stock server-side — don't trust client
    // cart state alone. Only items that carry a variantLabel are size-selected; base-price
    // items (no sizes on that product) are unaffected and skip this check entirely.
    const sizedItems = items.filter((item) => item.variantLabel);
    if (sizedItems.length > 0) {
      const productIds = [...new Set(sizedItems.map((item) => item.productId))];
      const products = await Product.find({ _id: { $in: productIds } })
        .select('packagingSizes')
        .lean<{ _id: unknown; packagingSizes?: { label: string; stock?: number; inStock?: boolean }[] }[]>();
      const productById = new Map(products.map((product) => [String(product._id), product]));

      for (const item of sizedItems) {
        const product = productById.get(item.productId);
        const size = product?.packagingSizes?.find((entry) => entry.label === item.variantLabel);
        // A size saved before the actualPrice/discountedPrice/stock migration only has a legacy
        // `inStock` boolean, not a real quantity — conservatively treat it as 0 (unavailable)
        // rather than guessing a number. See scripts/migrate-packaging-sizes.ts.
        const stock = size?.stock ?? 0;

        if (!size || stock <= 0) {
          return badRequestResponse(
            `"${item.name}" (${item.variantLabel}) is no longer available in that size. Please update your cart and try again.`
          );
        }
      }
    }

    const order = await Order.create({
      customerName,
      phone,
      address,
      city,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        variantLabel: item.variantLabel ?? null,
        price: Number(item.price ?? 0),
        quantity: Number(item.quantity ?? 0),
      })),
      subtotal,
      notes: notes || undefined,
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to create order';
    return internalErrorResponse(message);
  }
}
