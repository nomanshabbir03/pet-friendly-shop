'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { LiveCategory } from '@/lib/category-data';

type CategoryNavBarProps = {
  categories: LiveCategory[];
};

// Content of the Navbar's "Category" mega-menu: a two-column grid of category cards (image tile,
// name, short subtitle) with a call-to-action footer bar. Categories pull from the same live list
// as the "Shop by category" grid (see lib/category-data.ts, admin-managed via /admin/categories).
export default function CategoryNavBar({ categories }: CategoryNavBarProps) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Shop by category">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-5 p-6">
        {categories.map((category) => {
          const subcategories = category.subcategories ?? [];
          const subtitle =
            subcategories.length > 0
              ? subcategories.map((subcategory) => subcategory.name).join(', ')
              : category.productCount === 0
                ? 'Coming soon'
                : `${category.productCount} ${category.productCount === 1 ? 'product' : 'products'}`;

          return (
            <li key={category.slug}>
              <Link
                href={`/category/${category.slug}`}
                className="group flex items-start gap-4 rounded-xl p-2 transition-colors hover:bg-brand-50"
              >
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </span>

                <span className="min-w-0">
                  <span className="block text-base font-semibold text-foreground transition-colors group-hover:text-brand-500">
                    {category.name}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-muted">
                    {subtitle}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/products"
        className="flex items-center justify-between border-t border-divider bg-brand-50 px-6 py-4 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-500"
      >
        Not sure what you need? Browse all products
        <ArrowRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
