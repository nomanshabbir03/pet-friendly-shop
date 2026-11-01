import BrandForm from '@/components/admin/BrandForm';

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Add Brand</h1>
        <p className="mt-1 text-secondary">Add a new brand logo to the homepage.</p>
      </div>

      <BrandForm mode="create" />
    </div>
  );
}
