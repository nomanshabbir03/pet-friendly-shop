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
import { FOCUS_MOBILE_SEARCH_EVENT, OPEN_MOBILE_MENU_EVENT } from '@/components/MobileBottomNav';
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
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  // MobileBottomNav's "Categories" and "Search" tabs — the drawer and the mobile search input
  // live here, so the bar signals through window events (see MobileBottomNav.tsx).
  useEffect(() => {
    const openMenu = () => setMobileMenuOpen(true);
    const focusSearch = () => mobileSearchRef.current?.focus();

    window.addEventListener(OPEN_MOBILE_MENU_EVENT, openMenu);
    window.addEventListener(FOCUS_MOBILE_SEARCH_EVENT, focusSearch);

    return () => {
      window.removeEventListener(OPEN_MOBILE_MENU_EVENT, openMenu);
      window.removeEventListener(FOCUS_MOBILE_SEARCH_EVENT, focusSearch);
    };
  }, []);

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
    <header className="sticky top-0 z-50 w-full border-b border-divider bg-surface text-foreground">
      {/* ========================================================
          MAIN NAVBAR
      ======================================================== */}

      <div className="mx-auto w-full max-w-[1500px] px-5 lg:px-8">
        <div
          className="
            relative
            flex
            min-h-[72px]
            items-center
            justify-between
            gap-3
            lg:min-h-[88px]
            lg:gap-6
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
                src="/pets-friendly-logo-full.png"
                alt=""
                width={635}
                height={524}
                priority
                className="h-[60px] w-auto object-contain lg:h-[72px]"
              />
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
                lg:w-[190px]
                xl:w-[250px]
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

        {/* ====================================================
            MOBILE SEARCH — always visible below `lg` (the desktop
            search above is hidden there)
        ==================================================== */}

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
          className="pb-3 lg:hidden"
        >
          <div className="flex h-11 items-center overflow-hidden rounded-full border border-divider bg-brand-50/70 transition focus-within:border-brand-500 focus-within:bg-surface focus-within:ring-2 focus-within:ring-brand-500/20">
            <Search className="ml-4 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />

            {/* text-base (16px) stops iOS Safari from zooming the page in on focus */}
            <input
              ref={mobileSearchRef}
              type="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search food, toys, brands..."
              aria-label="Search products"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-sm placeholder:text-muted"
            />

            <button
              type="submit"
              className="mr-1 h-9 shrink-0 rounded-full bg-brand-500 px-4 text-sm font-semibold text-white transition active:opacity-80"
            >
              Search
            </button>
          </div>
        </form>
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