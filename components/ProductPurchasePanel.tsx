'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap } from 'lucide-react';
import { BUY_NOW_CHECKOUT_URL, saveBuyNowItem } from '@/lib/buy-now';
import SizeSelector, { type PackagingSize } from '@/components/SizeSelector';
import { useCart } from '@/lib/cart-context';
import MobileBuyBar from '@/components/MobileBuyBar';

type ProductPurchasePanelProps = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  packagingSizes: PackagingSize[];
  // Rendered between the price/stock block and the size-selector/Add to Cart block — lets the
  // page keep its description block in the exact same visual slot as the no-sizes code path.
  children?: React.ReactNode;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);
}

// Renders the price/stock block + size selector + quantity + Add to Cart for products that
// have packagingSizes. Only ever mounted when packagingSizes.length > 0 (see
// app/products/[slug]/page.tsx) — the no-sizes path keeps rendering its original static JSX
// and AddToCartButton untouched.
export default function ProductPurchasePanel({ productId, slug, name, image, packagingSizes, children }: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const firstInStock = packagingSizes.find((size) => size.stock > 0) ?? null;
  const [selectedLabel, setSelectedLabel] = useState<string | null>(firstInStock?.label ?? null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');

  const selectedSize = packagingSizes.find((size) => size.label === selectedLabel) ?? null;
  const allOutOfStock = packagingSizes.every((size) => size.stock <= 0);
  const selectedInStock = Boolean(selectedSize && selectedSize.stock > 0);

  // Same discount pattern used at the base-product level — resolve the size's discounted price
  // if it's set and actually lower than the actual price, otherwise the actual price.
  const hasDiscount = Boolean(selectedSize?.discountedPrice && selectedSize.discountedPrice < selectedSize.actualPrice);
  const displayPrice = selectedSize
    ? hasDiscount
      ? selectedSize.discountedPrice!
      : selectedSize.actualPrice
    : (packagingSizes[0]?.actualPrice ?? 0);
  const canAddToCart = selectedInStock;

  const handleQuantityChange = (delta: number) => {
    setQuantity((current) => Math.max(1, current + delta));
  };

  const handleAddToCart = () => {
    if (!selectedSize || selectedSize.stock <= 0) return;

    // The price carried into the cart/order is the size's discounted price if it's on
    // discount, otherwise its actual price — same resolution used for `displayPrice` above.
    const resolvedPrice =
      selectedSize.discountedPrice && selectedSize.discountedPrice < selectedSize.actualPrice
        ? selectedSize.discountedPrice
        : selectedSize.actualPrice;

    addItem({
      productId,
      slug,
      name,
      price: resolvedPrice,
      image,
      variantLabel: selectedSize.label,
      quantity,
    });

    setFeedback('Added to cart');
    window.setTimeout(() => setFeedback(''), 2000);
  };

  // Checks out just this product (not added to the cart) — see lib/buy-now.ts.
  const handleBuyNow = () => {
    if (!selectedSize || selectedSize.stock <= 0) return;

    saveBuyNowItem({
      productId,
      slug,
      name,
      price: displayPrice,
      image,
      variantLabel: selectedSize.label,
      quantity,
    });
    router.push(BUY_NOW_CHECKOUT_URL);
  };

  return (
    <>
      <div className="rounded-2xl border border-divider bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <p className={`text-2xl font-bold ${hasDiscount ? 'text-error' : 'text-brand-500'}`}>Rs. {formatPrice(displayPrice)}</p>
          {hasDiscount && selectedSize ? (
            <>
              <span className="text-secondary/60 line-through">Rs. {formatPrice(selectedSize.actualPrice)}</span>
              <span className="rounded-full bg-brand-500/15 px-3 py-1 text-sm font-medium text-brand-500">
                Save {formatPrice(selectedSize.actualPrice - (selectedSize.discountedPrice || selectedSize.actualPrice))}
              </span>
            </>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {allOutOfStock ? (
            <>
              <p className="font-medium text-red-600">Out of Stock</p>
              <span className="rounded-full bg-error/20 px-3 py-1 text-sm font-semibold text-error">
                Out of stock
              </span>
            </>
          ) : (
            <p className={`font-medium ${selectedInStock ? 'text-green-600' : 'text-red-600'}`}>
              {selectedInStock ? 'In Stock' : 'Select a size'}
            </p>
          )}
        </div>
      </div>

      {children}

      <div className="rounded-2xl border border-divider bg-surface p-4 shadow-sm">
        <div className="space-y-4">
          <SizeSelector sizes={packagingSizes} selectedLabel={selectedLabel} onSelect={setSelectedLabel} />

          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-lg border border-divider bg-surface">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-2 text-lg font-semibold text-text-secondary"
                  >
                    -
                  </button>
                  <span className="min-w-10 text-center font-semibold text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-2 text-lg font-semibold text-text-secondary"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {allOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canAddToCart}
                  className="flex items-center gap-2 rounded-full border-2 border-brand-500 bg-surface px-4 py-2 font-semibold text-brand-500 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  Buy Now
                </button>
              </div>

              {feedback ? <p className="text-sm font-medium text-brand-700">{feedback}</p> : null}
            </div>
          </div>
        </div>
      </div>

      <MobileBuyBar
        price={displayPrice}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        disabled={!canAddToCart}
        added={Boolean(feedback)}
      />
    </>
  );
}
