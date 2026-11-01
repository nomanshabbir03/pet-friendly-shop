import Image from 'next/image';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Brand from '@/lib/models/Brand';
import { slugifyBrand } from '@/constants/brands';

type BrandItem = {
  _id: string;
  name: string;
  logoUrl?: string;
};

async function getBrands(): Promise<BrandItem[]> {
  await connectDB();
  const brands = await Brand.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(brands));
}

export default async function BrandsSection() {
  const allBrands = await getBrands();
  // logoUrl became optional (see lib/models/Brand.ts — brands can now be created by name only
  // from the product form's combobox). This carousel is logo-only, so a brand without one is
  // simply not shown here yet, same "hide if not set" pattern used elsewhere on the site.
  const brands = allBrands.filter(
    (brand): brand is BrandItem & { logoUrl: string } => Boolean(brand.logoUrl)
  );

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Our Top Brands</h2>
        {/* <Link
          href="/brands"
          className="text-sm font-semibold text-brand-500 transition hover:text-brand-600"
        >
          Show All
        </Link> */}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {brands.map((brand) => (
          <Link
            key={brand._id}
            href={`/brand/${slugifyBrand(brand.name)}`}
            className="flex h-32 items-center justify-center rounded-2xl transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              width={200}
              height={80}
              loading="lazy"
              className="max-h-24 w-auto object-contain grayscale opacity-70 transition duration-300 hover:grayscale-0 hover:opacity-100"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
