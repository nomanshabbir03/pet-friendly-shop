import { Schema, models, model } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    // No longer a fixed enum — categories are admin-managed (see lib/models/Category.ts,
    // /admin/categories) rather than a hardcoded compile-time list, so new categories the admin
    // creates can be assigned to products without a schema change. Stored as the Category's
    // slug (not its display name), matching how /category/[slug] and getLiveCategories() already
    // match products. Validity (must match an active Category slug) is enforced dynamically in
    // the admin product API routes, not here — existing product data is left exactly as-is.
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    // Holds sanitized rich text HTML from the admin form's editor (components/admin/
    // RichTextEditor.tsx) — bold/italic/lists/paragraphs only, allowlist-sanitized server-side
    // before every save (see lib/sanitize-html.ts). Still just a String; this is a content-
    // format change, not a schema/type change. Plain text saved before the rich text editor
    // existed is valid HTML as-is (no tags to interpret) and keeps rendering unchanged.
    description: {
      type: String,
    },
    // Same rich-text HTML storage/sanitization convention as `description` above — bold/
    // italic/lists/paragraphs only, allowlist-sanitized server-side before every save (see
    // lib/sanitize-html.ts). Optional; the product detail page hides this section entirely
    // when it's empty rather than showing an empty "Key Features" heading.
    keyFeatures: {
      type: String,
    },
    // Per-product FAQs. `question` is plain text (a simple input — no formatting needed for a
    // question); `answer` uses the same rich-text HTML convention as `description`/
    // `keyFeatures`, sanitized the same way. Optional/defaults to an empty array; the product
    // page hides the whole FAQs section when there are no entries, and skips any individual
    // entry whose answer is empty after sanitization rather than rendering a question with
    // nothing under it.
    faqs: [
      {
        question: { type: String, required: true, trim: true },
        answer: { type: String },
      },
    ],
    // Admin-entered customer reviews, at most MAX_REVIEWS_PER_PRODUCT (2) per product — enforced
    // in the admin form and both admin product APIs. No public submission yet. Plain text only.
    // The product page hides the whole Reviews section when this is empty.
    reviews: [
      {
        name: { type: String, required: true, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true },
      },
    ],
    // UNUSED / SUPERSEDED as of the packagingSizes addition below (see that field's comment).
    // Never wired up to the admin form or the admin product API — always an empty array on real
    // data. Left in place untouched rather than removed/renamed; do not build new features on it.
    variants: [
      {
        label: String, // e.g. "500g", "Small", "Red"
        priceModifier: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
      },
    ],
    // Packaging-size variants, each with its own actual/discounted price and real stock count
    // (admin-managed via the product form). Additive/optional — products with an
    // empty/missing packagingSizes array behave exactly as before, using the base `price` field
    // above. When entries exist, the selected size's discountedPrice (if set) or actualPrice is
    // what's actually charged; `price` above becomes a fallback/"starting from" display value.
    // This supersedes the older `variants` field (see its comment) for anything new.
    //
    // "In stock" is intentionally NOT a separately-stored boolean — it's derived as
    // `stock > 0` wherever it's needed, so the two can never drift out of sync.
    //
    // Migration note: this replaces the older {label, price, inStock} shape. Existing documents
    // saved under that shape are NOT rewritten by this schema change alone (Mongoose only
    // affects how new writes are cast) — see scripts/migrate-packaging-sizes.ts for the
    // one-time, additive-only backfill, and the read-side fallback in
    // app/products/[slug]/page.tsx and app/api/orders/route.ts that keeps un-migrated products
    // working (conservatively, as out-of-stock) in the meantime.
    packagingSizes: [
      {
        label: { type: String, required: true, trim: true }, // e.g. "500g", "1kg", "5kg"
        actualPrice: { type: Number, required: true, min: 0 }, // original/MSRP price for this size
        discountedPrice: { type: Number, min: 0 }, // optional selling price — unset/absent means no discount
        stock: { type: Number, required: true, default: 0, min: 0 }, // real stock quantity for this size
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isMostSelling: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default models.Product || model('Product', ProductSchema);
