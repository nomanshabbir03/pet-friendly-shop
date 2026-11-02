'use client';

import { Check } from 'lucide-react';

type MobileBuyBarProps = {
  price: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled?: boolean;
  added?: boolean;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

// Product page, below lg only: price + Add to Cart + Buy Now pinned just above MobileBottomNav,
// so the buy buttons stay reachable while scrolling the description. Includes an in-flow spacer
// so the bar never covers the end of the page.
export default function MobileBuyBar({ price, onAddToCart, onBuyNow, disabled, added }: MobileBuyBarProps) {
  return (
    <>
      <div aria-hidden="true" className="h-16 lg:hidden" />

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[55] flex items-center gap-2 border-t border-divider bg-surface px-4 py-2.5 shadow-[0_-6px_24px_-16px_rgba(5,51,58,0.35)] lg:hidden">
        <p className="mr-auto whitespace-nowrap text-lg font-bold text-brand-500">Rs. {formatPrice(price)}</p>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={disabled}
          className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50 ${
            added ? 'bg-success' : 'bg-brand-500'
          }`}
        >
          {added && <Check className="h-4 w-4" strokeWidth={3} />}
          {added ? 'Added' : 'Add to Cart'}
        </button>

        <button
          type="button"
          onClick={onBuyNow}
          disabled={disabled}
          className="whitespace-nowrap rounded-full bg-warm-500 px-3.5 py-2.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>
    </>
  );
}
