'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type ProductFaqItem = {
  question: string;
  // Already-sanitized rich text HTML (same convention as Description/Key Features) — this
  // component only renders it, it doesn't sanitize.
  answer: string;
};

type ProductFaqAccordionProps = {
  items: ProductFaqItem[];
};

// Per-product FAQs on the product detail page. Same accordion pattern as the site-wide FAQ
// page's FaqAccordion (components/faqs/FaqAccordion.tsx) — question visible by default, answer
// expands on click — but the answer here is rich text HTML from the same editor as
// Description/Key Features, rendered the same safe way (dangerouslySetInnerHTML + the
// .product-description typography) rather than a plain text node.
export default function ProductFaqAccordion({ items }: ProductFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const answerId = `product-faq-${index}-answer`;

        return (
          <article
            key={`${item.question}-${index}`}
            className="overflow-hidden rounded-2xl border border-divider bg-surface shadow-sm"
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="flex w-full items-center justify-between gap-4 p-4 text-left font-semibold text-brand-500 transition hover:text-error"
              >
                <span>{item.question}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </h3>

            {isOpen && (
              <div
                id={answerId}
                className="product-description border-t border-divider px-4 py-4 text-sm leading-6 text-secondary/80"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            )}
          </article>
        );
      })}
    </div>
  );
}
