import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Announcement, { ANNOUNCEMENT_SINGLETON_ID } from '@/lib/models/Announcement';
import { internalErrorResponse } from '@/lib/validation';

// GET the active announcement message (public, no auth). Fast + cache-friendly.
export async function GET() {
  try {
    await connectDB();
    const announcement = await Announcement.findById(ANNOUNCEMENT_SINGLETON_ID).lean();

    if (!announcement || !announcement.isActive || !announcement.message) {
      return NextResponse.json(
        { success: true, data: null },
        { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } }
      );
    }

    return NextResponse.json(
      { success: true, data: { message: announcement.message, isActive: announcement.isActive } },
      { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } }
    );
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch announcement');
  }
}
