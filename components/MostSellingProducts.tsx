import ProductRail from '@/components/ProductRail';

// 12 = exactly 3 rows on the desktop grid (lg:grid-cols-4); the rest lives on /best-sellers.
const BEST_SELLERS_PREVIEW_LIMIT = 12;

type MostSellingProductsProps = {
  products: React.ComponentProps<typeof ProductRail>['products'];
};

// Homepage section for products flagged isMostSelling in the admin panel.
// Renders nothing when there are no flagged products, so it never shows an empty section.
export default function MostSellingProducts({ products }: MostSellingProductsProps) {
  return (
    <ProductRail
      eyebrow="Customer favourites"
      title="Best Sellers"
      href={products.length > BEST_SELLERS_PREVIEW_LIMIT ? '/best-sellers' : undefined}
      products={products.slice(0, BEST_SELLERS_PREVIEW_LIMIT)}
    />
  );
}
