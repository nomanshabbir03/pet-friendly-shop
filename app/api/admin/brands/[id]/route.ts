import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import Brand from '@/lib/models/Brand';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';

const brandSchema = z.object({
  name: z.string().trim().min(1),
  logoUrl: z.string().trim().refine((url) => url.startsWith('/') || z.url().safeParse(url).success, 'Invalid logo URL'),
  order: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// PUT update name/logo/order/isActive of a brand.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, brandSchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const brand = await Brand.findByIdAndUpdate(
      id,
      {
        ...validation.data,
        order: Number(validation.data.order ?? 0),
      },
      { new: true }
    );

    if (!brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    revalidatePath('/');

    return NextResponse.json({ success: true, data: brand });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to update brand';
    return internalErrorResponse(message);
  }
}

// DELETE a brand.
// Note: unlike Product (which soft-deletes via isActive:false), brands are hard-deleted per spec.
// The existing product-delete flow does not clean up Cloudinary assets, so there is no existing
// pattern to mirror here — the Cloudinary logo asset is left in place, matching that behavior.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    revalidatePath('/');

    return NextResponse.json({ success: true, data: brand });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to delete brand';
    return internalErrorResponse(message);
  }
}
