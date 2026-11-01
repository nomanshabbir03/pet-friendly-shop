import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Add Product</h1>
        <p className="mt-1 text-secondary">Create a new product for your catalog.</p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
