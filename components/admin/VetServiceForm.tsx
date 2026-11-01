'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VET_SERVICE_ICON_NAMES, resolveVetServiceIcon } from '@/constants/vet-service-icons';

type VetServiceInitialValues = Partial<{
  title: string;
  slug: string;
  icon: string;
  shortDescription: string;
  detailContent: string;
  isEmergency: boolean;
  order: string | number;
  isActive: boolean;
}>;

type VetServiceFormProps = {
  mode: 'create' | 'edit';
  serviceId?: string;
  initialValues?: VetServiceInitialValues;
};

const blankValues = {
  title: '',
  slug: '',
  icon: '',
  shortDescription: '',
  detailContent: '',
  isEmergency: false,
  order: '0',
  isActive: true,
};

export default function VetServiceForm({ mode, serviceId, initialValues }: VetServiceFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(() => {
    const initial = initialValues || {};
    return {
      ...blankValues,
      ...initial,
      order: initial.order?.toString() ?? blankValues.order,
    };
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugPreview = useMemo(() => {
    const base = values.slug || values.title || '';
    return base.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }, [values.title, values.slug]);

  const PreviewIcon = resolveVetServiceIcon(values.icon);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!values.title.trim()) {
      setError('Please enter a title.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: values.title,
      slug: values.slug || slugPreview,
      icon: values.icon,
      shortDescription: values.shortDescription,
      detailContent: values.detailContent,
      isEmergency: Boolean(values.isEmergency),
      order: Number(values.order || 0),
      isActive: Boolean(values.isActive),
    };

    const response = await fetch(mode === 'create' ? '/api/admin/vet-services' : `/api/admin/vet-services/${serviceId}`, {
      method: mode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.error || 'Failed to save vet service.');
      setIsSubmitting(false);
      return;
    }

    router.push('/admin/vet-services');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-divider bg-surface p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Title</label>
          <input name="title" value={values.title} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Slug</label>
          <input name="slug" value={values.slug || slugPreview} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
          <p className="mt-1 text-xs text-secondary/60">Used in the URL: /veterinary/{slugPreview || 'your-slug'}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Icon</label>
          <div className="flex items-center gap-2">
            <select name="icon" value={values.icon} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2">
              <option value="">— Default —</option>
              {VET_SERVICE_ICON_NAMES.map((iconName) => (
                <option key={iconName} value={iconName}>
                  {iconName}
                </option>
              ))}
            </select>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vet-yellow-100 text-vet-yellow-900">
              <PreviewIcon className="h-5 w-5" strokeWidth={1.75} />
            </span>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Order</label>
          <input type="number" name="order" value={values.order} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-divider p-3">
          <input id="isActive" name="isActive" type="checkbox" checked={Boolean(values.isActive)} onChange={handleChange} />
          <label htmlFor="isActive" className="text-sm font-semibold text-brand-500">
            Active
          </label>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-divider p-3">
          <input id="isEmergency" name="isEmergency" type="checkbox" checked={Boolean(values.isEmergency)} onChange={handleChange} />
          <label htmlFor="isEmergency" className="text-sm font-semibold text-brand-500">
            This is an Emergency / WhatsApp redirect
          </label>
        </div>
      </div>

      <p className="text-sm text-secondary">
        {values.isEmergency
          ? 'Clicking this card opens WhatsApp directly — it will not have a detail page.'
          : 'Clicking this card opens its own detail page showing the content below.'}
      </p>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500">Short Description</label>
        <textarea name="shortDescription" rows={2} value={values.shortDescription} onChange={handleChange} placeholder="Shown on the card itself" className="w-full rounded-2xl border border-divider px-3 py-2" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500">Detail Content</label>
        <textarea name="detailContent" rows={6} value={values.detailContent} onChange={handleChange} placeholder="Longer explanation shown on the service's detail page (how things will work, what to expect, etc.)" className="w-full rounded-2xl border border-divider px-3 py-2" />
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <button type="submit" disabled={isSubmitting} className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90 disabled:opacity-70">
        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Service' : 'Save Changes'}
      </button>
    </form>
  );
}
