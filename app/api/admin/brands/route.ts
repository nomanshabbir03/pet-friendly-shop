import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import Brand from '@/lib/models/Brand';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';

const brandSchema = z.object({
  name: z.string().trim().min(1),
  // Optional — the product form's brand combobox creates brands by name only (no logo step).
  // The standalone Brand management form still requires a logo client-side before it submits,
  // so this relaxation only affects the inline quick-create path.
  logoUrl: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((url) => !url || url.startsWith('/') || z.url().safeParse(url).success, 'Invalid logo URL'),
  order: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// GET all brands (admin list view — includes inactive, unlike the public route).
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const brands = await Brand.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: brands });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch brands');
  }
}

// POST create a new brand.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, brandSchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const brand = await Brand.create({
      ...validation.data,
      order: Number(validation.data.order ?? 0),
    });

    // Homepage's "Our Top Brands" carousel (BrandsSection) reads straight from MongoDB with no
    // fetch()/dynamic API involved — otherwise cached by Next.js until the next deploy.
    revalidatePath('/');

    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to create brand';
    return internalErrorResponse(message);
  }
}
