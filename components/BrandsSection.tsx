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
    <section className="mt-8 lg:mt-10">
      <div className="mb-4 flex lg:mb-6 items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground lg:text-2xl">Our Top Brands</h2>
        {/* <Link
          href="/brands"
          className="text-sm font-semibold text-brand-500 transition hover:text-brand-600"
        >
          Show All
        </Link> */}
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:gap-y-8 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4 lg:grid-cols-5">
        {brands.map((brand) => (
          <Link
            key={brand._id}
            href={`/brand/${slugifyBrand(brand.name)}`}
            className="flex h-20 w-28 shrink-0 items-center sm:w-auto justify-center rounded-2xl border border-divider p-2 sm:h-32 sm:border-0 sm:p-0 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              width={200}
              height={80}
              loading="lazy"
              className="max-h-14 w-auto object-contain sm:max-h-24 sm:grayscale sm:opacity-70 transition duration-300 hover:grayscale-0 hover:opacity-100"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
