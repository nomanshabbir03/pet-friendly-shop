import ProductCard from '@/components/ProductCard';

type RelatedProduct = {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  images?: string[];
};

type RelatedProductsProps = {
  products: RelatedProduct[];
};

// Shown on the product detail page, below the main product info — other products in the same
// category as the one being viewed. Same grid pattern as MostSellingProducts (components/
// MostSellingProducts.tsx) for visual consistency. Hidden entirely when fewer than 2 related
// products exist, so it never renders a near-empty row.
export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length < 2) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-brand-500">Related Products</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
