'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap } from 'lucide-react';
import { BUY_NOW_CHECKOUT_URL, saveBuyNowItem } from '@/lib/buy-now';
import { useCart } from '@/lib/cart-context';
import { stripDescriptionHtml } from '@/lib/sanitize-html';

type ProductCardProps = {
  product: {
    _id: string;
    slug: string;
    name: string;
    brand?: string;
    price: number;
    discountPrice?: number;
    images?: string[];
    description?: string;
    category?: string;
    variants?: { label: string }[];
  };
};

function formatLabel(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const router = useRouter();

  const hasDiscount = Boolean(
    product.discountPrice && product.discountPrice < product.price
  );

  const displayPrice = product.discountPrice ?? product.price;

  // Description may now contain rich text HTML (bold/lists/paragraphs) from the admin editor â€”
  // not appropriate for a line-clamped card preview, so it's reduced to plain text here rather
  // than risking raw tags or a broken partial tag when clamped.
  const plainDescription = product.description ? stripDescriptionHtml(product.description) : '';

  const badges = [
    product.category ? formatLabel(product.category) : null,
    product.brand || null,
    ...(product.variants?.map((variant) => variant.label) ?? []),
  ]
    .filter(
      (badge, index, all): badge is string =>
        Boolean(badge) && all.indexOf(badge) === index
    )
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem({
      productId: String(product._id),
      slug: product.slug,
      name: product.name,
      price: displayPrice,
      image: product.images?.[0] || null,
      variantLabel: null,
      quantity: 1,
    });
  };

  const handleBuyNow = () => {
    saveBuyNowItem({
      productId: String(product._id),
      slug: product.slug,
      name: product.name,
      price: displayPrice,
      image: product.images?.[0] || null,
      variantLabel: null,
      quantity: 1,
    });
    router.push(BUY_NOW_CHECKOUT_URL);
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-[0_12px_30px_-24px_rgba(14,124,134,0.7)]">

      <Link href={`/products/${product.slug}`} className="block">

        {/* Image */}
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-t-2xl border border-divider bg-brand-50">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="rounded-xl bg-brand-100 px-4 py-2 text-sm text-secondary">
              No image
            </span>
          )}
        </div>

        {/* Product information */}
        <div className="bg-surface px-4 pt-4">

          {/* Product name â€” clamped to 2 lines and given a matching min-height, so a
              one-line title still reserves the same vertical space as a two-line title and
              everything below (badges, description, price) starts at the same position
              across cards in a row. */}
          <h2 className="line-clamp-2 min-h-[3.5rem] font-display text-xl font-bold text-foreground">
            {product.name}
          </h2>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-semibold text-accent-600"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mt-2 h-10">
            {plainDescription && (
              <p className="line-clamp-2 text-sm leading-5 text-secondary">
                {plainDescription}
              </p>
            )}
          </div>

        </div>
      </Link>

      {/* Price + Add to Cart â€” mt-auto pins this to the bottom of the card regardless of how
          tall the title/badges/description above it end up, so it lines up across every card
          in a grid row. */}
      <div className="mt-auto bg-surface px-4 pb-4 pt-3">
        {/* Price on its own row, then the Add to Cart / Buy Now buttons side by side below it
            (wrapping onto two lines only if the card is too narrow for both). */}
        <div className="flex flex-col gap-3">

          {/* Price group â€” current price and strikethrough original price always stay
              together and fully visible. */}
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">

            {/* Current price */}
            <p className={`text-lg font-bold ${hasDiscount ? 'text-error' : 'text-brand-500'}`}>
              Rs. {formatPrice(displayPrice)}
            </p>

            {/* Original price */}
            {hasDiscount && (
              <span className="text-xs text-secondary/60 line-through">
                Rs. {formatPrice(product.price)}
              </span>
            )}

          </div>

          <div className="flex flex-wrap gap-2">
            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex min-w-[7.5rem] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-brand-500 px-3 py-2 text-sm font-semibold text-surface shadow-sm transition hover:opacity-90"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>

            {/* Buy Now â€” checks out just this product, cart untouched (see lib/buy-now.ts) */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex min-w-[7.5rem] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-brand-500 bg-surface px-3 py-[0.375rem] text-sm font-semibold text-brand-500 transition hover:bg-brand-50"
            >
              <Zap className="h-4 w-4" />
              Buy Now
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}