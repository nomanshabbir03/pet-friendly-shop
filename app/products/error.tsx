'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

// Catches any uncaught error while rendering /products — e.g. a broken dependency in a
// component this page renders (ProductCard, which pulls in lib/sanitize-html) — and shows a
// visible message instead of Next's generic crash page or (for the static-shell case) a stale
// build). Logged here so it also shows up in Vercel Runtime Logs, not just the browser.
export default function ProductsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[/products] Render failed:', error);
  }, [error]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 text-center">
      <h1 className="font-display text-2xl text-brand-500">Couldn&apos;t load products</h1>
      <p className="mt-2 text-secondary/70">
        Something went wrong while loading the catalog. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-surface shadow-sm transition hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
