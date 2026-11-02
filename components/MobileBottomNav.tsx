'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, ShoppingBag, type LucideIcon } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import WhatsAppIcon from '@/components/WhatsAppIcon';

// Window events the bottom bar fires and Navbar listens for — the drawer's open state and the
// mobile search input both live in Navbar, so this keeps the two components decoupled.
export const OPEN_MOBILE_MENU_EVENT = 'petstar:open-mobile-menu';
export const FOCUS_MOBILE_SEARCH_EVENT = 'petstar:focus-mobile-search';

const WHATSAPP_MESSAGE = 'Hi, I have a question about Pet’s Friendly Shop';

type MobileBottomNavProps = {
  // From SiteSettings via app/layout.tsx, same source as FloatingWhatsAppButton.
  whatsappNumber: string;
};

type TabContentProps = {
  icon: LucideIcon | typeof WhatsAppIcon;
  label: string;
  active?: boolean;
  badge?: number;
  iconClassName?: string;
};

function TabContent({ icon: Icon, label, active, badge, iconClassName }: TabContentProps) {
  return (
    <>
      <span
        className={`relative flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
          active ? 'bg-brand-100' : ''
        }`}
      >
        <Icon className={`h-5 w-5 ${iconClassName ?? ''}`} />

        {badge ? (
          <span className="absolute -right-0.5 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface">
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </span>

      <span className="max-w-full truncate px-0.5 text-[10px] font-medium leading-none min-[360px]:text-[11px]">
        {label}
      </span>
    </>
  );
}

const tabClassName = (active: boolean) =>
  `flex h-full w-full min-w-0 flex-col items-center justify-center gap-1 transition-colors ${
    active ? 'text-brand-500' : 'text-secondary active:text-brand-500'
  }`;

// App-style bottom tab bar, shown below the `lg` breakpoint only. Replaces the floating
// WhatsApp/Veterinary buttons on mobile (those are desktop-only now), so nothing floats over
// the page content. Renders an in-flow spacer too, so the footer isn't hidden behind the bar.
export default function MobileBottomNav({ whatsappNumber }: MobileBottomNavProps) {
  const pathname = usePathname() ?? '';
  const { itemCount } = useCart();

  if (pathname.startsWith('/admin')) return null;

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    : null;

  return (
    <>
      <div aria-hidden="true" className="h-[calc(4rem+env(safe-area-inset-bottom))] lg:hidden" />

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-divider bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_-16px_rgba(5,51,58,0.35)] backdrop-blur-md lg:hidden"
      >
        {/* flex (not a fixed-column grid) so the tabs always share one row, whatever the count */}
        <ul className="flex h-16">
          <li className="min-w-0 flex-1">
            <Link href="/" className={tabClassName(pathname === '/')}>
              <TabContent icon={Home} label="Home" active={pathname === '/'} />
            </Link>
          </li>

          <li className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_MOBILE_MENU_EVENT))}
              className={tabClassName(pathname.startsWith('/category'))}
            >
              <TabContent icon={LayoutGrid} label="Categories" active={pathname.startsWith('/category')} />
            </button>
          </li>

          <li className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(FOCUS_MOBILE_SEARCH_EVENT))}
              className={tabClassName(pathname.startsWith('/search'))}
            >
              <TabContent icon={Search} label="Search" active={pathname.startsWith('/search')} />
            </button>
          </li>

          <li className="min-w-0 flex-1">
            <Link href="/cart" aria-label={`Cart (${itemCount})`} className={tabClassName(pathname === '/cart')}>
              <TabContent icon={ShoppingBag} label="Cart" active={pathname === '/cart'} badge={itemCount} />
            </Link>
          </li>

          {whatsappUrl && (
            <li className="min-w-0 flex-1">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={tabClassName(false)}>
                <TabContent icon={WhatsAppIcon} label="WhatsApp" iconClassName="text-[#25D366]" />
              </a>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}
