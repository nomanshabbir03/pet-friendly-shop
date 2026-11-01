import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import Order from '@/lib/models/Order';
import { internalErrorResponse, validateRequestBody } from '@/lib/validation';

const statusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const body = await req.json();
    const validation = validateRequestBody(body, statusSchema);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(id, { status: validation.data.status }, { new: true });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    const message = error instanceof Error ? error.message : 'Failed to update order';
    return internalErrorResponse(message);
  }
}
