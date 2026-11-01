import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import CategoryForm from '@/components/admin/CategoryForm';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const category = await Category.findById(id).lean();

  if (!category) {
    notFound();
  }

  // Safely convert the Mongoose lean doc (ObjectId, Date, etc.) to plain, serializable
  // values before handing it to the client component — mirrors EditBrandPage/EditHeroSlidePage.
  const plainCategory = JSON.parse(JSON.stringify(category));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Edit Category</h1>
        <p className="mt-1 text-secondary">Update this category&apos;s name, image, subcategories, or order.</p>
      </div>

      <CategoryForm mode="edit" categoryId={String(category._id)} initialValues={plainCategory} />
    </div>
  );
}
