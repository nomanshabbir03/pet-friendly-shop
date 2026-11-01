'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type BrandInitialValues = Partial<{
  name: string;
  logoUrl: string;
  order: string | number;
  isActive: boolean;
}>;

type BrandFormProps = {
  mode: 'create' | 'edit';
  brandId?: string;
  initialValues?: BrandInitialValues;
};

const blankValues = {
  name: '',
  logoUrl: '',
  order: '0',
  isActive: true,
};

export default function BrandForm({ mode, brandId, initialValues }: BrandFormProps) {
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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    return () => {
      if (logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (!image) return;

    setError('');
    setIsUploadingLogo(true);
    const localPreview = URL.createObjectURL(image);
    setLogoPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append('image', image);

      // Reuses the exact same Cloudinary upload endpoint used by the product form.
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload logo.');
      }

      setValues((current) => ({ ...current, logoUrl: data.path }));
      setLogoPreview(data.path);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload logo.');
      setLogoPreview('');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!values.logoUrl) {
      setError('Please upload a logo before saving.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: values.name,
      logoUrl: values.logoUrl,
      order: Number(values.order || 0),
      isActive: Boolean(values.isActive),
    };

    const response = await fetch(mode === 'create' ? '/api/admin/brands' : `/api/admin/brands/${brandId}`, {
      method: mode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.error || 'Failed to save brand.');
      setIsSubmitting(false);
      return;
    }

    router.push('/admin/brands');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-divider bg-surface p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Brand Name</label>
          <input name="name" value={values.name} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Order</label>
          <input type="number" name="order" value={values.order} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-divider p-3 md:col-span-2">
          <input id="isActive" name="isActive" type="checkbox" checked={Boolean(values.isActive)} onChange={handleChange} />
          <label htmlFor="isActive" className="text-sm font-semibold text-brand-500">
            Active
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500" htmlFor="logo">
          Brand Logo
        </label>
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="w-full rounded-2xl border border-divider px-3 py-2"
        />
        {isUploadingLogo ? <p className="mt-2 text-sm text-secondary">Uploading logo...</p> : null}
        {logoPreview || values.logoUrl ? (
          <Image
            src={logoPreview || values.logoUrl}
            alt="Selected brand logo preview"
            width={120}
            height={80}
            unoptimized
            className="mt-3 h-20 w-auto max-w-[160px] rounded-2xl border border-divider object-contain p-2"
          />
        ) : null}
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <button type="submit" disabled={isSubmitting || isUploadingLogo} className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90 disabled:opacity-70">
        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Brand' : 'Save Changes'}
      </button>
    </form>
  );
}
