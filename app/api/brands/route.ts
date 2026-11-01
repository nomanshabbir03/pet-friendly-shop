import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Brand from '@/lib/models/Brand';
import { internalErrorResponse } from '@/lib/validation';

// GET all active brands, sorted for display (public, no auth).
export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: brands });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch brands');
  }
}
