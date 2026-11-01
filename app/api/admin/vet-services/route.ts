import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import VetService from '@/lib/models/VetService';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';

// Vet services show up in the homepage's VeterinarySection and each has its own
// /veterinary/[slug] detail page — both direct DB reads with no fetch()/dynamic API.
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

// GET all vet services (admin list view — includes inactive, unlike the public route).
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const services = await VetService.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: services });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch vet services');
  }
}

// POST create a new vet service.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, vetServiceSchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const service = await VetService.create({
      ...validation.data,
      order: Number(validation.data.order ?? 0),
    });

    revalidateVetServicePages();

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message =
      error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000
        ? 'A vet service with this slug already exists.'
        : error instanceof Error
          ? error.message
          : 'Failed to create vet service';
    return internalErrorResponse(message);
  }
}
