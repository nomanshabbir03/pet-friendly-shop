import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import VetService from '@/lib/models/VetService';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';

// See the matching comment in ../route.ts.
function revalidateVetServicePages() {
  revalidatePath('/');
  revalidatePath('/veterinary/[slug]', 'page');
}

const vetServiceSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  icon: z.string().trim().optional().default(''),
  shortDescription: z.string().trim().optional().default(''),
  detailContent: z.string().trim().optional().default(''),
  isEmergency: z.boolean().optional().default(false),
  order: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// PUT update title/slug/icon/description/content/isEmergency/order/isActive of a vet service.
// Also doubles as the reorder mechanism — the Order number field is just a regular field on
// this same payload, matching the existing Brand/HeroSlide reorder pattern.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, vetServiceSchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const service = await VetService.findByIdAndUpdate(
      id,
      {
        ...validation.data,
        order: Number(validation.data.order ?? 0),
      },
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json({ success: false, error: 'Vet service not found' }, { status: 404 });
    }

    revalidateVetServicePages();

    return NextResponse.json({ success: true, data: service });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message =
      error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000
        ? 'A vet service with this slug already exists.'
        : error instanceof Error
          ? error.message
          : 'Failed to update vet service';
    return internalErrorResponse(message);
  }
}

// DELETE a vet service. Hard-deleted, matching Brand/HeroSlide's convention (Product is the
// one exception, which soft-deletes via isActive:false).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const service = await VetService.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json({ success: false, error: 'Vet service not found' }, { status: 404 });
    }

    revalidateVetServicePages();

    return NextResponse.json({ success: true, data: service });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to delete vet service';
    return internalErrorResponse(message);
  }
}
