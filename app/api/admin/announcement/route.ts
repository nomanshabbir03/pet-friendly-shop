import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import Announcement, { ANNOUNCEMENT_SINGLETON_ID } from '@/lib/models/Announcement';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';

const announcementSchema = z.object({
  message: z.string().trim().min(1).max(500),
  isActive: z.boolean().optional().default(true),
});

// GET the current announcement for the admin form (auth required).
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const announcement = await Announcement.findById(ANNOUNCEMENT_SINGLETON_ID).lean();
    return NextResponse.json({ success: true, data: announcement || null });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch announcement');
  }
}

// PUT upsert the singleton announcement document (auth required).
export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, announcementSchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const announcement = await Announcement.findByIdAndUpdate(
      ANNOUNCEMENT_SINGLETON_ID,
      {
        message: validation.data.message,
        isActive: validation.data.isActive,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // AnnouncementBar (rendered on every page) fetches this data from the public
    // /api/announcement Route Handler client-side. GET Route Handlers with no dynamic API usage
    // are also subject to Next.js's Full Route Cache (same underlying issue as the page-level
    // fixes elsewhere in this pass), so the handler itself needs invalidating here too — not
    // one of the sections named in this task, but caught by the identical root cause.
    revalidatePath('/api/announcement');

    return NextResponse.json({ success: true, data: announcement });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to save announcement';
    return internalErrorResponse(message);
  }
}
