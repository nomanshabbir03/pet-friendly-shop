'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type BrandRow = {
  _id: string;
  name: string;
  logoUrl?: string;
  order: number;
  isActive: boolean;
};

const statusClasses: Record<string, string> = {
  true: 'bg-accent-100 text-accent-600',
  false: 'bg-error/20 text-error',
};

export default function BrandsTable() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      const response = await fetch('/api/admin/brands');
      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      }
      setLoading(false);
    }

    loadBrands();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this brand? This cannot be undone.');
    if (!confirmed) return;

    const response = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.refresh();
      setBrands((current) => current.filter((brand) => brand._id !== id));
    }
  };

  if (loading) {
    return <div className="rounded-2xl bg-brand-50 p-6 text-secondary">Loading brands…</div>;
  }

  if (brands.length === 0) {
    return <div className="rounded-2xl border border-divider bg-surface p-6 text-secondary">No brands yet.</div>;
  }

  return (
    <div className="rounded-2xl border border-divider bg-surface shadow-sm">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-brand-forest/10 text-sm">
        <thead className="bg-brand-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Logo</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Order</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-forest/10">
          {brands.map((brand) => (
            <tr key={brand._id} className="bg-surface/70">
              <td className="px-4 py-3">
                <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-brand-50">
                  {brand.logoUrl ? (
                    <Image src={brand.logoUrl} alt={brand.name} width={56} height={32} unoptimized className="max-h-8 w-auto object-contain" />
                  ) : (
                    <span className="text-xs text-secondary/50">—</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-brand-500">{brand.name}</td>
              <td className="px-4 py-3 text-secondary">{brand.order}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[String(brand.isActive)]}`}>
                  {brand.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/brands/${brand._id}/edit`}
                    className="rounded-full border border-divider px-2.5 py-1 text-xs font-semibold text-brand-500"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(brand._id)}
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
  );
}
