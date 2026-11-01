// One-time, additive-only migration for Product.packagingSizes:
//   old shape:  { label, price,        inStock: boolean }
//   new shape:  { label, actualPrice,  discountedPrice?, stock: number }
//
// Non-destructive: writes ONLY the new fields (actualPrice/discountedPrice/stock) onto each
// packaging-size subdocument that doesn't already have them, using field-level $set via the raw
// MongoDB driver (Product.collection, not the Mongoose model) so Mongoose's schema-based
// casting never strips the existing `price`/`inStock`/`_id` fields already on that subdocument.
// Nothing is deleted and nothing is overwritten for a size that's already been migrated.
//
// Mapping:
//   price          -> actualPrice        (same value, unambiguous — just a rename)
//   (nothing)      -> discountedPrice    (left unset — no discount by default)
//   inStock: true  -> stock = MIGRATION_DEFAULT_STOCK   (see below — must be supplied, never guessed)
//   inStock: false -> stock = 0
//
// Usage:
//   MIGRATION_DEFAULT_STOCK=<n> npx tsx scripts/migrate-packaging-sizes.ts             (dry run — reports only)
//   MIGRATION_DEFAULT_STOCK=<n> npx tsx scripts/migrate-packaging-sizes.ts --apply     (writes the changes)
//
// MIGRATION_DEFAULT_STOCK is required and is never defaulted in code — it's the stock quantity
// every previously "inStock: true" size will be backfilled with. Confirm the exact number (and
// that this should run against the real/production database) before using --apply.

import { connectDB } from '../lib/mongodb';
import Product from '../lib/models/Product';

type RawPackagingSize = {
  label: string;
  price?: number;
  inStock?: boolean;
  actualPrice?: number;
  discountedPrice?: number;
  stock?: number;
};

type RawProduct = {
  _id: unknown;
  name: string;
  packagingSizes?: RawPackagingSize[];
};

async function main() {
  const apply = process.argv.includes('--apply');
  const defaultStockRaw = process.env.MIGRATION_DEFAULT_STOCK;
  const defaultStock = Number(defaultStockRaw);

  if (!defaultStockRaw || Number.isNaN(defaultStock) || defaultStock < 0 || !Number.isInteger(defaultStock)) {
    console.error(
      'Set MIGRATION_DEFAULT_STOCK to a non-negative whole number before running this script.\n' +
        'This is the stock quantity every previously "inStock: true" packaging size will be backfilled with.\n' +
        'Example: MIGRATION_DEFAULT_STOCK=10 npx tsx scripts/migrate-packaging-sizes.ts'
    );
    process.exit(1);
  }

  await connectDB();

  const products = await Product.find({ 'packagingSizes.0': { $exists: true } })
    .lean<RawProduct[]>();

  type PlannedUpdate = {
    productId: string;
    name: string;
    // MongoDB dot-notation field updates, e.g. "packagingSizes.0.actualPrice": 500 — touches
    // only the specific fields on the specific array index, leaving everything else
    // (label, price, inStock, _id) on that subdocument untouched.
    setOps: Record<string, number>;
    preview: { label: string; actualPrice: number; discountedPrice: string; stock: number }[];
  };

  const planned: PlannedUpdate[] = [];

  for (const product of products) {
    const sizes = product.packagingSizes ?? [];
    const setOps: Record<string, number> = {};
    const preview: PlannedUpdate['preview'] = [];

    sizes.forEach((size, index) => {
      const needsActualPrice = size.actualPrice === undefined;
      const needsStock = size.stock === undefined;

      if (!needsActualPrice && !needsStock) {
        return; // already migrated — leave it alone entirely
      }

      const actualPrice = size.actualPrice ?? size.price ?? 0;
      const stock = size.stock ?? (size.inStock ? defaultStock : 0);

      if (needsActualPrice) setOps[`packagingSizes.${index}.actualPrice`] = actualPrice;
      if (needsStock) setOps[`packagingSizes.${index}.stock`] = stock;

      preview.push({
        label: size.label,
        actualPrice,
        discountedPrice: size.discountedPrice !== undefined ? String(size.discountedPrice) : '(none — unset)',
        stock,
      });
    });

    if (Object.keys(setOps).length > 0) {
      planned.push({ productId: String(product._id), name: product.name, setOps, preview });
    }
  }

  const totalSizes = planned.reduce((sum, p) => sum + p.preview.length, 0);

  console.log(`Mode: ${apply ? 'APPLY (will write changes)' : 'DRY RUN (no changes will be written)'}`);
  console.log(`Default stock for previously "inStock: true" sizes: ${defaultStock}`);
  console.log(`Found ${planned.length} product(s) with ${totalSizes} packaging size(s) needing migration.\n`);

  for (const update of planned) {
    console.log(`- ${update.name} (${update.productId})`);
    for (const size of update.preview) {
      console.log(
        `    "${size.label}": actualPrice=${size.actualPrice}, discountedPrice=${size.discountedPrice}, stock=${size.stock}`
      );
    }
  }

  if (planned.length === 0) {
    console.log('\nNothing to migrate — every packaging size already has actualPrice and stock set.');
    return;
  }

  if (!apply) {
    console.log('\nDry run complete. No changes were written. Re-run with --apply to write these changes.');
    return;
  }

  console.log('\nApplying...');

  for (const update of planned) {
    // Product.collection is the raw MongoDB driver collection, not the Mongoose model — this
    // bypasses Mongoose's schema-based casting so the legacy price/inStock fields (and every
    // other field on the subdocument) are left exactly as they are.
    await Product.collection.updateOne({ _id: update.productId as never }, { $set: update.setOps });
    console.log(`  updated ${update.name} (${update.productId})`);
  }

  console.log(`\nDone. ${planned.length} product(s) updated.`);
}

main()
  .catch((error) => {
    console.error('Migration failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit();
  });
