'use client';

export type PackagingSize = {
  label: string;
  actualPrice: number;
  discountedPrice?: number;
  stock: number;
};

type SizeSelectorProps = {
  sizes: PackagingSize[];
  selectedLabel: string | null;
  onSelect: (label: string) => void;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);
}

// Distinct from VariantSelector.tsx (which drives the older, unused `variants` field) — this
// one is purpose-built for packagingSizes: shows price per pill and disables out-of-stock sizes.
export default function SizeSelector({ sizes, selectedLabel, onSelect }: SizeSelectorProps) {
  if (sizes.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-2 font-display text-lg text-brand-500">Size</h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = selectedLabel === size.label;
          const isOutOfStock = size.stock <= 0;
          // Same discount pattern used at the base-product level (e.g. ProductCard) — a
          // discountedPrice only counts as an actual discount if it's set and lower than the
          // actual price.
          const hasDiscount = typeof size.discountedPrice === 'number' && size.discountedPrice < size.actualPrice;
          const displayPrice = hasDiscount ? size.discountedPrice! : size.actualPrice;

          return (
            <button
              key={size.label}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelect(size.label)}
              aria-pressed={isSelected}
              className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                isOutOfStock
                  ? 'cursor-not-allowed border-divider bg-brand-50/50 text-secondary/40 line-through'
                  : isSelected
                    ? 'border-brand-500 bg-brand-500 text-surface'
                    : 'border-divider bg-brand-50 text-secondary hover:border-brand-500/30'
              }`}
            >
              {size.label} — Rs. {formatPrice(displayPrice)}
              {hasDiscount && !isOutOfStock ? (
                <span className="ml-1.5 text-xs opacity-70 line-through">Rs. {formatPrice(size.actualPrice)}</span>
              ) : null}
              {isOutOfStock ? ' (Out of Stock)' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
