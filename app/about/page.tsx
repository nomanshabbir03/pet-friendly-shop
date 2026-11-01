import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import FaqSection from '@/components/faqs/FaqSection';
import { ABOUT_FAQS } from '@/lib/faq-data';
import {
  Gift,
  HeartHandshake,
  MessageCircleMore,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
  type LucideIcon,
} from 'lucide-react';

export const metadata: Metadata = {
  // title: 'About Us | Pet’s Friendly Shop',
  // description: 'Learn about Pet’s Friendly Shop, a trusted Pakistani pet store offering curated essentials and friendly WhatsApp-based ordering.',
};

// Public Unsplash photos (images.unsplash.com is already allowed in next.config.ts).
const photo = (id: string, width = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

const IMAGES = {
  hero: photo('1537151625747-768eb6cf92b2', 1000),
  beagle: photo('1543466835-00a7907e9de1'),
  cat: photo('1514888286974-6c03e2ca1dba'),
  puppy: photo('1576201836106-db1758fd1c97'),
  friends: photo('1548199973-03cce0bbc87b', 1000),
  frenchie: photo('1583511655857-d19b40a7a54e', 1000),
  shepherd: photo('1587300003388-59208cc962cb', 1000),
  hamster: photo('1425082661705-1834bfd09dca', 600),
  playful: photo('1450778869180-41d0601e046e', 1000),
};

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
};

function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="mb-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
      <span className="mx-auto mt-4 block h-1 w-16 rounded-full bg-brand-500" />
    </div>
  );
}

const introCards = [
  {
    image: IMAGES.beagle,
    label: 'Our Story',
    title: 'Pet Experts',
    text: 'A warm, locally rooted pet store making everyday pet care simple for families across Pakistan.',
  },
  {
    image: IMAGES.cat,
    label: 'Our Range',
    title: 'Carefully Curated',
    text: 'Food, toys, grooming and daily comforts — only items we would feel comfortable using at home.',
  },
  {
    image: IMAGES.puppy,
    label: 'Our Service',
    title: 'Real People',
    text: 'Order by chat and get real guidance from a team that knows every product we sell.',
  },
];

type Feature = { icon: LucideIcon; title: string; text: string };

const features: Feature[] = [
  { icon: ShieldCheck, title: 'Quality Checked', text: 'Every item is selected with care for dependable everyday use.' },
  { icon: Truck, title: 'Local Delivery', text: 'Friendly delivery for pet essentials across the city and beyond.' },
  { icon: MessageCircleMore, title: 'Order on WhatsApp', text: 'No card checkout needed — just confirm your order by chat.' },
  { icon: HeartHandshake, title: 'Helpful Guidance', text: 'Not sure what your pet needs? We are happy to advise.' },
  { icon: PackageCheck, title: 'Everyday Essentials', text: 'Food, toys, grooming supplies and daily comforts in one place.' },
  { icon: Gift, title: 'Pet Accessories', text: 'Cute, practical extras to keep your pet comfortable and stylish.' },
];

const stats = [
  { icon: ShieldCheck, value: '100%', label: 'Handpicked', text: 'Every product is chosen by our team.' },
  { icon: MessageCircleMore, value: 'Same day', label: 'Response', text: 'We reply to your messages quickly.' },
  { icon: Truck, value: 'Pakistan', label: 'Wide delivery', text: 'Serving pet parents across the country.' },
];

const gallery = [IMAGES.frenchie, IMAGES.friends, IMAGES.hamster, IMAGES.shepherd];

type SplitRowProps = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  text: string;
  reverse?: boolean;
  tinted?: boolean;
};

function SplitRow({ image, alt, eyebrow, title, text, reverse, tinted }: SplitRowProps) {
  return (
    <section className={`${tinted ? 'bg-accent-50' : ''} rounded-[2rem] px-5 py-10 sm:px-10 lg:px-14`}>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl shadow-sm ${reverse ? 'lg:order-2' : ''}`}>
          <Image src={image} alt={alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-7 text-secondary/80 sm:text-lg">{text}</p>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-16 px-4 py-8 sm:space-y-20 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="overflow-hidden rounded-[2rem] bg-brand-50">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="px-6 pt-10 sm:px-10 lg:py-14 lg:pl-14">
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              About Us
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold text-foreground sm:text-5xl">About</h1>
            <p className="font-display text-5xl font-bold text-brand-500 sm:text-6xl">Pet’s Friendly Shop</p>
            <p className="mt-5 font-semibold text-foreground">We love pets like you do :)</p>
            <p className="mt-2 max-w-md text-base leading-7 text-secondary/80">
              Thoughtfully chosen essentials, friendly guidance and simple ordering for pet parents across Pakistan.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex rounded-full bg-brand-500 px-6 py-3 font-semibold text-surface transition hover:opacity-90"
            >
              Shop now
            </Link>
          </div>

          <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[420px]">
            <Image
              src={IMAGES.hero}
              alt="A happy corgi puppy"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* GET TO KNOW MORE */}
      <section>
        <SectionHeading eyebrow="Intro" title="Get to know more" />

        <div className="grid gap-6 md:grid-cols-3">
          {introCards.map((card) => (
            <article key={card.title} className="overflow-hidden rounded-3xl border border-divider bg-surface shadow-sm">
              <div className="relative aspect-[3/2]">
                <Image src={card.image} alt={card.title} fill sizes="(min-width: 768px) 360px, 100vw" className="object-cover" />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">{card.label}</p>
                <h3 className="mt-2 font-display text-xl font-bold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-secondary/80">{card.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <SplitRow
        tinted
        image={IMAGES.friends}
        alt="Two happy dogs running together"
        eyebrow="Philosophy"
        title="We take pet care to a new level"
        text="Pet parents deserve more than a cart full of products — they deserve a store that feels personal, transparent and easy to trust. That is why we handpick what we sell and back every order with real human guidance."
      />

      {/* FEATURES */}
      <section>
        <SectionHeading eyebrow="Features" title="Only the best features" />

        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100">
                <feature.icon className="h-7 w-7 text-accent-600" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-secondary/80">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ALTERNATING ROWS */}
      <div className="space-y-10">
        <SplitRow
          image={IMAGES.frenchie}
          alt="A French bulldog in a yellow sweater"
          eyebrow="Our promise"
          title="Your pet, treated well"
          text="Food, toys, grooming supplies and daily comforts — we stock the everyday favourites your pet will actually enjoy, so you can shop with confidence."
        />
        <SplitRow
          reverse
          image={IMAGES.shepherd}
          alt="A happy dog on the beach"
          eyebrow="Our service"
          title="Simple, friendly ordering"
          text="Pick what you like, message us on WhatsApp and our team confirms your order personally — friendly, clear and convenient from first click to final delivery."
        />
      </div>

      {/* NUMBERS */}
      <section>
        <SectionHeading eyebrow="Numbers" title="Experience that matters" />

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl bg-brand-50 p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100">
                <stat.icon className="h-6 w-6 text-accent-600" strokeWidth={1.75} />
              </div>
              <p className="mt-5 font-display text-4xl font-bold text-brand-500">{stat.value}</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{stat.label}</p>
              <p className="mt-2 text-sm leading-6 text-secondary/80">{stat.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Our Pet’s Friendly Shop family
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">Happy pets, happy homes</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {gallery.map((src, index) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={src}
                alt={`Happy pet ${index + 1}`}
                fill
                sizes="(min-width: 768px) 270px, 50vw"
                className="object-cover transition duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      <FaqSection categories={ABOUT_FAQS} />

      {/* CTA */}
      <section className="rounded-[2rem] border border-divider bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Have questions?</h2>
            <p className="mt-2 text-secondary/70">We are always happy to help with product questions or order guidance.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-full bg-brand-500 px-5 py-3 font-semibold text-surface transition hover:opacity-90">
              Chat with us on WhatsApp
            </Link>
            <Link href="/" className="rounded-full border border-divider px-5 py-3 font-semibold text-brand-500 transition hover:border-error/20 hover:text-error">
              Browse our catalog
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
