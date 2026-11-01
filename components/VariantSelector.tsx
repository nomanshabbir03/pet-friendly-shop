'use client';

// UNUSED / SUPERSEDED by the packagingSizes feature (see SizeSelector.tsx and
// Product.packagingSizes in lib/models/Product.ts). Nothing in the admin form or admin product
// API ever populates Product.variants, so this component is currently dead code on real data.
// Left in place untouched rather than removed/refactored — do not build new features on it.

type Variant = {
  label: string;
  priceModifier?: number;
  stock?: number;
};

type VariantSelectorProps = {
  variants: Variant[];
  selectedVariant: string | null;
  onSelect: (value: string) => void;
};

export default function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-2 font-display text-lg text-brand-500">Variants</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant === variant.label;
          return (
            <button
              key={variant.label}
              type="button"
              onClick={() => onSelect(variant.label)}
              className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                isSelected
                  ? 'border-brand-500 bg-brand-500 text-surface'
                  : 'border-divider bg-brand-50 text-secondary hover:border-brand-500/30'
              }`}
            >
              {variant.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
