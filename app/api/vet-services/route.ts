import { NextResponse } from 'next/server';
import { getVetServices } from '@/lib/vet-services';
import { internalErrorResponse } from '@/lib/validation';

// GET all active vet services, sorted for display (public, no auth).
export async function GET() {
  try {
    const services = await getVetServices();
    return NextResponse.json({ success: true, data: services });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return internalErrorResponse('Failed to fetch vet services');
  }
}
