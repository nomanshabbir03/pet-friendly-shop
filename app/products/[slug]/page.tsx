import { notFound } from 'next/navigation';
import { MessageCircle, Phone } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings';
import ProductReviews from '@/components/ProductReviews';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import ProductGallery from '@/components/ProductGallery';
import AddToCartButton from '@/components/AddToCartButton';
import ProductPurchasePanel from '@/components/ProductPurchasePanel';
import type { PackagingSize } from '@/components/SizeSelector';
import RelatedProducts from '@/components/RelatedProducts';
import ProductFaqAccordion from '@/components/ProductFaqAccordion';
import { sanitizeDescriptionHtml } from '@/lib/sanitize-html';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

// UNUSED / SUPERSEDED — see the comment on Product.variants in lib/models/Product.ts. Kept only
// because the no-sizes code path below still reads product.variants for AddToCartButton.
type ProductVariant = {
  label: string;
  priceModifier?: number;
  stock?: number;
};

// Raw shape as actually stored in MongoDB — includes the legacy {price, inStock} fields a
// product saved before the actualPrice/discountedPrice/stock migration would still have,
// alongside (or instead of) the new fields. See normalizePackagingSizes below and
// scripts/migrate-packaging-sizes.ts.
type RawPackagingSize = {
  label: string;
  actualPrice?: number;
  discountedPrice?: number;
  stock?: number;
  price?: number;
  inStock?: boolean;
};

type RawFaq = {
  question: string;
  answer?: string;
};

type ProductDocument = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images?: string[];
  description?: string;
  keyFeatures?: string;
  faqs?: RawFaq[];
  reviews?: Array<{ name: string; rating: number; comment: string }>;
  variants?: ProductVariant[];
  packagingSizes?: RawPackagingSize[];
  isActive?: boolean;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);
}

// actualPrice falls back to the legacy `price` field — that mapping is unambiguous (same value,
// new name). stock is NOT derived from the legacy `inStock` boolean, though: there's no way to
// recover a real quantity from a true/false flag without guessing a number, so an un-migrated
// size conservatively reads as 0 (out of stock) here rather than inventing one. Run
// scripts/migrate-packaging-sizes.ts to backfill real stock counts in bulk.
function normalizePackagingSizes(sizes: RawPackagingSize[] = []): PackagingSize[] {
  return sizes.map((size) => ({
    label: size.label,
    actualPrice: size.actualPrice ?? size.price ?? 0,
    discountedPrice: size.discountedPrice,
    stock: size.stock ?? 0,
  }));
}

async function getProduct(slug: string) {
  await connectDB();

  const product = await Product.findOne({ slug, isActive: true }).lean();

  if (!product) {
    return null;
  }

  return JSON.parse(JSON.stringify(product)) as ProductDocument;
}

// Other active products in the same category, excluding the one being viewed. Same
// createdAt-desc ordering already used for product listings elsewhere (e.g. the homepage's
// getProducts), capped at a reasonable count for a below-the-fold grid.
async function getRelatedProducts(category: string, excludeId: string) {
  await connectDB();

  const products = await Product.find({ category, isActive: true, _id: { $ne: excludeId } })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  return JSON.parse(JSON.stringify(products)) as ProductDocument[];
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category, String(product._id));
  const settings = await getSiteSettings();

  const images = product.images && product.images.length > 0 ? product.images : [];
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const displayPrice = product.discountPrice ?? product.price;
  const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
  const statusClass = product.stock > 0 ? 'text-green-600' : 'text-red-600';
  const packagingSizes = normalizePackagingSizes(product.packagingSizes);
  const hasSizes = packagingSizes.length > 0;

  // Sanitized again here, right before rendering, as defense in depth — the admin API already
  // sanitizes on save (see lib/sanitize-html.ts), but rendering never trusts stored HTML as the
  // sole line of defense either. A plain-text description saved before the rich text editor
  // existed has nothing for the sanitizer to touch and renders exactly as it did before.
  const sanitizedDescription = product.description ? sanitizeDescriptionHtml(product.description) : '';

  const descriptionBlock = (
    <div className="rounded-2xl border border-divider bg-surface p-4 shadow-sm">
      <h2 className="mb-2 font-display text-xl text-brand-500">Description</h2>
      {sanitizedDescription ? (
        <div
          className="product-description leading-relaxed text-secondary/80"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      ) : (
        <p className="leading-relaxed text-secondary/80">No description available.</p>
      )}
    </div>
  );

  // Same sanitize-again-before-render defense-in-depth as Description above. Hidden entirely
  // (not an empty heading) when there's nothing left after sanitizing.
  const sanitizedKeyFeatures = product.keyFeatures ? sanitizeDescriptionHtml(product.keyFeatures) : '';

  // Only FAQs with a non-empty answer (after sanitizing) are shown — a question with nothing
  // under it isn't rendered at all, per spec.
  const faqItems = (product.faqs ?? [])
    .map((faq) => ({
      question: faq.question,
      answer: faq.answer ? sanitizeDescriptionHtml(faq.answer) : '',
    }))
    .filter((faq) => faq.answer);

  // Admin-entered, max 2, plain text. Shown as text (React escapes it), never as HTML.
  const reviews = (product.reviews ?? []).filter((review) => review.name && review.comment).slice(0, 2);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <ProductGallery images={images} alt={product.name} />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-500/70">{product.category}</p>
            <h1 className="font-display text-2xl text-brand-500 sm:text-3xl">{product.name}</h1>
            {product.brand ? <p className="mt-1 text-secondary/70">{product.brand}</p> : null}
          </div>

          {hasSizes ? (
            <ProductPurchasePanel
              productId={String(product._id)}
              slug={product.slug}
              name={product.name}
              image={images[0] || null}
              packagingSizes={packagingSizes}
            />
          ) : (
            <>
              <div className="rounded-2xl border border-divider bg-surface p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <p className={`text-2xl font-bold ${hasDiscount ? 'text-error' : 'text-brand-500'}`}>Rs. {formatPrice(displayPrice)}</p>
                  {hasDiscount ? (
                    <span className="text-secondary/60 line-through">Rs. {formatPrice(product.price)}</span>
                  ) : null}
                  {hasDiscount ? (
                    <span className="rounded-full bg-brand-500/15 px-3 py-1 text-sm font-medium text-brand-500">
                      Save {formatPrice(product.price - (product.discountPrice || product.price))}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className={`font-medium ${statusClass}`}>{stockStatus}</p>
                  {product.stock === 0 ? (
                    <span className="rounded-full bg-error/20 px-3 py-1 text-sm font-semibold text-error">
                      Out of stock
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-divider bg-surface p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <AddToCartButton
                      productId={String(product._id)}
                      slug={product.slug}
                      name={product.name}
                      price={product.price}
                      discountPrice={product.discountPrice}
                      image={images[0] || null}
                      variants={product.variants || []}
                      maxQuantity={product.stock}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Fills the space under the purchase card with facts taken from the product and the
              admin-managed Site Settings — nothing here is a hardcoded store policy. */}
          <div className="rounded-2xl border border-divider bg-surface p-4 shadow-sm">
            <h2 className="mb-3 font-display text-lg text-brand-500">Product Details</h2>
            <dl className="divide-y divide-divider text-sm">
              {[
                product.brand ? { label: 'Brand', value: product.brand } : null,
                { label: 'Category', value: product.category },
                hasSizes ? { label: 'Available sizes', value: packagingSizes.map((size) => size.label).join(', ') } : null,
              ]
                .filter((row): row is { label: string; value: string } => Boolean(row))
                .map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0">
                    <dt className="text-secondary">{row.label}</dt>
                    <dd className="text-right font-medium capitalize text-foreground">{row.value}</dd>
                  </div>
                ))}
            </dl>
          </div>

          {settings.whatsappNumber || settings.phone ? (
            <div className="rounded-2xl border border-divider bg-brand-50 p-4 shadow-sm">
              <h2 className="font-display text-lg text-brand-500">Questions about this product?</h2>
              <p className="mt-1 text-sm text-secondary">
                Ask us about the right size, ingredients or availability — we reply the same day.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {settings.whatsappNumber ? (
                  <a
                    href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                      `Hi, I have a question about ${product.name}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                ) : null}
                {settings.phone ? (
                  <a
                    href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-500 bg-surface px-4 py-2 text-sm font-semibold text-brand-500 transition hover:bg-brand-50"
                  >
                    <Phone className="h-4 w-4" />
                    Call {settings.phone}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Full-width, directly under the gallery/purchase section and above Key Features. */}
      <div className="mt-8">{descriptionBlock}</div>

      {sanitizedKeyFeatures ? (
        <div className="mt-8 rounded-2xl border border-divider bg-surface p-4 shadow-sm">
          <h2 className="mb-2 font-display text-xl font-bold text-vet-yellow-600">Key Features</h2>
          <div
            className="product-description leading-relaxed text-secondary/80"
            dangerouslySetInnerHTML={{ __html: sanitizedKeyFeatures }}
          />
        </div>
      ) : null}

      <ProductReviews reviews={reviews} />

      {faqItems.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-xl text-vet-yellow-600">FAQs</h2>
          <ProductFaqAccordion items={faqItems} />
        </section>
      ) : null}

      <RelatedProducts products={relatedProducts} />
    </main>
  );
}
