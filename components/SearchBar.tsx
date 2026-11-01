
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      return;
    }

    const value = query.trim();
    if (!value) {
      return;
    }

    const timeout = setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, pathname, router]);

  return (
    <div className="relative mb-6 max-w-xl">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m21 21-4.35-4.35" />
          <circle cx="11" cy="11" r="7" />
        </svg>
      </span>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products by name or brand"
        className="w-full rounded-lg border border-divider bg-surface px-10 py-3 text-sm text-foreground placeholder:text-disabled outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}
