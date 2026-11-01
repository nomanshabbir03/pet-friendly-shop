'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type HeroSlideRow = {
  _id: string;
  image: string;
  heading: string;
  buttonText?: string;
  order: number;
  isActive: boolean;
};

const statusClasses: Record<string, string> = {
  true: 'bg-accent-100 text-accent-600',
  false: 'bg-error/20 text-error',
};

export default function HeroSlidesTable() {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlideRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlides() {
      const response = await fetch('/api/admin/hero-slides');
      const data = await response.json();
      if (data.success) {
        setSlides(data.data);
      }
      setLoading(false);
    }

    loadSlides();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this hero slide? This cannot be undone.');
    if (!confirmed) return;

    const response = await fetch(`/api/admin/hero-slides/${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.refresh();
      setSlides((current) => current.filter((slide) => slide._id !== id));
    }
  };

  if (loading) {
    return <div className="rounded-2xl bg-brand-50 p-6 text-secondary">Loading hero slides…</div>;
  }

  if (slides.length === 0) {
    return <div className="rounded-2xl border border-divider bg-surface p-6 text-secondary">No hero slides yet.</div>;
  }

  return (
    <div className="rounded-2xl border border-divider bg-surface shadow-sm">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-brand-forest/10 text-sm">
        <thead className="bg-brand-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Poster</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Heading</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Button</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Order</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-forest/10">
          {slides.map((slide) => (
            <tr key={slide._id} className="bg-surface/70">
              <td className="px-4 py-3">
                <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded-lg bg-brand-50">
                  <Image src={slide.image} alt={slide.heading} width={64} height={40} unoptimized className="h-full w-full object-cover" />
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-brand-500">{slide.heading}</td>
              <td className="px-4 py-3 text-secondary">{slide.buttonText || '—'}</td>
              <td className="px-4 py-3 text-secondary">{slide.order}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[String(slide.isActive)]}`}>
                  {slide.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/hero-slides/${slide._id}/edit`}
                    className="rounded-full border border-divider px-2.5 py-1 text-xs font-semibold text-brand-500"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(slide._id)}
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
