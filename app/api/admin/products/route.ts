import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';
import { sanitizeDescriptionHtml } from '@/lib/sanitize-html';

// Not one of the sections named in the caching-fix task, but caught by the identical root
// cause: a product create/update/toggle/delete can change what shows in Featured Products,
// Most Selling, /products, its own category page, its own brand page, and its own detail page
// (plus that page's Related Products) — all direct DB reads with no fetch()/dynamic API.
function revalidateProductPages() {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/products/[slug]', 'page');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/brand/[slug]', 'page');
}

// Packaging-size variant: its own actual/discounted price and stock count, independent of the
// product's own base `price`/`stock` fields. Every entry must have a non-empty label and a
// positive actual price; a discounted price, if set, must be strictly less than the actual
// price (otherwise it isn't a discount) — enforced here before anything reaches the DB.
const packagingSizeSchema = z
  .object({
    label: z.string().trim().min(1, 'Size label is required'),
    actualPrice: z.number().positive('Actual price must be greater than 0'),
    discountedPrice: z.number().positive('Discounted price must be greater than 0').optional(),
    stock: z.number().int('Stock must be a whole number').nonnegative('Stock cannot be negative'),
  })
  .refine((size) => size.discountedPrice === undefined || size.discountedPrice < size.actualPrice, {
    message: 'Discounted price must be less than the actual price',
    path: ['discountedPrice'],
  });

// A FAQ's question is plain text; its answer is rich text HTML, same convention/sanitization
// as `description` and `keyFeatures` below.
const faqSchema = z.object({
  question: z.string().trim().min(1, 'FAQ question is required'),
  answer: z.string().trim().optional().default(''),
});

// Admin-entered review: plain text only (rendered as text, never HTML). At most 2 per product.
const reviewSchema = z.object({
  name: z.string().trim().min(1, 'Reviewer name is required').max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1, 'Review comment is required').max(600),
});

const productSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  // Shape-only here — must also match an active Category slug, checked dynamically against the
  // DB below (categories are admin-managed, not a fixed compile-time list; see
  // lib/models/Category.ts).
  category: z.string().trim().min(1),
  brand: z.string().trim().optional().default(''),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().optional(),
  stock: z.number().nonnegative().int(),
  description: z.string().trim().optional().default(''),
  keyFeatures: z.string().trim().optional().default(''),
  faqs: z.array(faqSchema).optional().default([]),
  reviews: z.array(reviewSchema).max(2, 'A product can have at most 2 reviews').optional().default([]),
  images: z.array(z.string().trim().refine((image) => image.startsWith('/') || z.url().safeParse(image).success, 'Invalid image path')).optional().default([]),
  isActive: z.boolean().optional().default(true),
  packagingSizes: z.array(packagingSizeSchema).optional().default([]),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: products });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch products');
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, productSchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const categoryExists = await Category.exists({ slug: validation.data.category, isActive: true });
    if (!categoryExists) {
      return badRequestResponse(`"${validation.data.category}" is not an active category. Please choose one from the Category dropdown.`);
    }

    const product = await Product.create({
      ...validation.data,
      price: Number(validation.data.price),
      discountPrice: validation.data.discountPrice ? Number(validation.data.discountPrice) : undefined,
      stock: Number(validation.data.stock ?? 0),
      // Re-sanitized here, server-side, as the authoritative pass — the rich text editor's own
      // client-side sanitization (components/admin/RichTextEditor.tsx) is only a first line of
      // defense and can't be trusted alone. Reduces the submitted HTML to the same minimal
      // allowlist the editor exposes (bold/italic/lists/paragraphs, no attributes).
      description: sanitizeDescriptionHtml(validation.data.description),
      // Same re-sanitization pattern as `description` — keyFeatures is a single rich text
      // block, and each FAQ's answer is rich text too (its question stays plain text as-is).
      keyFeatures: sanitizeDescriptionHtml(validation.data.keyFeatures),
      faqs: validation.data.faqs.map((faq) => ({
        question: faq.question,
        answer: sanitizeDescriptionHtml(faq.answer),
      })),
      isActive: validation.data.isActive !== false,
    });

    revalidateProductPages();

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return internalErrorResponse(message);
  }
}
