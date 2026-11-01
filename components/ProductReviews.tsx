import { Quote, Star } from 'lucide-react';

export type ProductReview = {
  name: string;
  rating: number;
  comment: string;
};

// Admin-entered reviews (max 2 per product, plain text). Renders nothing when there are none.
// Text is rendered as React text nodes, so it is always escaped — never interpreted as HTML.
export default function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section className="mt-12">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Reviews</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">Customer Reviews</h2>
        <span className="mx-auto mt-4 block h-1 w-16 rounded-full bg-brand-500" />
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
          <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
          {average.toFixed(1)} out of 5 · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reviews.map((review, index) => (
          <article
            key={index}
            className="relative flex flex-col rounded-3xl border border-divider bg-surface p-7 shadow-sm"
          >
            <Quote className="absolute right-6 top-6 h-10 w-10 text-brand-100" aria-hidden="true" />

            <div className="flex gap-1" role="img" aria-label={`${review.rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= review.rating ? 'fill-accent-500 text-accent-500' : 'text-divider'}`}
                />
              ))}
            </div>

            <p className="mt-5 flex-1 text-base leading-7 text-secondary sm:text-lg sm:leading-8">
              &ldquo;{review.comment}&rdquo;
            </p>

            <div className="mt-6 flex items-center gap-3 border-t border-divider pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-lg font-bold uppercase text-surface">
                {review.name.trim().charAt(0)}
              </span>
              <p className="font-semibold text-foreground">{review.name}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
