import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import HeroSlideModel from '@/lib/models/HeroSlide';
import ProductCard from '@/components/ProductCard';
import HeroSlider, { type HeroSlide } from '@/components/HeroSlider';
import CategoryGrid, { type CategoryItem } from '@/components/CategoryGrid';
import HowItWorks from '@/components/HowItWorks';
import BrandsSection from '@/components/BrandsSection';
import VeterinarySection from '@/components/VeterinarySection';
import FaqSection from '@/components/faqs/FaqSection';
import MostSellingProducts from '@/components/MostSellingProducts';
import TrustBar from '@/components/TrustBar';
import ProductRail from '@/components/ProductRail';
import { getLiveCategories } from '@/lib/category-data';
import { getVetServices } from '@/lib/vet-services';
import { getSiteSettings } from '@/lib/site-settings';

// Admin-managed via /admin/hero-slides (see lib/models/HeroSlide.ts). No hardcoded fallback
// slides — if zero are active, HeroSlider already renders nothing (slides.length === 0), so the
// section is simply hidden rather than showing stale/wrong hardcoded promo content.
async function getHeroSlides(): Promise<HeroSlide[]> {
  await connectDB();
  const slides = await HeroSlideModel.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

  return JSON.parse(JSON.stringify(slides)).map((slide: {
    _id: string;
    image: string;
    heading: string;
    subtext?: string;
    buttonText?: string;
    buttonLink?: string;
  }) => ({
    id: slide._id,
    title: slide.heading || undefined,
    subtitle: slide.subtext || undefined,
    image: slide.image,
    ctaLabel: slide.buttonText || undefined,
    ctaHref: slide.buttonLink || undefined,
  }));
}

type ProductCard = {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
  price: number;
  images?: string[];
};

// Capped at 12 — exactly 3 rows on the grid's desktop breakpoint (lg:grid-cols-4). Slightly
// more than 3 rows on tablet (3 cols) and mobile (2 cols), a simple fixed count rather than
// responsive-aware slicing per breakpoint. The full catalog is on /products (View More below).
const FEATURED_PRODUCTS_LIMIT = 12;

async function getProducts() {
  await connectDB();
  const products = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(FEATURED_PRODUCTS_LIMIT)
    .lean();
  return JSON.parse(JSON.stringify(products)); // safely convert Mongoose docs to plain objects
}

async function getMostSellingProducts() {
  await connectDB();
  const products = await Product.find({ isActive: true, isMostSelling: true })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(products)); // safely convert Mongoose docs to plain objects
}

// Products with a real discount (discountPrice set and below price) — the "Sale" row. Hidden
// automatically when none are discounted.
async function getDealProducts() {
  await connectDB();
  const products = await Product.find({
    isActive: true,
    $expr: { $and: [{ $gt: ['$discountPrice', 0] }, { $lt: ['$discountPrice', '$price'] }] },
  })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();
  return JSON.parse(JSON.stringify(products)); // safely convert Mongoose docs to plain objects
}

const shopByPet = [
  { slug: 'dog', label: 'Dogs', emoji: '🐶', tint: 'bg-brand-100' },
  { slug: 'cat', label: 'Cats', emoji: '🐱', tint: 'bg-brand-100' },
  { slug: 'bird', label: 'Birds', emoji: '🐦', tint: 'bg-brand-100' },
  { slug: 'fish', label: 'Fish', emoji: '🐠', tint: 'bg-brand-100' },
  { slug: 'small-pet', label: 'Small Pets', emoji: '🐹', tint: 'bg-brand-100' },
];

export default async function Home() {
  const products = await getProducts();
  const mostSellingProducts = await getMostSellingProducts();
  const dealProducts = await getDealProducts();
  const liveCategories = await getLiveCategories();
  const heroSlides = await getHeroSlides();
  const vetServices = await getVetServices();
  const siteSettings = await getSiteSettings();

  const categoryItems: CategoryItem[] = liveCategories.map((category) => ({
    name: category.name,
    productCount: category.productCount,
    image: category.image,
    href: `/category/${category.slug}`,
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-2 lg:mb-8">
        <HeroSlider slides={heroSlides} />
      </div>

      <CategoryGrid categories={categoryItems} />

      {/* <section className="rounded-[28px] bg-gradient-to-br from-brand-500 via-brand-300 to-brand-100 p-6 text-surface shadow-sm sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-surface/10 px-3 py-1 text-sm font-medium text-surface/90">
              Fresh picks for every pet
            </p>
            <h1 className="font-display text-3xl leading-tight text-surface sm:text-4xl">
              Everything your pet needs, delivered
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-surface/90 sm:text-base">
              Shop food, toys, grooming, and everyday essentials in one place.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/category/dog"
                className="inline-flex rounded-full bg-surface px-6 py-3 text-sm font-semibold text-brand-500 transition hover:bg-brand-50"
              >
                Explore top picks
              </Link>
              <Link
                href="/category/cat"
                className="inline-flex rounded-full border border-white/60 bg-transparent px-6 py-3 text-sm font-semibold text-surface transition hover:bg-surface/10"
              >
                Shop for cats
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-surface/10 p-4 shadow-sm backdrop-blur-sm">
            <div className="rounded-2xl bg-surface p-4 text-sm text-secondary">
              <p className="font-semibold text-foreground">Today’s favourites</p>
              <ul className="mt-3 space-y-2">
                <li>• Premium treats for happy tails</li>
                <li>• Comfortable beds and cosy toys</li>
                <li>• Daily essentials for cats, birds, and small pets</li>
              </ul>
            </div>
          </div>
        </div>
      </section> */}

      {/* <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-brand-500">Shop by Pet</h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-5">
          {shopByPet.map((item) => (
            <Link
              key={item.slug}
              href={`/category/${item.slug}`}
              className={`flex min-w-[150px] flex-col items-start rounded-2xl border border-divider p-4 transition hover:-translate-y-0.5 hover:shadow-md ${item.tint}`}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="mt-4 font-display text-lg text-brand-500">{item.label}</span>
            </Link>
          ))}
        </div>
      </section> */}

      <ProductRail eyebrow="Limited time" title="Sale & Deals" href="/products" products={dealProducts} />

      <MostSellingProducts products={mostSellingProducts} />

      <HowItWorks />

      <BrandsSection />

      <section className="mt-8 lg:mt-12">
        <div className="mb-4 lg:mb-10 lg:text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500 lg:text-sm">
            Hand-picked for you
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-foreground lg:mt-3 lg:text-4xl">Featured Products</h2>
          <span className="mx-auto mt-4 hidden h-1 w-16 rounded-full bg-brand-500 lg:block" />
        </div>

        {products.length === 0 ? (
          <p className="rounded-2xl border border-divider bg-surface p-6 text-secondary">No products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product: ProductCard) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* "Featured Products" here is a preview of the general catalog (newest active
            products, capped at FEATURED_PRODUCTS_LIMIT) rather than a curated/flagged subset
            like Best Sellers, so View More always makes sense — there's always a fuller catalog
            to browse on /products, even if this preview itself has fewer than 12 items. */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/products"
            className="inline-flex rounded-full bg-brand-500 px-5 py-3 font-semibold text-surface transition hover:opacity-90"
          >
            View More
          </Link>
        </div>
      </section>

      <TrustBar />

      <VeterinarySection services={vetServices} whatsappNumber={siteSettings.whatsappNumber} />

      <FaqSection compact />
    </main>
  );
}
