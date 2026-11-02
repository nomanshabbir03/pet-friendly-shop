'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap } from 'lucide-react';
import VariantSelector from '@/components/VariantSelector';
import { BUY_NOW_CHECKOUT_URL, saveBuyNowItem } from '@/lib/buy-now';
import { useCart } from '@/lib/cart-context';
import MobileBuyBar from '@/components/MobileBuyBar';

type Variant = {
  label: string;
  priceModifier?: number;
  stock?: number;
};

type AddToCartButtonProps = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string | null;
  variants: Variant[];
  maxQuantity: number;
};

export default function AddToCartButton({
  productId,
  slug,
  name,
  price,
  discountPrice,
  image,
  variants,
  maxQuantity,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(variants[0]?.label || null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');

  const handleQuantityChange = (delta: number) => {
    setQuantity((current) => Math.min(maxQuantity, Math.max(1, current + delta)));
  };

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(''), 2000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const handleAddToCart = () => {
    const finalPrice = (discountPrice ?? price) + (variants.find((variant) => variant.label === selectedVariant)?.priceModifier ?? 0);

    addItem({
      productId,
      slug,
      name,
      price: finalPrice,
      image,
      variantLabel: selectedVariant,
      quantity,
    });

    setFeedback('Added to cart');
  };

  // Checks out just this product (not added to the cart) — see lib/buy-now.ts.
  const handleBuyNow = () => {
    saveBuyNowItem({
      productId,
      slug,
      name,
      price: (discountPrice ?? price) + (variants.find((variant) => variant.label === selectedVariant)?.priceModifier ?? 0),
      image,
      variantLabel: selectedVariant,
      quantity,
    });
    router.push(BUY_NOW_CHECKOUT_URL);
  };

  return (
    <div className="space-y-4">
      <VariantSelector variants={variants} selectedVariant={selectedVariant} onSelect={setSelectedVariant} />

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
          className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:bg-brand-600"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="flex items-center gap-2 rounded-full border-2 border-brand-500 bg-surface px-4 py-2 font-semibold text-brand-500 transition hover:bg-brand-50"
        >
          <Zap className="h-4 w-4" />
          Buy Now
        </button>
      </div>

      {feedback ? <p className="text-sm font-medium text-brand-700">{feedback}</p> : null}

      <MobileBuyBar
        price={(discountPrice ?? price) + (variants.find((variant) => variant.label === selectedVariant)?.priceModifier ?? 0)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        added={Boolean(feedback)}
      />
    </div>
  );
}
