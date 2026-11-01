'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type HeroSlideInitialValues = Partial<{
  image: string;
  heading: string;
  subtext: string;
  buttonText: string;
  buttonLink: string;
  order: string | number;
  isActive: boolean;
}>;

type HeroSlideFormProps = {
  mode: 'create' | 'edit';
  slideId?: string;
  initialValues?: HeroSlideInitialValues;
};

const blankValues = {
  image: '',
  heading: '',
  subtext: '',
  buttonText: '',
  buttonLink: '',
  order: '0',
  isActive: true,
};

export default function HeroSlideForm({ mode, slideId, initialValues }: HeroSlideFormProps) {
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (!image) return;

    setError('');
    setIsUploadingImage(true);
    const localPreview = URL.createObjectURL(image);
    setImagePreview(localPreview);

    try {
      const formData = new FormData();
      formData.append('image', image);

      // Reuses the exact same Cloudinary upload endpoint used by the product and brand forms.
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      setValues((current) => ({ ...current, image: data.path }));
      setImagePreview(data.path);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload image.');
      setImagePreview('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!values.image) {
      setError('Please upload a poster image before saving.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      image: values.image,
      heading: values.heading,
      subtext: values.subtext,
      buttonText: values.buttonText,
      buttonLink: values.buttonLink,
      order: Number(values.order || 0),
      isActive: Boolean(values.isActive),
    };

    const response = await fetch(mode === 'create' ? '/api/admin/hero-slides' : `/api/admin/hero-slides/${slideId}`, {
      method: mode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.error || 'Failed to save hero slide.');
      setIsSubmitting(false);
      return;
    }

    router.push('/admin/hero-slides');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-divider bg-surface p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Heading</label>
          <input name="heading" value={values.heading} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Order</label>
          <input type="number" name="order" value={values.order} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-brand-500">Subtext</label>
          <textarea name="subtext" rows={2} value={values.subtext} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Button Text</label>
          <input name="buttonText" value={values.buttonText} onChange={handleChange} placeholder="e.g. Shop Now" className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Button Link</label>
          <input name="buttonLink" value={values.buttonLink} onChange={handleChange} placeholder="e.g. /category/dog" className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-divider p-3 md:col-span-2">
          <input id="isActive" name="isActive" type="checkbox" checked={Boolean(values.isActive)} onChange={handleChange} />
          <label htmlFor="isActive" className="text-sm font-semibold text-brand-500">
            Active
          </label>
        </div>
      </div>

      <p className="text-sm text-secondary">
        Leave Button Text and Button Link empty for a slide with no CTA button.
      </p>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500" htmlFor="image">
          Poster Image
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-2xl border border-divider px-3 py-2"
        />
        {isUploadingImage ? <p className="mt-2 text-sm text-secondary">Uploading image...</p> : null}
        {imagePreview || values.image ? (
          <Image
            src={imagePreview || values.image}
            alt="Selected hero slide poster preview"
            width={320}
            height={180}
            unoptimized
            className="mt-3 h-32 w-full max-w-xs rounded-2xl border border-divider object-cover"
          />
        ) : null}
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <button type="submit" disabled={isSubmitting || isUploadingImage} className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90 disabled:opacity-70">
        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Slide' : 'Save Changes'}
      </button>
    </form>
  );
}
