'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/brands', label: 'Brands' },
  { href: '/admin/hero-slides', label: 'Hero Slider' },
  { href: '/admin/vet-services', label: 'Veterinary Services' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/settings', label: 'Site Settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="font-display text-xl text-surface">Pet’s Friendly Admin</h2>
        <p className="mt-1 text-sm text-surface/70">Internal tools</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-2xl px-3 py-2 text-sm font-medium transition ${
                active ? 'bg-surface text-brand-500' : 'text-surface/80 hover:bg-surface/10 hover:text-surface'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto rounded-full border border-surface/20 px-3 py-2 text-sm font-semibold text-surface transition hover:bg-surface/10"
      >
        Logout
      </button>
    </div>
  );
}
