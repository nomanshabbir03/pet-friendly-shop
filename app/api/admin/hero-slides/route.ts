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

// GET all hero slides (admin list view — includes inactive, unlike the public route).
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const slides = await HeroSlide.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: slides });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch hero slides');
  }
}

// POST create a new hero slide.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, heroSlideSchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const slide = await HeroSlide.create({
      ...validation.data,
      order: Number(validation.data.order ?? 0),
    });

    // Homepage renders the slider via app/page.tsx's direct DB read — with no fetch()/dynamic
    // API involved there, Next.js would otherwise cache that render until the next deploy.
    revalidatePath('/');

    return NextResponse.json({ success: true, data: slide }, { status: 201 });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to create hero slide';
    return internalErrorResponse(message);
  }
}
