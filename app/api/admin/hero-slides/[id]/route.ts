import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import HeroSlide from '@/lib/models/HeroSlide';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';

const heroSlideSchema = z.object({
  image: z.string().trim().refine((url) => url.startsWith('/') || z.url().safeParse(url).success, 'Invalid image URL'),
  heading: z.string().trim().optional().default(''),
  subtext: z.string().trim().optional().default(''),
  buttonText: z.string().trim().optional().default(''),
  buttonLink: z.string().trim().optional().default(''),
  order: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// PUT update image/heading/subtext/button/order/isActive of a hero slide. Also doubles as the
// reorder mechanism — the admin form's Order number field is just a regular field on this same
// payload, matching the existing Brand reorder pattern (no separate reorder endpoint).
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, heroSlideSchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const slide = await HeroSlide.findByIdAndUpdate(
      id,
      {
        ...validation.data,
        order: Number(validation.data.order ?? 0),
      },
      { new: true }
    );

    if (!slide) {
      return NextResponse.json({ success: false, error: 'Hero slide not found' }, { status: 404 });
    }

    revalidatePath('/');

    return NextResponse.json({ success: true, data: slide });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to update hero slide';
    return internalErrorResponse(message);
  }
}

// DELETE a hero slide.
// Note: hard-deleted, matching Brand's convention (Product is the one exception, which
// soft-deletes via isActive:false). The Cloudinary image asset is left in place, same as
// Brand's logoUrl and Product's images — there is no existing cleanup pattern to mirror.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const slide = await HeroSlide.findByIdAndDelete(id);

    if (!slide) {
      return NextResponse.json({ success: false, error: 'Hero slide not found' }, { status: 404 });
    }

    revalidatePath('/');

    return NextResponse.json({ success: true, data: slide });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to delete hero slide';
    return internalErrorResponse(message);
  }
}
