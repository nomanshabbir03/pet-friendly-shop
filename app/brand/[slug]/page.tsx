import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import ProductCard from '@/components/ProductCard';
import { getBrandNameForSlug, slugifyBrand } from '@/constants/brands';

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

type ProductCard = {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
  price: number;
  images?: string[];
};

function formatSlugFallback(slug: string) {
  const label = slug.replace(/-/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Same shape as app/category/[slug]/page.tsx: fetch by the taxonomy field, reuse ProductCard.
// product.brand is a plain string (no schema change) — matching happens by normalizing both
// sides through slugifyBrand, so a dropdown-selected slug ("wanpy") and any legacy free-text
// value that happens to normalize the same way ("Wanpy") both resolve to this page.
async function getProductsByBrand(slug: string) {
  await connectDB();

  const products = await Product.find({ isActive: true, brand: { $exists: true, $ne: '' } })
    .sort({ createdAt: -1 })
    .lean();

  const matching = products.filter((product) => slugifyBrand(String(product.brand)) === slug);

  return JSON.parse(JSON.stringify(matching)) as ProductCard[];
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const products = await getProductsByBrand(slug);
  const brandName = getBrandNameForSlug(slug) ?? formatSlugFallback(slug);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-brand-500">{brandName}</h1>

      {products.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-divider bg-surface p-6 text-secondary/70">
          No products from this brand yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
