import { cache } from 'react';
import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';

export type LiveCategorySubcategory = {
  name: string;
  slug: string;
};

export type LiveCategory = {
  slug: string;
  name: string;
  image: string;
  productCount: number;
  subcategories: LiveCategorySubcategory[];
};

// Cute stock pictures from /public, used only when a category has no image set in the admin.
// Picked by keyword from the category's slug/name; unknown categories get a generic pet photo.
function fallbackCategoryImage(slug: string, name: string): string {
  const text = `${slug} ${name}`.toLowerCase();
  const has = (...words: string[]) => words.some((word) => text.includes(word));

  if (has('fish', 'aquarium')) return '/fish.png';
  if (has('bird')) return '/birds.png';
  if (has('dog', 'puppy')) {
    if (has('food', 'treat')) return '/dog-food.jpg';
    if (has('accessor', 'collar', 'leash')) return '/dog-accessories.jpg';
    return '/dog-supplies.png';
  }
  if (has('cat', 'kitten', 'litter')) {
    if (has('food', 'treat')) return '/cat-food.png';
    if (has('accessor', 'collar')) return '/cat-accessories.png';
    return '/cat-supplies.png';
  }
  if (has('food')) return '/dog-food.jpg';
  if (has('accessor', 'toy')) return '/cat-accessories.png';
  return '/image1.jpg';
}

// Single source of truth for the homepage "Shop by category" grid AND the Navbar's "Category"
// mega-menu (rendered site-wide from app/layout.tsx) — every caller uses this instead of
// hardcoding its own category list, so counts and the hide-when-empty rule stay consistent
// everywhere. Wrapped in React's cache() so that when both the root layout (every page) and
// app/page.tsx (homepage only) call this within the same request, the underlying queries only
// run once instead of twice.
//
// Categories are admin-managed (see lib/models/Category.ts, /admin/categories) — this is no
// longer a hardcoded list. Real counts are computed from the Product collection (active
// products only, matched by Product.category === Category.slug). Every active category is shown,
// including one with zero products (CategoryCard and CategoryNavBar label those "Coming soon");
// use isActive in the admin to hide a category. Products with a category value that doesn't
// match any active Category slug are safely ignored rather than crashing the count.
export const getLiveCategories = cache(async (): Promise<LiveCategory[]> => {
  await connectDB();

  const categories = await Category.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
  const slugs = categories.map((category) => category.slug);

  const counts = await Product.aggregate([
    { $match: { isActive: true, category: { $in: slugs } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countByCategory = new Map<string, number>(
    counts.map((entry: { _id: string; count: number }) => [entry._id, entry.count])
  );

  return categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    image: category.image || fallbackCategoryImage(category.slug, category.name),
    productCount: countByCategory.get(category.slug) ?? 0,
    subcategories: (category.subcategories || []).map((sub: { name: string; slug: string }) => ({
      name: sub.name,
      slug: sub.slug,
    })),
  }));
});
