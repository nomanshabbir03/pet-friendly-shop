import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import HeroSlide from '@/lib/models/HeroSlide';
import { internalErrorResponse } from '@/lib/validation';

// GET all active hero slides, sorted for display (public, no auth).
export async function GET() {
  try {
    await connectDB();
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: slides });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch hero slides');
  }
}
