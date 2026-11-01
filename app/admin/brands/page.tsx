import Link from 'next/link';
import BrandsTable from '@/components/admin/BrandsTable';

export default function AdminBrandsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-500">Brands</h1>
          <p className="mt-1 text-secondary">Manage the brand logos shown on the homepage.</p>
        </div>
        <Link
          href="/admin/brands/new"
          className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90"
        >
          Add Brand
        </Link>
      </div>

      <BrandsTable />
    </div>
  );
}
