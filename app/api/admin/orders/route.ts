import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAdminSession } from '@/lib/admin-auth';
import Order from '@/lib/models/Order';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, data: orders });
}
