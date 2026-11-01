'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ProductRow = {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  slug: string;
  isMostSelling?: boolean;
};

const statusClasses: Record<string, string> = {
  true: 'bg-accent-100 text-accent-600',
  false: 'bg-error/20 text-error',
};

export default function ProductsTable() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostSellingError, setMostSellingError] = useState<string | null>(null);
  const [mostSellingUpdatingId, setMostSellingUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Soft delete this product?');
    if (!confirmed) return;

    const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.refresh();
      setProducts((current) => current.filter((product) => product._id !== id));
    }
  };

  const handleToggleMostSelling = async (id: string, nextValue: boolean) => {
    setMostSellingError(null);
    setMostSellingUpdatingId(id);

    // Optimistic update, matching the pattern of handleDelete above.
    setProducts((current) => current.map((product) => (product._id === id ? { ...product, isMostSelling: nextValue } : product)));

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isMostSelling: nextValue }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update product.');
      }
    } catch (error) {
      // Revert on failure.
      setProducts((current) => current.map((product) => (product._id === id ? { ...product, isMostSelling: !nextValue } : product)));
      setMostSellingError(error instanceof Error ? error.message : 'Failed to update product.');
    } finally {
      setMostSellingUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="rounded-2xl bg-brand-50 p-6 text-secondary">Loading products…</div>;
  }

  return (
    <div className="space-y-3">
      {mostSellingError ? (
        <p className="rounded-2xl border border-error/20 bg-error/10 px-4 py-2 text-sm text-error">{mostSellingError}</p>
      ) : null}
      <div className="rounded-2xl border border-divider bg-surface shadow-sm">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-brand-forest/10 text-sm">
          <thead className="bg-brand-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-brand-500">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-brand-500">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-brand-500">Price</th>
              <th className="px-4 py-3 text-left font-semibold text-brand-500">Stock</th>
              <th className="px-4 py-3 text-left font-semibold text-brand-500">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-brand-500">Most Selling</th>
              <th className="px-4 py-3 text-left font-semibold text-brand-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-forest/10">
            {products.map((product) => (
              <tr key={product._id} className="bg-surface/70">
                <td className="px-4 py-3">
                  <div className="font-semibold text-brand-500">{product.name}</div>
                  <div className="text-xs text-secondary/70">{product.slug}</div>
                </td>
                <td className="px-4 py-3 text-secondary">{product.category}</td>
                <td className="px-4 py-3 text-secondary">Rs. {product.price}</td>
                <td className="px-4 py-3 text-secondary">{product.stock}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[String(product.isActive)]}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(product.isMostSelling)}
                      disabled={mostSellingUpdatingId === product._id}
                      onChange={(event) => handleToggleMostSelling(product._id, event.target.checked)}
                      aria-label="Mark as Most Selling"
                    />
                    <span className="text-xs text-secondary">Mark as Most Selling</span>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${product._id}/edit`}
                      className="rounded-full border border-divider px-2.5 py-1 text-xs font-semibold text-brand-500"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="rounded-full border border-error/20 px-2.5 py-1 text-xs font-semibold text-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
