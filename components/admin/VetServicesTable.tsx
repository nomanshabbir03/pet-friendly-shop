'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveVetServiceIcon } from '@/constants/vet-service-icons';

type VetServiceRow = {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  isEmergency: boolean;
  order: number;
  isActive: boolean;
};

const statusClasses: Record<string, string> = {
  true: 'bg-accent-100 text-accent-600',
  false: 'bg-error/20 text-error',
};

export default function VetServicesTable() {
  const router = useRouter();
  const [services, setServices] = useState<VetServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      const response = await fetch('/api/admin/vet-services');
      const data = await response.json();
      if (data.success) {
        setServices(data.data);
      }
      setLoading(false);
    }

    loadServices();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this vet service? This cannot be undone.');
    if (!confirmed) return;

    const response = await fetch(`/api/admin/vet-services/${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.refresh();
      setServices((current) => current.filter((service) => service._id !== id));
    }
  };

  if (loading) {
    return <div className="rounded-2xl bg-brand-50 p-6 text-secondary">Loading vet services…</div>;
  }

  if (services.length === 0) {
    return <div className="rounded-2xl border border-divider bg-surface p-6 text-secondary">No vet services yet.</div>;
  }

  return (
    <div className="rounded-2xl border border-divider bg-surface shadow-sm">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-brand-forest/10 text-sm">
        <thead className="bg-brand-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Icon</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Order</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-forest/10">
          {services.map((service) => {
            const Icon = resolveVetServiceIcon(service.icon);
            return (
              <tr key={service._id} className="bg-surface/70">
                <td className="px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vet-yellow-100 text-vet-yellow-900">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-brand-500">{service.title}</td>
                <td className="px-4 py-3 text-secondary">{service.isEmergency ? 'WhatsApp redirect' : 'Detail page'}</td>
                <td className="px-4 py-3 text-secondary">{service.order}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[String(service.isActive)]}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/vet-services/${service._id}/edit`}
                      className="rounded-full border border-divider px-2.5 py-1 text-xs font-semibold text-brand-500"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(service._id)}
                      className="rounded-full border border-error/20 px-2.5 py-1 text-xs font-semibold text-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
