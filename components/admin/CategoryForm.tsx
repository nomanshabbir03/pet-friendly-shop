'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type SubcategoryValue = {
  name: string;
  slug: string;
};

type CategoryInitialValues = Partial<{
  name: string;
  slug: string;
  image: string;
  subcategories: SubcategoryValue[];
  order: string | number;
  isActive: boolean;
}>;

type CategoryFormProps = {
  mode: 'create' | 'edit';
  categoryId?: string;
  initialValues?: CategoryInitialValues;
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const blankValues = {
  name: '',
  slug: '',
  image: '',
  subcategories: [] as SubcategoryValue[],
  order: '0',
  isActive: true,
};

export default function CategoryForm({ mode, categoryId, initialValues }: CategoryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(() => {
    const initial = initialValues || {};
    return {
      ...blankValues,
      ...initial,
      order: initial.order?.toString() ?? blankValues.order,
      subcategories: Array.isArray(initial.subcategories) ? initial.subcategories : [],
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

  const slugPreview = useMemo(() => {
    const base = values.slug || values.name || '';
    return slugify(base);
  }, [values.name, values.slug]);

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

      // Reuses the exact same Cloudinary upload endpoint used by the product, brand, and
      // hero slide forms.
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

  const handleAddSubcategory = () => {
    setValues((current) => ({
      ...current,
      subcategories: [...current.subcategories, { name: '', slug: '' }],
    }));
  };

  const handleRemoveSubcategory = (index: number) => {
    setValues((current) => ({
      ...current,
      subcategories: current.subcategories.filter((_, i) => i !== index),
    }));
  };

  const handleSubcategoryChange = (index: number, field: keyof SubcategoryValue, value: string) => {
    setValues((current) => ({
      ...current,
      subcategories: current.subcategories.map((sub, i) => {
        if (i !== index) return sub;
        // Keep slug auto-derived from name unless the admin has typed their own slug value.
        if (field === 'name') {
          const autoSlug = sub.slug === slugify(sub.name) || !sub.slug ? slugify(value) : sub.slug;
          return { ...sub, name: value, slug: autoSlug };
        }
        return { ...sub, [field]: value };
      }),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!values.name.trim()) {
      setError('Please enter a name.');
      return;
    }

    const subcategories = values.subcategories
      .filter((sub) => sub.name.trim())
      .map((sub) => ({ name: sub.name.trim(), slug: sub.slug.trim() || slugify(sub.name) }));

    if (subcategories.some((sub) => !sub.slug)) {
      setError('Every subcategory needs a name.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: values.name,
      slug: values.slug || slugPreview,
      image: values.image,
      subcategories,
      order: Number(values.order || 0),
      isActive: Boolean(values.isActive),
    };

    const response = await fetch(mode === 'create' ? '/api/admin/categories' : `/api/admin/categories/${categoryId}`, {
      method: mode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.error || 'Failed to save category.');
      setIsSubmitting(false);
      return;
    }

    router.push('/admin/categories');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-divider bg-surface p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Name</label>
          <input name="name" value={values.name} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Slug</label>
          <input name="slug" value={values.slug || slugPreview} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
          {mode === 'edit' ? (
            <p className="mt-1 text-xs text-error/80">
              Changing the slug does not update existing products — they&apos;ll keep the old value until edited manually.
            </p>
          ) : (
            <p className="mt-1 text-xs text-secondary/60">Used to match products: /category/{slugPreview || 'your-slug'}</p>
          )}
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
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-semibold text-brand-500">Subcategories</label>
          <button
            type="button"
            onClick={handleAddSubcategory}
            className="rounded-full border border-divider px-3 py-1 text-sm font-semibold text-brand-500 transition hover:bg-brand-50"
          >
            + Add Subcategory
          </button>
        </div>
        <p className="mb-3 text-sm text-secondary">
          Optional. Shown as a dropdown under this category in the navbar&apos;s Category menu.
        </p>

        {values.subcategories.length > 0 ? (
          <div className="space-y-3">
            {values.subcategories.map((sub, index) => (
              <div key={index} className="grid gap-3 rounded-2xl border border-divider p-3 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-500">Name</label>
                  <input
                    type="text"
                    value={sub.name}
                    onChange={(event) => handleSubcategoryChange(index, 'name', event.target.value)}
                    placeholder="e.g. Dog Food"
                    className="w-full rounded-2xl border border-divider px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-500">Slug</label>
                  <input
                    type="text"
                    value={sub.slug}
                    onChange={(event) => handleSubcategoryChange(index, 'slug', event.target.value)}
                    placeholder="dog-food"
                    className="w-full rounded-2xl border border-divider px-3 py-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSubcategory(index)}
                  className="self-end rounded-full border border-divider px-3 py-2 text-sm font-medium text-error transition hover:bg-error/10"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500" htmlFor="image">
          Category Image
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
            alt="Selected category image preview"
            width={120}
            height={120}
            unoptimized
            className="mt-3 h-24 w-24 rounded-2xl border border-divider object-cover"
          />
        ) : null}
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <button type="submit" disabled={isSubmitting || isUploadingImage} className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90 disabled:opacity-70">
        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Category' : 'Save Changes'}
      </button>
    </form>
  );
}
