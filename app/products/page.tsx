import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'All Products | Pet’s Friendly Shop',
  description: 'Browse the full Pet’s Friendly Shop catalog — food, toys, grooming, and everyday essentials for every pet.',
};

type ProductCard = {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
  price: number;
  images?: string[];
};

// Minimal all-products listing — the "View More" destination from the homepage's Featured
// Products section (app/page.tsx). Same simple pattern as the existing /search and
// /category/[slug] pages: one full grid, no pagination/filtering added here.
async function getAllProducts() {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products)) as ProductCard[];
  } catch (error) {
    // Previously uncaught: a failed/hung DB connection here (e.g. during an on-demand
    // revalidatePath('/products') regeneration on Vercel) threw with no log at all.
    console.error('[GET /products] Failed to load products:', error);
    return [] as ProductCard[];
  }
}

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-brand-500">All Products</h1>
      <p className="mt-2 text-secondary/70">Everything Pet’s Friendly Shop has in stock, in one place.</p>

      {products.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-divider bg-surface p-6 text-secondary/70">
          No products yet.
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
