import type { Metadata } from 'next';
import Link from 'next/link';
import FaqSection from '@/components/faqs/FaqSection';
import { FAQ_CATEGORIES } from '@/lib/faq-data';

export const metadata: Metadata = {
  title: 'FAQs | Pet’s Friendly Shop',
  description: 'Find answers about WhatsApp ordering, Cash on Delivery, delivery, returns, and Pet’s Friendly Shop accounts.',
};

export default function FaqsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-divider bg-gradient-to-br from-brand-50 via-surface to-brand-50 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Pet’s Friendly Shop FAQs</p>
          <h1 className="mt-3 font-display text-3xl text-brand-500 sm:text-4xl lg:text-5xl">Helpful answers for pet parents</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-secondary/80 sm:text-lg">
            Find quick guidance on ordering, Cash on Delivery, delivery, and getting support from our friendly team.
          </p>
        </div>
      </section>

      <FaqSection showHeading={false} />

      <section className="mt-8 rounded-[2rem] border border-divider bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-brand-500">Still need a hand?</h2>
            <p className="mt-2 text-secondary/70">Our team is happy to help with products, delivery availability, or an existing order.</p>
          </div>
          <Link href="/contact" className="rounded-full bg-brand-500 px-5 py-3 font-semibold text-surface transition hover:opacity-90">
            Chat with us on WhatsApp
          </Link>
        </div>
      </section>
    </main>
  );
}
