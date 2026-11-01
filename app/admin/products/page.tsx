import ProductsTable from '@/components/admin/ProductsTable';
import Link from 'next/link';

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-500">Products</h1>
          <p className="mt-1 text-secondary">Manage the inventory and availability of your products.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90"
        >
          Add Product
        </Link>
      </div>

      <ProductsTable />
    </div>
  );
}
