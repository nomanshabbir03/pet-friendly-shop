'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { FAQ_CATEGORIES } from '@/lib/faq-data';

export type FaqCategory = {
  title: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
};

type FaqSectionProps = {
  // Hide the "Frequently asked questions" heading where the page already has its own intro.
  showHeading?: boolean;
  // Narrower, smaller variant (used on the home page).
  compact?: boolean;
  // Page-specific categories; defaults to the full FAQ list.
  categories?: FaqCategory[];
};

// Category bars (red, collapsed by default) that open to a list of question rows with a +/× icon.
// Only one category and one question can be open at a time; everything starts closed.
export default function FaqSection({ showHeading = true, compact = false, categories = FAQ_CATEGORIES }: FaqSectionProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const toggleCategory = (title: string) => {
    setOpenCategory((current) => (current === title ? null : title));
    setOpenQuestion(null);
  };

  return (
    <section className={`mt-12 ${compact ? 'mx-auto max-w-3xl' : ''}`} aria-label="Frequently asked questions">
      {showHeading ? (
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">FAQs</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <span className="mx-auto mt-4 block h-1 w-16 rounded-full bg-brand-500" />
        </div>
      ) : null}

      <div className="space-y-3">
        {categories.map((category) => {
          const categoryOpen = openCategory === category.title;
          const panelId = `faq-${category.title.replace(/\W+/g, '-').toLowerCase()}`;

          return (
            <div key={category.title}>
              <button
                type="button"
                onClick={() => toggleCategory(category.title)}
                aria-expanded={categoryOpen}
                aria-controls={panelId}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl bg-brand-500 px-6 py-5 text-left text-white transition hover:bg-brand-600 ${compact ? 'sm:px-6 sm:py-4' : 'sm:px-10 sm:py-6'}`}
              >
                <span className={`font-display font-semibold ${compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-4xl'}`}>{category.title}</span>
                {categoryOpen ? (
                  <X className="h-6 w-6 shrink-0" aria-hidden="true" />
                ) : (
                  <Plus className="h-6 w-6 shrink-0" aria-hidden="true" />
                )}
              </button>

              {categoryOpen ? (
                <div id={panelId} className={compact ? 'px-2' : 'lg:ml-[50%]'}>
                  {category.questions.map((item, index) => {
                    const itemId = `${panelId}-${index}`;
                    const isOpen = openQuestion === itemId;

                    return (
                      <div key={item.question} className="border-b border-divider">
                        <h3>
                          <button
                            type="button"
                            onClick={() => setOpenQuestion(isOpen ? null : itemId)}
                            aria-expanded={isOpen}
                            aria-controls={`${itemId}-answer`}
                            className={`flex w-full items-center justify-between gap-4 text-left font-semibold transition ${compact ? 'py-4 text-base' : 'py-6 text-lg'} hover:text-brand-500 ${
                              isOpen ? 'text-brand-500' : 'text-foreground'
                            }`}
                          >
                            <span>{item.question}</span>
                            {isOpen ? (
                              <X className="h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                            ) : (
                              <Plus className="h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                            )}
                          </button>
                        </h3>

                        {isOpen ? (
                          <p id={`${itemId}-answer`} className="pb-6 text-base leading-7 text-secondary">
                            {item.answer}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
