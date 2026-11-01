import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const product = await Product.findById(id).lean();

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Edit Product</h1>
        <p className="mt-1 text-secondary">Update the details for this listing.</p>
      </div>

      <ProductForm mode="edit" productId={String(product._id)} initialValues={product} />
    </div>
  );
}
