'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { slugifyBrand } from '@/constants/brands';
import BrandCombobox, { type BrandOption } from '@/components/admin/BrandCombobox';
import RichTextEditor from '@/components/admin/RichTextEditor';

type CategoryOption = {
  slug: string;
  name: string;
};

type PackagingSizeValue = {
  label: string;
  actualPrice: string | number;
  discountedPrice: string | number;
  stock: string | number;
};

// Loosened beyond PackagingSizeValue to also accept the legacy {price, inStock} shape a product
// saved before the actualPrice/discountedPrice/stock migration would still have — see the
// mapping in useState below and scripts/migrate-packaging-sizes.ts.
type InitialPackagingSizeValue = Partial<{
  label: string;
  actualPrice: string | number;
  discountedPrice: string | number;
  stock: string | number;
  price: string | number;
  inStock: boolean;
}>;

type FaqValue = {
  question: string;
  answer: string;
};

type ReviewValue = {
  name: string;
  rating: number;
  comment: string;
};

const MAX_REVIEWS = 2;
const MAX_IMAGES = 10;

type ProductInitialValues = Partial<{
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: string | number;
  discountPrice: string | number;
  stock: string | number;
  description: string;
  keyFeatures: string;
  faqs: Partial<FaqValue>[];
  reviews: Partial<ReviewValue>[];
  images: string[];
  isActive: boolean;
  packagingSizes: InitialPackagingSizeValue[];
}>;

type ProductFormProps = {
  mode: 'create' | 'edit';
  productId?: string;
  initialValues?: ProductInitialValues;
};

const blankValues = {
  name: '',
  slug: '',
  category: '',
  brand: '',
  price: '',
  discountPrice: '',
  stock: '0',
  description: '',
  keyFeatures: '',
  faqs: [] as FaqValue[],
  reviews: [] as ReviewValue[],
  images: [] as string[],
  isActive: true,
  packagingSizes: [] as PackagingSizeValue[],
};

export default function ProductForm({ mode, productId, initialValues }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(() => {
    const initial = initialValues || {};
    return {
      ...blankValues,
      ...initial,
      price: initial.price?.toString() ?? blankValues.price,
      discountPrice: initial.discountPrice?.toString() ?? blankValues.discountPrice,
      stock: initial.stock?.toString() ?? blankValues.stock,
      images: Array.isArray(initial.images) ? initial.images : [],
      keyFeatures: initial.keyFeatures ?? blankValues.keyFeatures,
      faqs: Array.isArray(initial.faqs)
        ? initial.faqs.map((faq) => ({
            question: faq.question ?? '',
            answer: faq.answer ?? '',
          }))
        : [],
      reviews: Array.isArray(initial.reviews)
        ? initial.reviews.slice(0, MAX_REVIEWS).map((review) => ({
            name: review.name ?? '',
            rating: review.rating ?? 5,
            comment: review.comment ?? '',
          }))
        : [],
      packagingSizes: Array.isArray(initial.packagingSizes)
        ? initial.packagingSizes.map((size) => ({
            label: size.label ?? '',
            // actualPrice falls back to the legacy `price` field for a product saved before the
            // migration — this mapping is unambiguous (same value, new name), unlike stock below.
            actualPrice: (size.actualPrice ?? size.price)?.toString() ?? '',
            discountedPrice: size.discountedPrice?.toString() ?? '',
            // Deliberately NOT derived from the legacy `inStock` boolean — there's no way to
            // recover a real quantity from a true/false flag without guessing a number, so an
            // un-migrated size is left blank here to prompt the admin to enter the real stock
            // count. Run scripts/migrate-packaging-sizes.ts to backfill this in bulk instead.
            stock: size.stock !== undefined ? size.stock.toString() : '',
          }))
        : [],
    };
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  const [brandsLoaded, setBrandsLoaded] = useState(false);

  // Categories are admin-managed (see /admin/categories) rather than a hardcoded list — load
  // the live, active set so this dropdown can only ever offer a category that actually exists.
  useEffect(() => {
    let cancelled = false;

    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && Array.isArray(data.data)) {
          setCategoryOptions(
            data.data
              .filter((category: { isActive: boolean }) => category.isActive)
              .map((category: { slug: string; name: string }) => ({ slug: category.slug, name: category.name }))
          );
        }
      })
      .catch(() => {
        // Leave categoryOptions empty — the legacy-value fallback below still lets an existing
        // product keep its current category if this fetch fails.
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Brands are managed via the Brand collection (same one the standalone Brand management
  // section and homepage carousel use) — load the live set so the combobox below can search it
  // and create into it. logoUrl isn't needed here, only name/slug for selection.
  useEffect(() => {
    let cancelled = false;

    fetch('/api/admin/brands')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && Array.isArray(data.data)) {
          setBrandOptions(
            data.data.map((brand: { _id: string; name: string }) => ({
              _id: brand._id,
              name: brand.name,
              slug: slugifyBrand(brand.name),
            }))
          );
        }
      })
      .catch(() => {
        // Leave brandOptions empty — BrandCombobox still falls back to showing the product's
        // current stored brand value as plain text if this fetch fails.
      })
      .finally(() => {
        if (!cancelled) setBrandsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const slugPreview = useMemo(() => {
    const base = values.slug || values.name || '';
    return base.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }, [values.name, values.slug]);

  // Same idea for category: a product's stored category slug may no longer match any active
  // Category (renamed, deactivated, or from before categories were admin-managed). Surface it
  // as an extra option rather than silently changing the product's category on save.
  const isLegacyCategoryValue =
    categoriesLoaded && Boolean(values.category) && !categoryOptions.some((option) => option.slug === values.category);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBrandChange = (slug: string) => {
    setValues((current) => ({ ...current, brand: slug }));
  };

  const handleBrandCreated = (brand: BrandOption) => {
    setBrandOptions((current) => [...current, brand]);
  };

  const handleAddSize = () => {
    setValues((current) => ({
      ...current,
      packagingSizes: [...current.packagingSizes, { label: '', actualPrice: '', discountedPrice: '', stock: '0' }],
    }));
  };

  const handleRemoveSize = (index: number) => {
    setValues((current) => ({
      ...current,
      packagingSizes: current.packagingSizes.filter((_, i) => i !== index),
    }));
  };

  const handleSizeChange = (index: number, field: keyof PackagingSizeValue, value: string) => {
    setValues((current) => ({
      ...current,
      packagingSizes: current.packagingSizes.map((size, i) => (i === index ? { ...size, [field]: value } : size)),
    }));
  };

  const handleAddFaq = () => {
    setValues((current) => ({
      ...current,
      faqs: [...current.faqs, { question: '', answer: '' }],
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setValues((current) => ({
      ...current,
      faqs: current.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleFaqChange = (index: number, field: keyof FaqValue, value: string) => {
    setValues((current) => ({
      ...current,
      faqs: current.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)),
    }));
  };

  const handleAddReview = () => {
    setValues((current) =>
      current.reviews.length >= MAX_REVIEWS
        ? current
        : { ...current, reviews: [...current.reviews, { name: '', rating: 5, comment: '' }] }
    );
  };

  const handleRemoveReview = (index: number) => {
    setValues((current) => ({
      ...current,
      reviews: current.reviews.filter((_, i) => i !== index),
    }));
  };

  const handleReviewChange = (index: number, field: keyof ReviewValue, value: string | number) => {
    setValues((current) => ({
      ...current,
      reviews: current.reviews.map((review, i) => (i === index ? { ...review, [field]: value } : review)),
    }));
  };

  // Uploads each selected file in turn and appends it to the gallery. The first image in the
  // list is the main one (used on product cards and as the first slide).
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    setError('');
    const room = MAX_IMAGES - values.images.length;
    if (room <= 0) {
      setError(`You can add up to ${MAX_IMAGES} images per product.`);
      return;
    }
    if (files.length > room) {
      setError(`Only ${room} more image${room === 1 ? '' : 's'} can be added (max ${MAX_IMAGES}); extra files were skipped.`);
    }

    setIsUploadingImage(true);
    try {
      for (const image of files.slice(0, room)) {
        const formData = new FormData();
        formData.append('image', image);

        const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to upload image.');
        }

        setValues((current) => ({ ...current, images: [...current.images, data.path] }));
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageRemove = (index: number) => {
    setValues((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }));
  };

  const handleImageMove = (index: number, direction: -1 | 1) => {
    setValues((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.images.length) return current;
      const images = [...current.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!values.category) {
      setError('Please select a category.');
      return;
    }

    const packagingSizes = values.packagingSizes
      .filter((size) => size.label.trim() || size.actualPrice.toString().trim())
      .map((size) => ({
        label: size.label.trim(),
        actualPrice: Number(size.actualPrice),
        discountedPrice:
          size.discountedPrice !== '' && size.discountedPrice !== undefined && size.discountedPrice !== null
            ? Number(size.discountedPrice)
            : undefined,
        stock: Number(size.stock || 0),
      }));

    // Mirrors the server-side zod checks in app/api/admin/products/route.ts — checked here too
    // so the admin gets immediate feedback instead of waiting on a round-trip.
    for (const size of packagingSizes) {
      const label = size.label || '(unlabeled size)';

      if (!size.label) {
        setError('Each packaging size needs a label.');
        return;
      }
      if (!(size.actualPrice > 0)) {
        setError(`Enter an actual price greater than 0 for size "${label}".`);
        return;
      }
      if (size.discountedPrice !== undefined && size.discountedPrice >= size.actualPrice) {
        setError(`Discounted price for size "${label}" must be less than its actual price.`);
        return;
      }
      if (!Number.isInteger(size.stock) || size.stock < 0) {
        setError(`Enter a valid stock quantity (0 or more) for size "${label}".`);
        return;
      }
    }

    // Drop a row only if it's entirely blank (never added to, or added then left empty) — same
    // "skip fully-empty rows" convention as packagingSizes above.
    const faqs = values.faqs
      .filter((faq) => faq.question.trim() || faq.answer.trim())
      .map((faq) => ({ question: faq.question.trim(), answer: faq.answer }));

    for (const faq of faqs) {
      if (!faq.question) {
        setError('Each FAQ needs a question.');
        return;
      }
    }

    // Skip fully-blank rows; a started review needs a name and a comment.
    const reviews = values.reviews
      .filter((review) => review.name.trim() || review.comment.trim())
      .map((review) => ({ name: review.name.trim(), rating: review.rating, comment: review.comment.trim() }));

    for (const review of reviews) {
      if (!review.name || !review.comment) {
        setError('Each review needs a reviewer name and a comment.');
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      name: values.name,
      slug: values.slug || slugPreview,
      category: values.category,
      brand: values.brand,
      price: Number(values.price),
      discountPrice: values.discountPrice ? Number(values.discountPrice) : undefined,
      stock: Number(values.stock),
      description: values.description,
      keyFeatures: values.keyFeatures,
      faqs,
      reviews,
      images: values.images,
      isActive: Boolean(values.isActive),
      packagingSizes,
    };

    const response = await fetch(mode === 'create' ? '/api/admin/products' : `/api/admin/products/${productId}`, {
      method: mode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.error || 'Failed to save product.');
      setIsSubmitting(false);
      return;
    }

    router.push('/admin/products');
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
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Category</label>
          <select name="category" value={values.category} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2">
            <option value="">— Select a category —</option>
            {isLegacyCategoryValue && (
              <option value={values.category}>{values.category} (legacy value — pick a category to replace it)</option>
            )}
            {categoryOptions.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name}
              </option>
            ))}
          </select>
          {categoriesLoaded && categoryOptions.length === 0 && !isLegacyCategoryValue ? (
            <p className="mt-1 text-xs text-error">
              No active categories yet — add one under Categories before creating a product.
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Brand</label>
          <BrandCombobox
            value={values.brand}
            onChange={handleBrandChange}
            options={brandOptions}
            onBrandCreated={handleBrandCreated}
            optionsLoaded={brandsLoaded}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Price</label>
          <input type="number" name="price" value={values.price} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Discount Price</label>
          <input type="number" name="discountPrice" value={values.discountPrice} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-500">Stock</label>
          <input type="number" name="stock" value={values.stock} onChange={handleChange} className="w-full rounded-2xl border border-divider px-3 py-2" />
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
          <label className="block text-sm font-semibold text-brand-500">Packaging Sizes</label>
          <button
            type="button"
            onClick={handleAddSize}
            className="rounded-full border border-divider px-3 py-1 text-sm font-semibold text-brand-500 transition hover:bg-brand-50"
          >
            + Add Size
          </button>
        </div>
        <p className="mb-3 text-sm text-secondary">
          Optional. Leave empty for products without size options — the base price above applies as usual.
        </p>

        {values.packagingSizes.length > 0 ? (
          <div className="space-y-3">
            {values.packagingSizes.map((size, index) => (
              <div key={index} className="grid gap-3 rounded-2xl border border-divider p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-500">Label</label>
                  <input
                    type="text"
                    value={size.label}
                    onChange={(event) => handleSizeChange(index, 'label', event.target.value)}
                    placeholder="e.g. 1kg"
                    className="w-full rounded-2xl border border-divider px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-500">Actual Price</label>
                  <input
                    type="number"
                    min="0"
                    value={size.actualPrice}
                    onChange={(event) => handleSizeChange(index, 'actualPrice', event.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border border-divider px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-500">Discounted Price</label>
                  <input
                    type="number"
                    min="0"
                    value={size.discountedPrice}
                    onChange={(event) => handleSizeChange(index, 'discountedPrice', event.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-2xl border border-divider px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-500">Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={size.stock}
                    onChange={(event) => handleSizeChange(index, 'stock', event.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border border-divider px-3 py-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSize(index)}
                  className="h-fit rounded-full border border-divider px-3 py-2 text-sm font-medium text-error transition hover:bg-error/10 sm:self-end"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500">Description</label>
        <RichTextEditor
          value={values.description}
          onChange={(html) => setValues((current) => ({ ...current, description: html }))}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500">Key Features</label>
        <p className="mb-3 text-sm text-secondary">
          Optional. Shown as its own section on the product page — leave empty to hide it.
        </p>
        <RichTextEditor
          value={values.keyFeatures}
          onChange={(html) => setValues((current) => ({ ...current, keyFeatures: html }))}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-semibold text-brand-500">FAQs</label>
          <button
            type="button"
            onClick={handleAddFaq}
            className="rounded-full border border-divider px-3 py-1 text-sm font-semibold text-brand-500 transition hover:bg-brand-50"
          >
            + Add FAQ
          </button>
        </div>
        <p className="mb-3 text-sm text-secondary">
          Optional. Leave empty to hide the FAQs section on the product page.
        </p>

        {values.faqs.length > 0 ? (
          <div className="space-y-3">
            {values.faqs.map((faq, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-divider p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold text-brand-500">Question</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(event) => handleFaqChange(index, 'question', event.target.value)}
                      placeholder="e.g. How long does delivery take?"
                      className="w-full rounded-2xl border border-divider px-3 py-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(index)}
                    className="mt-6 h-fit rounded-full border border-divider px-3 py-2 text-sm font-medium text-error transition hover:bg-error/10"
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-500">Answer</label>
                  <RichTextEditor
                    value={faq.answer}
                    onChange={(html) => handleFaqChange(index, 'answer', html)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-semibold text-brand-500">
            Customer Reviews ({values.reviews.length}/{MAX_REVIEWS})
          </label>
          <button
            type="button"
            onClick={handleAddReview}
            disabled={values.reviews.length >= MAX_REVIEWS}
            className="rounded-full border border-divider px-3 py-1 text-sm font-semibold text-brand-500 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Review
          </button>
        </div>
        <p className="mb-3 text-sm text-secondary">
          Optional. Up to {MAX_REVIEWS} reviews per product, shown on the product page. Leave empty to hide the
          Reviews section.
        </p>

        {values.reviews.length > 0 ? (
          <div className="space-y-3">
            {values.reviews.map((review, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-divider p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold text-brand-500">Reviewer name</label>
                    <input
                      type="text"
                      value={review.name}
                      maxLength={80}
                      onChange={(event) => handleReviewChange(index, 'name', event.target.value)}
                      placeholder="e.g. Ayesha K."
                      className="w-full rounded-2xl border border-divider px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-brand-500">Rating</label>
                    <select
                      value={review.rating}
                      onChange={(event) => handleReviewChange(index, 'rating', Number(event.target.value))}
                      className="rounded-2xl border border-divider px-3 py-2"
                    >
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <option key={stars} value={stars}>
                          {stars} {stars === 1 ? 'star' : 'stars'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveReview(index)}
                    className="mt-6 h-fit rounded-full border border-divider px-3 py-2 text-sm font-medium text-error transition hover:bg-error/10"
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-brand-500">Comment</label>
                  <textarea
                    value={review.comment}
                    maxLength={600}
                    rows={3}
                    onChange={(event) => handleReviewChange(index, 'comment', event.target.value)}
                    placeholder="What the customer said about this product"
                    className="w-full rounded-2xl border border-divider px-3 py-2"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-brand-500" htmlFor="image">
          Product Images ({values.images.length}/{MAX_IMAGES})
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          multiple
          disabled={isUploadingImage || values.images.length >= MAX_IMAGES}
          onChange={handleImageChange}
          className="w-full rounded-2xl border border-divider px-3 py-2 disabled:opacity-60"
        />
        <p className="mt-1 text-xs text-secondary">
          Select one or more images. They appear as a slider on the product page; the first image is the main one.
        </p>
        {isUploadingImage ? <p className="mt-2 text-sm text-secondary">Uploading images...</p> : null}
        {values.images.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-3">
            {values.images.map((image, index) => (
              <div key={`${image}-${index}`} className="w-24">
                <div className="relative">
                  <Image
                    src={image}
                    alt={`Product image ${index + 1}`}
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 rounded-2xl border border-divider object-cover"
                  />
                  {index === 0 ? (
                    <span className="absolute left-1 top-1 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-surface">
                      Main
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => handleImageMove(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move image ${index + 1} earlier`}
                    className="rounded-full border border-divider px-2 text-sm disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="rounded-full border border-divider px-2 text-sm text-error"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageMove(index, 1)}
                    disabled={index === values.images.length - 1}
                    aria-label={`Move image ${index + 1} later`}
                    className="rounded-full border border-divider px-2 text-sm disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <button type="submit" disabled={isSubmitting || isUploadingImage} className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90 disabled:opacity-70">
        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
      </button>
    </form>
  );
}
