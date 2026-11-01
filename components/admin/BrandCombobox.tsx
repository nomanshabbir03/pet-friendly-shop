'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { slugifyBrand } from '@/constants/brands';

export type BrandOption = {
  _id: string;
  name: string;
  slug: string;
};

type BrandComboboxProps = {
  // Slug stored on the product (Product.brand stays a plain string — see lib/models/Product.ts;
  // this component doesn't change that, it only changes how the value is picked).
  value: string;
  onChange: (slug: string) => void;
  options: BrandOption[];
  // Called after a brand is created inline so the parent form can add it to its own `options`
  // list — the new brand is now a real row in the Brand collection, same as one created through
  // the standalone Brand management form (components/admin/BrandForm.tsx).
  onBrandCreated: (brand: BrandOption) => void;
  optionsLoaded: boolean;
};

// Searchable "select or add new" combobox for the product form's Brand field. No new
// dependency — package.json has no react-select/downshift/headlessui/radix installed, so this
// is a small hand-rolled combobox using existing patterns already in this codebase (e.g. the
// Category "Category" mega-menu's own hover/click dropdown in components/Navbar.tsx).
export default function BrandCombobox({ value, onChange, options, onBrandCreated, optionsLoaded }: BrandComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the input text in sync with the selected value — resolves the stored slug to its
  // brand's display name once options have loaded. A slug that doesn't match any brand (e.g. a
  // product saved before this combobox existed) falls back to showing the raw stored value, so
  // editing the product doesn't silently blank or change it.
  useEffect(() => {
    if (!optionsLoaded) return;
    if (!value) {
      setQuery('');
      return;
    }
    const matched = options.find((option) => option.slug === value);
    setQuery(matched ? matched.name : value);
  }, [value, options, optionsLoaded]);

  const trimmedQuery = query.trim();

  const filteredOptions = useMemo(() => {
    if (!trimmedQuery) return options;
    const lower = trimmedQuery.toLowerCase();
    return options.filter((option) => option.name.toLowerCase().includes(lower));
  }, [options, trimmedQuery]);

  const exactMatch = useMemo(
    () => options.find((option) => option.name.toLowerCase() === trimmedQuery.toLowerCase()) ?? null,
    [options, trimmedQuery]
  );

  const showCreateOption = Boolean(trimmedQuery) && !exactMatch;

  const selectBrand = (option: BrandOption) => {
    onChange(option.slug);
    setQuery(option.name);
    setIsOpen(false);
    setError('');
  };

  const selectNone = () => {
    onChange('');
    setQuery('');
    setIsOpen(false);
    setError('');
  };

  const handleCreate = async () => {
    if (!trimmedQuery) return;

    // Duplicate guard: if the typed name already matches an existing brand (case-insensitive),
    // select it instead of creating a duplicate. showCreateOption already excludes this case,
    // but this is a cheap extra safety net (e.g. if `options` was momentarily stale).
    const existing = options.find((option) => option.name.toLowerCase() === trimmedQuery.toLowerCase());
    if (existing) {
      selectBrand(existing);
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Reuses the exact same admin Brand creation endpoint/model as the standalone Brand
      // management form — no duplicated creation logic. logoUrl is intentionally omitted; it's
      // optional now (see lib/models/Brand.ts) specifically for this inline flow.
      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedQuery }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create brand.');
      }

      const created: BrandOption = {
        _id: data.data._id,
        name: data.data.name,
        slug: slugifyBrand(data.data.name),
      };

      onBrandCreated(created);
      selectBrand(created);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create brand.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredOptions.length > 0) {
        selectBrand(filteredOptions[0]);
      } else if (showCreateOption) {
        handleCreate();
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleBlur = () => {
    // Delay so a click on a dropdown option (mousedown fires before blur) still registers
    // before we close and reset the input text.
    window.setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        const matched = options.find((option) => option.slug === value);
        setQuery(matched ? matched.name : value || '');
      }
    }, 150);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          setError('');
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Select or type a new brand..."
        className="w-full rounded-2xl border border-divider px-3 py-2"
      />

      {isOpen && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-2xl border border-divider bg-surface p-1 shadow-lg">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={selectNone}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-secondary transition hover:bg-brand-50"
          >
            — No brand —
          </button>

          {filteredOptions.map((option) => (
            <button
              key={option._id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectBrand(option)}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-brand-50 ${
                option.slug === value ? 'font-semibold text-brand-500' : 'text-foreground'
              }`}
            >
              {option.name}
            </button>
          ))}

          {filteredOptions.length === 0 && !showCreateOption ? (
            <p className="px-3 py-2 text-sm text-secondary/70">No matching brands.</p>
          ) : null}

          {showCreateOption ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleCreate}
              disabled={isCreating}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-brand-500 transition hover:bg-brand-50 disabled:opacity-60"
            >
              {isCreating ? 'Creating...' : `+ Add "${trimmedQuery}" as new brand`}
            </button>
          ) : null}
        </div>
      )}

      {error ? <p className="mt-1 text-xs text-error">{error}</p> : null}
    </div>
  );
}
