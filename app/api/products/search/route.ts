import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim() || '';

    await connectDB();

    const products = q
      ? await Product.find({
          isActive: true,
          $or: [
            { name: { $regex: escapeRegex(q), $options: 'i' } },
            { brand: { $regex: escapeRegex(q), $options: 'i' } },
          ],
        }).sort({ createdAt: -1 })
      : [];

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
    return NextResponse.json({ success: false, error: 'Failed to search products' }, { status: 500 });
  }
}
