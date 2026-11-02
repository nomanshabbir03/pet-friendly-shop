'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Plus, ShoppingBag, Zap } from 'lucide-react';
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

// How long the "added" check stays on the add-to-cart button before it reverts.
const ADDED_FEEDBACK_MS = 1500;

// Two layouts in one card, split at `lg`:
// - below lg (phones/tablets, 2–3 columns): compact — brand, 2-line title, price and a round
//   "+" button. No description/badges/Buy Now, so a phone shows several products per screen.
// - lg and up (laptop): the original full card — badges, description, Add to Cart + Buy Now.
// The discount badge and the "added" feedback apply to both.
export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;

    const timer = setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS);

    return () => clearTimeout(timer);
  }, [justAdded]);

  const hasDiscount = Boolean(
    product.discountPrice && product.discountPrice < product.price
  );

  const displayPrice = product.discountPrice ?? product.price;

  const discountPercent = hasDiscount
    ? Math.round((1 - displayPrice / product.price) * 100)
    : 0;

  // Description may contain rich text HTML (bold/lists/paragraphs) from the admin editor — not
  // appropriate for a line-clamped card preview, so it's reduced to plain text here rather than
  // risking raw tags or a broken partial tag when clamped.
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
    setJustAdded(true);
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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-divider bg-surface shadow-sm transition lg:border-0 lg:hover:-translate-y-1 lg:hover:shadow-[0_12px_30px_-24px_rgba(14,124,134,0.7)]">

      <Link href={`/products/${product.slug}`} className="block">

        {/* Image */}
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-brand-50 lg:rounded-t-2xl lg:border lg:border-divider">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
              className="object-contain p-2 transition duration-300 group-hover:scale-105 lg:p-0"
            />
          ) : (
            <span className="rounded-xl bg-brand-100 px-4 py-2 text-sm text-secondary">
              No image
            </span>
          )}

          {hasDiscount && discountPercent > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-warm-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm lg:left-3 lg:top-3 lg:px-2.5 lg:text-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Product information */}
        <div className="px-3 pt-3 lg:px-4 lg:pt-4">

          {/* Brand — mobile only; on lg it's one of the badges below */}
          {product.brand && (
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-brand-500 lg:hidden">
              {product.brand}
            </p>
          )}

          {/* Product name — clamped to 2 lines with a matching min-height, so a one-line title
              reserves the same space as a two-line one and everything below lines up across
              cards in a row. The leading is `!` because globals.css sets an unlayered
              `h1–h6 { line-height: 1.15 }` that otherwise beats Tailwind utilities — and a line
              height shorter than min-height/2 lets a clamped third line peek through. */}
          <h2 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5! text-foreground lg:mt-0 lg:min-h-[3.5rem] lg:font-display lg:text-xl lg:font-bold lg:leading-7!">
            {product.name}
          </h2>

          {/* Badges — lg only */}
          {badges.length > 0 && (
            <div className="mt-2 hidden flex-wrap gap-1.5 lg:flex">
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

          {/* Description — lg only */}
          <div className="mt-2 hidden h-10 lg:block">
            {plainDescription && (
              <p className="line-clamp-2 text-sm leading-5 text-secondary">
                {plainDescription}
              </p>
            )}
          </div>

        </div>
      </Link>

      {/* Price + actions — mt-auto pins this to the bottom of the card regardless of how tall
          the content above is, so it lines up across every card in a grid row. */}
      <div className="mt-auto px-3 pb-3 pt-2 lg:px-4 lg:pb-4 lg:pt-3">
        <div className="flex items-end justify-between gap-2 lg:flex-col lg:items-stretch lg:gap-3">

          {/* Price group — stacked on mobile (old price under), inline on lg */}
          <div className="min-w-0 lg:flex lg:items-baseline lg:gap-1.5">
            <p className={`whitespace-nowrap text-base font-bold leading-tight lg:text-lg ${hasDiscount ? 'text-error' : 'text-brand-500'}`}>
              Rs. {formatPrice(displayPrice)}
            </p>

            {hasDiscount && (
              <span className="block whitespace-nowrap text-[11px] text-secondary/60 line-through lg:inline lg:text-xs">
                Rs. {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Mobile — single round add-to-cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={justAdded ? 'Added to cart' : `Add ${product.name} to cart`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition active:scale-90 lg:hidden ${
              justAdded ? 'bg-success' : 'bg-brand-500'
            }`}
          >
            {justAdded ? <Check className="h-5 w-5" strokeWidth={3} /> : <Plus className="h-5 w-5" strokeWidth={2.5} />}
          </button>

          {/* lg — Add to Cart / Buy Now side by side (wrapping only if the card is too narrow) */}
          <div className="hidden flex-wrap gap-2 lg:flex">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex min-w-[7.5rem] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-surface shadow-sm transition hover:opacity-90 ${
                justAdded ? 'bg-success' : 'bg-brand-500'
              }`}
            >
              {justAdded ? <Check className="h-4 w-4" strokeWidth={3} /> : <ShoppingBag className="h-4 w-4" />}
              {justAdded ? 'Added' : 'Add to Cart'}
            </button>

            {/* Buy Now — checks out just this product, cart untouched (see lib/buy-now.ts) */}
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
