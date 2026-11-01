'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import type { LiveCategory } from '@/lib/category-data';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

type MobileNavMenuProps = {
  open: boolean;
  onClose: () => void;
  categories: LiveCategory[];
};

// Slide-out mobile menu — holds the nav links, search (moved here off the collapsed mobile
// header to save space), and the Category list as a touch-friendly accordion (hover-based
// subcategory flyouts in CategoryNavBar don't work on touch devices). Rendered by Navbar.tsx
// only below the `lg` breakpoint, alongside the always-visible hamburger trigger.
export default function MobileNavMenu({ open, onClose, categories }: MobileNavMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategorySlug, setOpenCategorySlug] = useState<string | null>(null);

  // Lock background scroll while the drawer is open so the page underneath doesn't scroll.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);

    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Reset the category accordion whenever the drawer closes, so it always reopens fresh.
  useEffect(() => {
    if (!open) setOpenCategorySlug(null);
  }, [open]);

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;

    onClose();
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`
          fixed inset-0 z-[110] bg-brand-900/40 transition-opacity duration-300 lg:hidden
          ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}
        `}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`
          fixed inset-y-0 left-0 z-[120] flex h-full w-[85%] max-w-sm flex-col
          overflow-y-auto bg-surface shadow-xl transition-transform duration-300 ease-out lg:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between border-b border-divider px-5 py-4">
          <span className="font-display text-lg text-brand-500">Menu</span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition hover:bg-brand-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 px-5 py-4">
          {/* Search */}
          <div className="mb-5 flex h-11 items-center overflow-hidden rounded-full border border-divider bg-surface">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch();
              }}
              placeholder="Search products..."
              className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted"
            />

            <button
              type="button"
              onClick={handleSearch}
              aria-label="Search products"
              className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:opacity-90"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Main links */}
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="rounded-xl px-3 py-3 text-base font-medium text-foreground transition hover:bg-brand-50 hover:text-brand-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Category accordion */}
          {categories.length > 0 && (
            <div className="mt-4 border-t border-divider pt-4">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-secondary/70">
                Shop by Category
              </p>

              <div className="flex flex-col">
                {categories.map((category) => {
                  const subcategories = category.subcategories ?? [];
                  const hasSubcategories = subcategories.length > 0;
                  const isOpen = openCategorySlug === category.slug;

                  return (
                    <div key={category.slug}>
                      <div className="flex items-center justify-between rounded-xl transition hover:bg-brand-50">
                        <Link
                          href={`/category/${category.slug}`}
                          onClick={onClose}
                          className="flex-1 px-3 py-3 text-base font-medium text-foreground"
                        >
                          {category.name}
                        </Link>

                        {hasSubcategories && (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenCategorySlug((current) =>
                                current === category.slug ? null : category.slug
                              )
                            }
                            aria-expanded={isOpen}
                            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${category.name} subcategories`}
                            className="flex h-11 w-11 shrink-0 items-center justify-center text-secondary"
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isOpen ? 'rotate-180 text-brand-500' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {hasSubcategories && isOpen && (
                        <div className="ml-3 flex flex-col border-l border-divider pl-3">
                          {subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.slug}
                              href={`/category/${subcategory.slug}`}
                              onClick={onClose}
                              className="rounded-lg px-3 py-2.5 text-sm text-secondary transition hover:bg-brand-50 hover:text-brand-500"
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
