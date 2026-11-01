import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import SiteSettings, { SITE_SETTINGS_SINGLETON_ID } from '@/lib/models/SiteSettings';
import { badRequestResponse, internalErrorResponse, validateRequestBody } from '@/lib/validation';

const socialLinksSchema = z.object({
  facebook: z.string().trim().optional().default(''),
  instagram: z.string().trim().optional().default(''),
  twitter: z.string().trim().optional().default(''),
  tiktok: z.string().trim().optional().default(''),
  youtube: z.string().trim().optional().default(''),
});

const siteSettingsSchema = z.object({
  email: z.string().trim().optional().default(''),
  phone: z.string().trim().optional().default(''),
  whatsappNumber: z.string().trim().optional().default(''),
  address: z.string().trim().optional().default(''),
  socialLinks: socialLinksSchema.optional().default({
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    youtube: '',
  }),
  deliveryInfo: z.string().trim().optional().default(''),
  shopInfo: z.string().trim().optional().default(''),
});

// GET the current site settings for the admin form (auth required). Returns null (not an
// error) if the singleton hasn't been saved yet — mirrors the Announcement admin route.
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const settings = await SiteSettings.findById(SITE_SETTINGS_SINGLETON_ID).lean();
    return NextResponse.json({ success: true, data: settings || null });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch site settings');
  }
}

// PUT upsert the singleton site settings document (auth required) — auto-creates it on first
// save rather than requiring a separate "create" step, same as the Announcement admin route.
export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, siteSettingsSchema);

    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const settings = await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_SINGLETON_ID,
      {
        ...validation.data,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Site settings feed the Footer and floating WhatsApp button via the root layout (every
    // page), plus TrustBar/VeterinarySection on the homepage and the Contact and
    // order-confirmation pages — all direct DB reads with no fetch()/dynamic API. Revalidating
    // the root layout invalidates every route that shares it, i.e. the whole site.
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to save site settings';
    return internalErrorResponse(message);
  }
}
