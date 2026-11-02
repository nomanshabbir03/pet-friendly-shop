import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

type ProductRailProps = {
  eyebrow: string;
  title: string;
  href?: string;
  products: React.ComponentProps<typeof ProductCard>['product'][];
};

// Homepage product section: a horizontal swipe row on mobile, the usual 4-column grid on lg.
// Mobile header is left-aligned with a "View all" link; lg keeps the centered desktop header.
export default function ProductRail({ eyebrow, title, href, products }: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-8 lg:mt-12">
      <div className="mb-4 flex items-end justify-between gap-3 lg:mb-10 lg:block lg:text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500 lg:text-sm">{eyebrow}</p>
          <h2 className="mt-1 font-display text-xl font-bold text-foreground lg:mt-3 lg:text-4xl">{title}</h2>
          <span className="mx-auto mt-4 hidden h-1 w-16 rounded-full bg-brand-500 lg:block" />
        </div>

        {href && (
          <Link href={href} className="shrink-0 text-sm font-semibold text-brand-500 lg:hidden">
            View all →
          </Link>
        )}
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {products.map((product) => (
          <div key={product._id} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {href && (
        <div className="mt-8 hidden justify-center lg:flex">
          <Link
            href={href}
            className="inline-flex rounded-full bg-brand-500 px-5 py-3 font-semibold text-surface transition hover:opacity-90"
          >
            View More
          </Link>
        </div>
      )}
    </section>
  );
}
