'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShoppingBag,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useCart } from '@/lib/cart-context';
import CategoryNavBar from '@/components/CategoryNavBar';
import MobileNavMenu from '@/components/MobileNavMenu';
import type { LiveCategory } from '@/lib/category-data';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

type NavbarProps = {
  categories: LiveCategory[];
};

export default function Navbar({ categories }: NavbarProps) {
  const pathname = usePathname();

  const { itemCount } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Close the mobile drawer automatically if the viewport is resized/rotated up into the
  // desktop layout while it's open (e.g. a tablet rotated from portrait to landscape).
  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileMenuOpen(false);
    };

    desktopQuery.addEventListener('change', handleChange);

    return () => desktopQuery.removeEventListener('change', handleChange);
  }, []);

  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearch = () => {
    const query = searchQuery.trim();

    if (!query) return;

    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  /* ============================================================
     CLOSE CATEGORY MENU
  ============================================================ */

  useEffect(() => {
    if (!categoryMenuOpen) return;

    const handleOutsideClick = (
      event: MouseEvent | TouchEvent
    ) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setCategoryMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    document.addEventListener(
      'touchstart',
      handleOutsideClick
    );

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );

      document.removeEventListener(
        'touchstart',
        handleOutsideClick
      );

      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [categoryMenuOpen]);

  /* ============================================================
     ACTIVE LINK
  ============================================================ */

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return (
      pathname === href ||
      pathname?.startsWith(`${href}/`)
    );
  };

  return (
    <header className="relative z-50 w-full border-b border-divider bg-surface text-foreground">
      {/* ========================================================
          MAIN NAVBAR
      ======================================================== */}

      <div className="mx-auto w-full max-w-[1500px] px-5 lg:px-8">
        <div
          className="
            relative
            flex
            min-h-[76px]
            items-center
            justify-between
            gap-6
            lg:grid
            lg:grid-cols-[1fr_auto_1fr]
          "
        >
          {/* ====================================================
              LEFT SIDE — hamburger and logo
          ==================================================== */}

          <div className="flex shrink-0 items-center gap-2">
            {/* HAMBURGER — mobile/tablet only, opens the slide-out MobileNavMenu */}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-secondary
                transition
                hover:bg-brand-50
                hover:text-brand-500
                lg:hidden
              "
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href="/"
              aria-label="Pet’s Friendly Shop Home"
              className="flex items-center gap-2.5"
            >
              <Image
                src="/pets-friendly-logo.png"
                alt=""
                width={662}
                height={411}
                priority
                className="
                  h-[42px]
                  w-auto
                  object-contain
                  sm:h-[46px]
                  lg:h-[50px]
                "
              />

              {/* Name beside the mark — hidden on 1024–1279px, where the links and search leave no room */}
              <span className="hidden whitespace-nowrap leading-tight min-[420px]:block lg:hidden xl:block">
                <span className="block font-display text-base font-bold text-foreground">
                  Pet’s Friendly Shop
                </span>
                <span className="block text-xs text-secondary">
                  &amp; Veterinary Products
                </span>
              </span>
            </Link>
          </div>

          {/* ====================================================
              CENTER — page links
          ==================================================== */}

          <nav
            className="
              hidden
              shrink-0
              items-center
              gap-1
              lg:flex
            "
          >
            {/* HOME */}

            <Link
              href="/"
              className={`
                rounded-full
                px-3
                py-2
                text-sm
                font-medium
                transition-colors
                ${
                  isActive('/')
                    ? 'text-brand-500'
                    : 'text-secondary hover:text-brand-500'
                }
              `}
            >
              Home
            </Link>

            {/* ==================================================
                CATEGORY
            ================================================== */}

            <div
              ref={categoryMenuRef}
              className="relative"
              onMouseEnter={() =>
                setCategoryMenuOpen(true)
              }
              onMouseLeave={() =>
                setCategoryMenuOpen(false)
              }
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={categoryMenuOpen}
                onClick={() =>
                  setCategoryMenuOpen(
                    (previous) => !previous
                  )
                }
                className={`
                  flex
                  items-center
                  gap-1
                  rounded-full
                  px-3
                  py-2
                  text-sm
                  font-medium
                  transition-colors
                  ${
                    categoryMenuOpen
                      ? 'text-brand-500'
                      : 'text-secondary hover:text-brand-500'
                  }
                `}
              >
                Category

                <ChevronDown
                  className={`
                    h-3.5
                    w-3.5
                    transition-transform
                    ${
                      categoryMenuOpen
                        ? 'rotate-180'
                        : ''
                    }
                  `}
                />
              </button>

              {/* ==================================================
                  CATEGORY DROPDOWN
              ================================================== */}

              {categoryMenuOpen && (
                <div
                  className="
                    absolute
                    left-0
                    top-full
                    z-[100]
                    mt-0
                    w-[640px]
                    max-w-[calc(100vw-2rem)]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-divider
                    bg-surface
                    shadow-xl
                  "
                  onClick={(event) => {
                    const link = (
                      event.target as HTMLElement
                    ).closest('a');

                    // Only close on a link that's actually navigating away. A category with
                    // subcategories (CategoryNavBar) calls preventDefault() on its own click to
                    // toggle its inner dropdown instead of navigating — event.defaultPrevented
                    // is still true here since that handler runs first during the bubble phase.
                    // Without this check, clicking a category that HAS subcategories would close
                    // this whole mega-menu before its dropdown ever had a chance to open.
                    if (link && !event.isDefaultPrevented()) {
                      setCategoryMenuOpen(false);
                    }
                  }}
                >
                  <CategoryNavBar
                    categories={categories}
                  />
                </div>
              )}
            </div>

            {/* ABOUT */}

            <Link
              href="/about"
              className={`
                rounded-full
                px-3
                py-2
                text-sm
                font-medium
                transition-colors
                ${
                  isActive('/about')
                    ? 'text-brand-500'
                    : 'text-secondary hover:text-brand-500'
                }
              `}
            >
              About
            </Link>

            {/* SERVICES */}

            <Link
              href="/services"
              className={`
                rounded-full
                px-3
                py-2
                text-sm
                font-medium
                transition-colors
                ${
                  isActive('/services')
                    ? 'text-brand-500'
                    : 'text-secondary hover:text-brand-500'
                }
              `}
            >
              Services
            </Link>

            {/* CONTACT */}

            <Link
              href="/contact"
              className={`
                rounded-full
                px-3
                py-2
                text-sm
                font-medium
                transition-colors
                ${
                  isActive('/contact')
                    ? 'text-brand-500'
                    : 'text-secondary hover:text-brand-500'
                }
              `}
            >
              Contact
            </Link>
          </nav>

          {/* ====================================================
              RIGHT SIDE
          ==================================================== */}

          <div
            className="
              ml-auto
              flex
              shrink-0
              items-center
              gap-2
            "
          >
            {/* ==================================================
                SEARCH
            ================================================== */}

            <div
              className="
                hidden
                h-9
                w-[210px]
                items-center
                overflow-hidden
                rounded-full
                border
                border-divider
                bg-surface
                sm:w-[230px]
                lg:flex
                lg:w-[250px]
              "
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products..."
                className="
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  px-4
                  text-sm
                  text-foreground
                  outline-none
                  placeholder:text-muted
                "
              />

              <button
                type="button"
                onClick={handleSearch}
                aria-label="Search products"
                className="
                  mr-0.5
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-brand-500
                  text-white
                  transition
                  hover:opacity-90
                "
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* ==================================================
                CART
            ================================================== */}

            <Link
              href="/cart"
              aria-label={`Cart (${itemCount})`}
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                px-2.5
                py-2
                text-sm
                text-brand-700
                transition
                hover:bg-brand-50
              "
            >
              <ShoppingBag className="h-4 w-4" />

              <span className="hidden xl:inline">
                Cart
              </span>

              <span
                className="
                  flex
                  min-w-[18px]
                  items-center
                  justify-center
                  rounded-full
                  bg-brand-100
                  px-1.5
                  py-0.5
                  text-[10px]
                  font-semibold
                  text-brand-500
                "
              >
                {itemCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE MENU (slide-out drawer, below the `lg` breakpoint)
      ======================================================== */}

      <MobileNavMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
      />
    </header>
  );
}