import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import Category from '@/lib/models/Category';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';

// Categories show up in the Navbar's "Category" mega-menu on EVERY page (via the root layout)
// as well as the homepage's "Shop by category" grid and each /category/[slug] page's tab bar —
// all read straight from MongoDB with no fetch()/dynamic API, so Next.js would otherwise cache
// them until the next deploy. revalidatePath('/', 'layout') invalidates every route that shares
// the root layout (i.e. the whole site) since the mega-menu is genuinely global.
function revalidateCategoryPages() {
  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
}

const subcategorySchema = z.object({
  name: z.string().trim().min(1, 'Subcategory name is required'),
  slug: z.string().trim().min(1, 'Subcategory slug is required'),
});

const categorySchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  image: z.string().trim().optional().default(''),
  subcategories: z.array(subcategorySchema).optional().default([]),
  order: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// GET all categories (admin list view — includes inactive, unlike getLiveCategories()).
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const categories = await Category.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch categories');
  }
}

// POST create a new category.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, categorySchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const category = await Category.create({
      ...validation.data,
      order: Number(validation.data.order ?? 0),
    });

    revalidateCategoryPages();

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message =
      error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000
        ? 'A category with this slug already exists.'
        : error instanceof Error
          ? error.message
          : 'Failed to create category';
    return internalErrorResponse(message);
  }
}
