import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Best Sellers | Pet’s Friendly Shop',
  description: 'Our most loved products at Pet’s Friendly Shop — the favourites customers keep coming back for.',
};

type ProductCard = {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
  price: number;
  images?: string[];
};

// "View More" destination from the homepage's Best Sellers section (components/MostSellingProducts.tsx).
async function getBestSellers() {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true, isMostSelling: true }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products)) as ProductCard[];
  } catch (error) {
    console.error('[GET /best-sellers] Failed to load products:', error);
    return [] as ProductCard[];
  }
}

export default async function BestSellersPage() {
  const products = await getBestSellers();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-brand-500">Best Sellers</h1>
      <p className="mt-2 text-secondary/70">Our most loved products, all in one place.</p>

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
