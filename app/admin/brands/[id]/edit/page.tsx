import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Brand from '@/lib/models/Brand';
import BrandForm from '@/components/admin/BrandForm';

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const brand = await Brand.findById(id).lean();

  if (!brand) {
    notFound();
  }

  // Safely convert the Mongoose lean doc (ObjectId, Date, etc.) to plain, serializable
  // values before handing it to the client component — mirrors the pattern used by
  // getProducts() in app/page.tsx.
  const plainBrand = JSON.parse(JSON.stringify(brand));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Edit Brand</h1>
        <p className="mt-1 text-secondary">Update this brand&apos;s logo, name, or order.</p>
      </div>

      <BrandForm mode="edit" brandId={String(brand._id)} initialValues={plainBrand} />
    </div>
  );
}
