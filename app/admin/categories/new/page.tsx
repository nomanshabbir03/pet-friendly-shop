import CategoryForm from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Add Category</h1>
        <p className="mt-1 text-secondary">Add a new category for products, Browse Categories, and the navbar dropdown.</p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}
