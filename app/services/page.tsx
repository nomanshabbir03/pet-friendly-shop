import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, PawPrint } from 'lucide-react';
import FaqSection from '@/components/faqs/FaqSection';
import { SERVICES_FAQS } from '@/lib/faq-data';
import { getVetServices, type VetServiceData } from '@/lib/vet-services';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = {
  title: 'Services | Pet’s Friendly Shop',
  description: 'Veterinary care, grooming and more — everything Pet’s Friendly Shop can do for your pet.',
};

// Public Unsplash photos (images.unsplash.com is already allowed in next.config.ts). Services are
// admin-managed and have no image field, so a photo is picked from the service title; anything
// unmatched cycles through the generic pool by position so neighbouring cards differ.
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=75`;

const KEYWORD_PHOTOS: Array<{ words: string[]; image: string }> = [
  { words: ['groom', 'trim', 'bath', 'nail', 'spa', 'hair'], image: photo('1516734212186-a967f81ad0d7') },
  { words: ['vaccin', 'immun', 'shot'], image: photo('1561948955-570b270e7c36') },
  { words: ['check', 'exam', 'screen'], image: photo('1558788353-f76d92427f16') },
  { words: ['emergency', 'urgent', 'accident'], image: photo('1599443015574-be5fe8a05783') },
  { words: ['vet', 'medic', 'surg', 'dental', 'health'], image: photo('1612349317150-e413f6a5b16d') },
  { words: ['train', 'behav', 'obedien'], image: photo('1587764379873-97837921fd44') },
  { words: ['board', 'day', 'walk', 'sit'], image: photo('1623387641168-d9803ddd3f35') },
];

const GENERIC_PHOTOS = [
  photo('1537151625747-768eb6cf92b2'),
  photo('1543466835-00a7907e9de1'),
  photo('1583511655857-d19b40a7a54e'),
  photo('1596492784531-6e6eb5ea9993'),
];

function imageFor(service: VetServiceData, index: number) {
  const title = service.title.toLowerCase();
  const match = KEYWORD_PHOTOS.find(({ words }) => words.some((word) => title.includes(word)));
  return match?.image ?? GENERIC_PHOTOS[index % GENERIC_PHOTOS.length];
}

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getVetServices(), getSiteSettings()]);

  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] bg-brand-100 px-6 py-14 text-center sm:py-20">
        <PawPrint className="pointer-events-none absolute -left-6 top-6 h-44 w-44 -rotate-12 text-brand-200" strokeWidth={1} />
        <PawPrint className="pointer-events-none absolute -right-6 bottom-4 h-44 w-44 rotate-12 text-brand-200" strokeWidth={1} />

        <div className="relative">
          <span className="inline-block rounded-full bg-brand-200 px-4 py-1.5 text-sm font-semibold text-brand-800">
            Our Services
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold text-foreground sm:text-6xl">Services</h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-secondary sm:text-lg">
            Find here all the things we can do for your pet.
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section>
        <div className="mb-8 border-b border-divider pb-3">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Latest services</h2>
        </div>

        {services.length === 0 ? (
          <p className="rounded-2xl border border-divider bg-surface p-6 text-secondary">
            Our services are coming soon.
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-14 pb-20 sm:grid-cols-2">
            {services.map((service, index) => {
              // Emergency services have no detail page (it redirects) — they open WhatsApp instead,
              // same wa.me pattern as the homepage Veterinary section.
              const whatsappHref = settings.whatsappNumber
                ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                    `Hi, I need help with ${service.title.toLowerCase()} for my pet.`
                  )}`
                : '/contact';
              const href = service.isEmergency ? whatsappHref : `/veterinary/${service.slug}`;
              const external = service.isEmergency && href.startsWith('http');

              return (
                <article key={service._id} className="relative">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                    <Image
                      src={imageFor(service, index)}
                      alt={service.title}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="relative z-10 mx-auto -mb-16 -mt-14 w-[82%] rounded-2xl border border-divider bg-surface p-5 shadow-lg">
                    <h3 className="text-lg font-bold text-foreground">{service.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-secondary">{service.shortDescription}</p>
                    <Link
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-surface transition hover:opacity-90"
                    >
                      {service.isEmergency ? 'Chat Now' : 'View Service'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <FaqSection categories={SERVICES_FAQS} />
    </main>
  );
}
