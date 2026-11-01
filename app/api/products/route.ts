import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';

// GET all products
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    // Always log — see lib/mongodb.ts for why this used to be silent in production.
    console.error('[GET /api/products]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST create a new product (temporary — no auth yet, we'll lock this down when we build the admin panel)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: unknown) {
    console.error('[POST /api/products]', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 400 });
  }
}
