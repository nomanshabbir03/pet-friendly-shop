'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type CategoryRow = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  subcategories?: { name: string; slug: string }[];
  order: number;
  isActive: boolean;
};

const statusClasses: Record<string, string> = {
  true: 'bg-accent-100 text-accent-600',
  false: 'bg-error/20 text-error',
};

export default function CategoriesTable() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
      setLoading(false);
    }

    loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Delete this category? Existing products assigned to it will keep their category value but it will no longer appear anywhere on the site. This cannot be undone.'
    );
    if (!confirmed) return;

    const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.refresh();
      setCategories((current) => current.filter((category) => category._id !== id));
    }
  };

  if (loading) {
    return <div className="rounded-2xl bg-brand-50 p-6 text-secondary">Loading categories…</div>;
  }

  if (categories.length === 0) {
    return <div className="rounded-2xl border border-divider bg-surface p-6 text-secondary">No categories yet.</div>;
  }

  return (
    <div className="rounded-2xl border border-divider bg-surface shadow-sm">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-brand-forest/10 text-sm">
        <thead className="bg-brand-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Image</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Name</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Slug</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Subcategories</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Order</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-forest/10">
          {categories.map((category) => (
            <tr key={category._id} className="bg-surface/70">
              <td className="px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-brand-50">
                  {category.image ? (
                    <Image src={category.image} alt={category.name} width={40} height={40} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-secondary/50">—</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-brand-500">{category.name}</td>
              <td className="px-4 py-3 text-secondary">{category.slug}</td>
              <td className="px-4 py-3 text-secondary">
                {category.subcategories && category.subcategories.length > 0
                  ? category.subcategories.map((sub) => sub.name).join(', ')
                  : '—'}
              </td>
              <td className="px-4 py-3 text-secondary">{category.order}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[String(category.isActive)]}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/categories/${category._id}/edit`}
                    className="rounded-full border border-divider px-2.5 py-1 text-xs font-semibold text-brand-500"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(category._id)}
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
