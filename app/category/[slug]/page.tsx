import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import ProductCard from '@/components/ProductCard';
import { getLiveCategories } from '@/lib/category-data';

type CategoryPageProps = {
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

// Fallback label for a slug that isn't (or is no longer) a managed Category — e.g. a direct
// link to an old/renamed category. The tab row itself only lists live, admin-managed
// categories (see lib/category-data.ts) — this is just for the page heading.
function formatCategoryName(category: string) {
  const label = category.replace(/-/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

async function getProductsByCategory(category: string) {
  await connectDB();

  const products = await Product.find({ category, isActive: true }).sort({ createdAt: -1 }).lean();

  return JSON.parse(JSON.stringify(products)) as ProductCard[];
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [products, liveCategories] = await Promise.all([getProductsByCategory(slug), getLiveCategories()]);
  const currentCategory = liveCategories.find((category) => category.slug === slug);
  const heading = currentCategory?.name ?? formatCategoryName(slug);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold uppercase text-brand-500">{heading}</h1>

      <div className="mb-6 mt-4 flex gap-3 overflow-x-auto pb-2">
        {liveCategories.map((category) => {
          const isActive = category.slug === slug;

          return (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-brand-500 bg-brand-500 text-surface'
                  : 'border-divider bg-brand-50 text-secondary hover:border-brand-500/70'
              }`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-divider bg-surface p-6 text-secondary/70">
          No products in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
