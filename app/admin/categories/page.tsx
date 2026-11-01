import Link from 'next/link';
import CategoriesTable from '@/components/admin/CategoriesTable';

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-500">Categories</h1>
          <p className="mt-1 text-secondary">Manage the categories shown in Browse Categories, the navbar dropdown, and the product form.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90"
        >
          Add Category
        </Link>
      </div>

      <CategoriesTable />
    </div>
  );
}
