// Fixed source of truth for product brands — shared between the admin "Add/Edit Product"
// brand dropdown (components/admin/ProductForm.tsx) and the public brand pages
// (app/brand/[slug]/page.tsx, components/BrandsSection.tsx). Keeping this in one place is what
// keeps the admin-selectable brands and the brand pages/links in sync — add a brand here once
// and both sides pick it up automatically.
//
// The Product schema's `brand` field stays a plain string (no schema change) — the dropdown
// just now writes a consistent slug into it instead of free text.

export const BRAND_NAMES = [
  'Wanpy',
  'NexGard',
  'Dreamies',
  'Pawfect',
  'Taste of the Wild',
  'Felicia',
  'Whiskas',
  'Sheba',
  'Bigpaw',
  'Proline',
  'Fatpat',
  'Bonnie',
  'Brit',
  'Champion',
  'Petso',
  'Josera',
  'Homie',
  'Meowmix',
  'Profine',
  'Prochoice',
  'Petline',
  'Mera',
  'Remu',
  'Felix',
  'Alpha',
  'Fluffur',
  'Petflori',
  'Petmom',
  'Petmommy',
] as const;

export type BrandName = (typeof BRAND_NAMES)[number];

export type BrandOption = {
  name: string;
  slug: string;
};

// Lowercase, hyphenated slug — e.g. "Taste of the Wild" -> "taste-of-the-wild". Used for both
// the value stored on product.brand and the /brand/[slug] route param, so the two always agree.
export function slugifyBrand(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export const PRODUCT_BRANDS: BrandOption[] = BRAND_NAMES.map((name) => ({
  name,
  slug: slugifyBrand(name),
}));

export function getBrandNameForSlug(slug: string): string | null {
  const match = PRODUCT_BRANDS.find((brand) => brand.slug === slug);
  return match ? match.name : null;
}
