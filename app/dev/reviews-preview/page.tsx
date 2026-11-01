import { notFound } from 'next/navigation';
import ProductReviews from '@/components/ProductReviews';

// Localhost-only layout preview with made-up sample text — never touches the database and is a
// 404 in production. Safe to delete once the review design has been checked.
export default function ReviewsPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-700">
        Preview only — sample text, not saved anywhere.
      </p>
      <ProductReviews
        reviews={[
          { name: 'Sample Reviewer', rating: 5, comment: 'Sample comment: this is how a five-star review will look on a product page.' },
          { name: 'Another Sample', rating: 4, comment: 'Sample comment: a four-star review, a little longer so you can see how the text wraps onto a second line inside the card.' },
        ]}
      />
    </main>
  );
}
