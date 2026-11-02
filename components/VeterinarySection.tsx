'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Stethoscope } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { resolveVetServiceIcon } from '@/constants/vet-service-icons';
import type { VetServiceData } from '@/lib/vet-services';

// Public Unsplash photo (images.unsplash.com is already allowed in next.config.ts).
const VET_IMAGE =
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=75';

type VeterinarySectionProps = {
  services: VetServiceData[];
  // From SiteSettings (lib/site-settings.ts) — reused as-is for emergency cards' WhatsApp
  // link, same source the floating WhatsApp button uses. Not used at all if no service is
  // flagged isEmergency.
  whatsappNumber: string;
};

// Intentional exception to the site's red brand theme — dominant yellow (--color-vet-yellow-*,
// defined in app/globals.css) sets this section apart as "services" rather than "shopping".
// Admin-managed via /admin/vet-services — see lib/models/VetService.ts.
export default function VeterinarySection({ services, whatsappNumber }: VeterinarySectionProps) {
  // If this page was reached via a `#veterinary` link from elsewhere (e.g. the floating
  // stethoscope quick-link on another page), smooth-scroll to this section once mounted.
  useEffect(() => {
    if (window.location.hash === '#veterinary') {
      document.getElementById('veterinary')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  if (services.length === 0) {
    return null;
  }

  const vetChatUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi, I need help from a vet for my pet.')}`
    : null;

  return (
    <div id="veterinary" className="scroll-mt-36 lg:scroll-mt-24">
      {/* Mobile — one compact card; the full service list lives on /services */}
      <section className="mt-8 overflow-hidden rounded-2xl bg-vet-yellow-400 p-5 lg:hidden">
        <div className="flex items-center gap-3">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/70">
            <Image src={VET_IMAGE} alt="Our veterinarian" fill sizes="56px" className="object-cover object-top" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-vet-yellow-900/80">Pet health care</p>
            <h2 className="font-display text-xl font-bold text-vet-yellow-900">Veterinary Services</h2>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {services.map((service) => (
            <span key={service._id} className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-vet-yellow-900">
              {service.title}
            </span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href="/services"
            className="flex items-center justify-center gap-1.5 rounded-full bg-vet-yellow-900 px-3 py-2.5 text-sm font-semibold text-white"
          >
            <Stethoscope className="h-4 w-4" />
            View Services
          </Link>
          {vetChatUrl && (
            <a
              href={vetChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2.5 text-sm font-semibold text-vet-yellow-900"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
              Chat with Vet
            </a>
          )}
        </div>
      </section>

      <section
        className="mt-16 hidden overflow-hidden rounded-[2rem] bg-vet-yellow-400 px-5 py-10 shadow-sm sm:px-8 lg:block lg:px-12 lg:py-14"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-vet-yellow-900/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.2em] text-vet-yellow-900">
            Pet health care
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold text-vet-yellow-900 sm:text-4xl">
            Veterinary Services
          </h2>
          <span className="mx-auto mt-4 block h-1 w-16 rounded-full bg-vet-yellow-900" />
          <p className="mt-5 text-base leading-7 text-vet-yellow-900/80 sm:text-lg">
            Trusted care for every stage of your pet&apos;s life, from routine checkups to urgent visits.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {services.map((service) => {
            const Icon = resolveVetServiceIcon(service.icon);
            const cardClassName =
              'group flex flex-col items-center rounded-3xl bg-surface p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg';
            const cardContent = (
              <>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-vet-yellow-100 transition group-hover:bg-vet-yellow-200">
                  <Icon className="h-9 w-9 text-vet-yellow-700" strokeWidth={1.6} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-foreground">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-secondary">{service.shortDescription}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-vet-yellow-700">
                  {service.isEmergency ? 'Chat now' : 'Learn more'}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </>
            );

            // Emergency cards open WhatsApp directly instead of a detail page — same wa.me URL
            // pattern the floating WhatsApp button uses (components/FloatingWhatsAppButton.tsx),
            // reusing the same settings-driven number rather than a hardcoded one.
            if (service.isEmergency) {
              const message = `Hi, I need help with ${service.title.toLowerCase()} for my pet.`;
              const href = whatsappNumber
                ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
                : undefined;

              return (
                <a
                  key={service._id}
                  href={href}
                  target={href ? '_blank' : undefined}
                  rel={href ? 'noopener noreferrer' : undefined}
                  aria-disabled={!href}
                  className={`${cardClassName} ${!href ? 'pointer-events-none opacity-60' : ''}`}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <Link key={service._id} href={`/veterinary/${service.slug}`} className={cardClassName}>
                {cardContent}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 rounded-3xl bg-vet-yellow-50 p-5 sm:flex-row sm:justify-between sm:px-8">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <span className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-full sm:block">
              <Image src={VET_IMAGE} alt="Our veterinarian" fill sizes="64px" className="object-cover object-top" />
            </span>
            <div>
              <p className="text-lg font-bold text-vet-yellow-900">Not sure what your pet needs?</p>
              <p className="text-sm text-vet-yellow-900/80">Talk to our team and we will guide you to the right care.</p>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-vet-yellow-900 px-6 py-3 text-sm font-semibold text-vet-yellow-50 transition hover:bg-vet-yellow-800"
          >
            Book an Appointment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
