import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import Category from '@/lib/models/Category';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';

// See the matching comment in ../route.ts — categories are global (Navbar mega-menu on every
// page), so revalidate the whole site via the root layout, plus every /category/[slug] page.
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

// PUT update name/slug/image/subcategories/order/isActive of a category. Also doubles as the
// reorder mechanism — the Order number field is just a regular field on this same payload,
// matching the existing Brand/HeroSlide/VetService reorder pattern.
//
// Note: renaming a category's slug does NOT touch any Product documents — Product.category
// keeps whatever string it already had (see lib/models/Product.ts's comment). Changing a
// slug here can orphan products that used the old value; the admin UI warns about this.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, categorySchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        ...validation.data,
        order: Number(validation.data.order ?? 0),
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    revalidateCategoryPages();

    return NextResponse.json({ success: true, data: category });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message =
      error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000
        ? 'A category with this slug already exists.'
        : error instanceof Error
          ? error.message
          : 'Failed to update category';
    return internalErrorResponse(message);
  }
}

// DELETE a category. Hard-deleted, matching Brand/HeroSlide/VetService's convention.
// Does NOT touch or delete any Product documents referencing this category's slug — see the
// comment on lib/models/Product.ts's category field.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    revalidateCategoryPages();

    return NextResponse.json({ success: true, data: category });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to delete category';
    return internalErrorResponse(message);
  }
}
