import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

// 12 = exactly 3 rows on the desktop grid (lg:grid-cols-4); the rest lives on /best-sellers.
const BEST_SELLERS_PREVIEW_LIMIT = 12;

type MostSellingProduct = {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
  price: number;
  images?: string[];
};

type MostSellingProductsProps = {
  products: MostSellingProduct[];
};

// Homepage section for products flagged isMostSelling in the admin panel.
// Renders nothing when there are no flagged products, so it never shows an empty section.
export default function MostSellingProducts({ products }: MostSellingProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
          Customer favourites
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">Best Sellers</h2>
        <span className="mx-auto mt-4 block h-1 w-16 rounded-full bg-brand-500" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.slice(0, BEST_SELLERS_PREVIEW_LIMIT).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {products.length > BEST_SELLERS_PREVIEW_LIMIT && (
        <div className="mt-8 flex justify-center">
          <Link
            href="/best-sellers"
            className="inline-flex rounded-full bg-brand-500 px-5 py-3 font-semibold text-surface transition hover:opacity-90"
          >
            View More
          </Link>
        </div>
      )}
    </section>
  );
}
