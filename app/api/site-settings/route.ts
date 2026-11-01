import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/site-settings';
import { internalErrorResponse } from '@/lib/validation';

// GET the current site settings (public, no auth). Always returns a fully-shaped object (see
// getSiteSettings()), never null, so client-side consumers don't need extra null-guards.
export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(
      { success: true, data: settings },
      { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } }
    );
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch site settings');
  }
}
