import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { connectDB } from '@/lib/mongodb';
import VetService from '@/lib/models/VetService';
import { resolveVetServiceIcon } from '@/constants/vet-service-icons';

// Public Unsplash photo (images.unsplash.com is already allowed in next.config.ts).
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?auto=format&fit=crop&w=1000&q=75';

type VetServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

type VetServiceDocument = {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  shortDescription?: string;
  detailContent?: string;
  isEmergency?: boolean;
  isActive?: boolean;
};

async function getVetService(slug: string): Promise<VetServiceDocument | null> {
  await connectDB();
  const service = await VetService.findOne({ slug, isActive: true }).lean();

  if (!service) {
    return null;
  }

  return JSON.parse(JSON.stringify(service)) as VetServiceDocument;
}

export async function generateMetadata({ params }: VetServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getVetService(slug);

  if (!service) {
    return {};
  }

  return {
    title: `${service.title} | Pet’s Friendly Shop Veterinary Services`,
    description: service.shortDescription || undefined,
  };
}

// Same hero + section-heading approach as the About and Contact pages. The hero band picks up
// the Veterinary section's yellow tint; everything else stays on the site's red brand theme.
export default async function VetServiceDetailPage({ params }: VetServiceDetailPageProps) {
  const { slug } = await params;
  const service = await getVetService(slug);

  if (!service) {
    notFound();
  }

  // Emergency services redirect to WhatsApp on the homepage card — they never have their own
  // detail page. A stale/direct link to one lands back at the Veterinary section instead of
  // a 404.
  if (service.isEmergency) {
    redirect('/#veterinary');
  }

  const Icon = resolveVetServiceIcon(service.icon);

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] bg-vet-yellow-100">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="px-6 pt-10 sm:px-10 lg:py-14 lg:pl-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-vet-yellow-300 px-4 py-1.5 text-sm font-semibold text-vet-yellow-900">
              <Icon className="h-4 w-4" strokeWidth={2} />
              Veterinary Services
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              {service.title}
            </h1>
            <span className="mt-5 block h-1 w-16 rounded-full bg-brand-500" />
            {service.shortDescription ? (
              <p className="mt-5 max-w-md text-base leading-7 text-secondary sm:text-lg">{service.shortDescription}</p>
            ) : null}
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-surface transition hover:opacity-90"
            >
              Book an Appointment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[400px]">
            <Image
              src={HERO_IMAGE}
              alt="A cat and a dog resting together"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section>
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">The visit</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">What to expect</h2>
          <span className="mx-auto mt-4 block h-1 w-16 rounded-full bg-brand-500" />
        </div>

        <div className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-divider bg-surface p-6 text-base leading-7 text-secondary shadow-sm sm:p-8 sm:text-lg sm:leading-8">
          {service.detailContent ? (
            service.detailContent
              .split('\n')
              .filter(Boolean)
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p>More details on this service are coming soon.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-[2rem] bg-brand-50 p-6 sm:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Ready to book?</h2>
            <p className="mt-2 text-secondary">Reach out and our team will help set up your visit.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-surface transition hover:opacity-90"
            >
              Book an Appointment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#veterinary"
              className="rounded-full border border-brand-500 bg-surface px-6 py-3 font-semibold text-brand-500 transition hover:bg-brand-500 hover:text-surface"
            >
              All Veterinary Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
