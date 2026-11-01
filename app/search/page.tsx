import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import ProductCard from '@/components/ProductCard';

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

type ProductCard = {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
  price: number;
  images?: string[];
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function searchProducts(query: string) {
  if (!query) {
    return [];
  }

  await connectDB();

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: escapeRegex(query), $options: 'i' } },
      { brand: { $regex: escapeRegex(query), $options: 'i' } },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(products)) as ProductCard[];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery?.trim() || '';
  const products = await searchProducts(query);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-brand-500">Search</h1>
      <p className="mb-6 mt-2 text-secondary/70">
        {query ? `Results for "${query}"` : 'Enter a search term to find products.'}
      </p>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-divider bg-surface p-6 text-secondary/70">
          {query ? 'No matching products found.' : 'No search term provided.'}
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
