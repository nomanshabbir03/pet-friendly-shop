'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import FaqSection from '@/components/faqs/FaqSection';
import { CONTACT_FAQS } from '@/lib/faq-data';
import { ArrowRight, Clock3, MapPin, MessageCircleMore, PawPrint, Phone } from 'lucide-react';
import type { SiteSettingsData } from '@/lib/site-settings';

// Public Unsplash photo (images.unsplash.com is already allowed in next.config.ts).
const HERO_IMAGE = 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=800&q=75';

type ContactPageClientProps = {
  settings: SiteSettingsData;
};

type FormErrors = { firstName?: string; contact?: string; message?: string };

const TOPICS = ['Product question', 'Order help', 'Delivery & returns', 'Something else / not sure yet'];

const fieldClass =
  'w-full rounded-full border border-divider bg-surface px-5 py-2.5 text-base text-foreground outline-none transition placeholder:text-muted focus:border-brand-500';

function buildWhatsAppUrl(whatsappNumber: string, message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// Pill button with a white circle holding an arrow — shared by "Email us" and "Send Message".
function PillButtonContent({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-brand-500">
        <ArrowRight className="h-5 w-5" />
      </span>
    </>
  );
}

const pillButtonClass =
  'inline-flex items-center gap-4 rounded-full bg-brand-500 py-1.5 pl-6 pr-1.5 text-sm font-semibold text-surface shadow-lg shadow-brand-500/30 transition hover:opacity-90';

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [topic, setTopic] = useState(TOPICS[TOPICS.length - 1]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (key: keyof FormErrors) => setErrors((current) => ({ ...current, [key]: undefined }));

  // TODO: wire this form to email or a backend later.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!firstName.trim()) nextErrors.firstName = 'Please enter your first name.';
    if (!contact.trim()) nextErrors.contact = 'Please enter your email or phone.';
    if (!message.trim()) nextErrors.message = 'Please leave a short message.';

    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-[2rem] bg-surface p-5 shadow-sm sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground" htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              clearError('firstName');
            }}
            className={fieldClass}
            placeholder="Enter your first name..."
          />
          {errors.firstName ? <p className="mt-2 text-sm text-error">{errors.firstName}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground" htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className={fieldClass}
            placeholder="Enter your last name..."
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground" htmlFor="contact">
          Email or phone
        </label>
        <input
          id="contact"
          name="contact"
          value={contact}
          onChange={(event) => {
            setContact(event.target.value);
            clearError('contact');
          }}
          className={fieldClass}
          placeholder="you@example.com or 03XX-XXXXXXX"
        />
        {errors.contact ? <p className="mt-2 text-sm text-error">{errors.contact}</p> : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground" htmlFor="topic">
          What do you need?
        </label>
        <select
          id="topic"
          name="topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className={fieldClass}
        >
          {TOPICS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground" htmlFor="message">
          How can we help you?
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            clearError('message');
          }}
          className="w-full rounded-3xl border border-divider bg-surface px-5 py-2.5 text-base text-foreground outline-none transition placeholder:text-muted focus:border-brand-500"
          placeholder="Enter your message..."
        />
        {errors.message ? <p className="mt-2 text-sm text-error">{errors.message}</p> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {submitted ? (
          <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
            Message received — we will reply shortly.
          </p>
        ) : (
          <span />
        )}

        <button type="submit" className={pillButtonClass}>
          <PillButtonContent>Send Message</PillButtonContent>
        </button>
      </div>
    </form>
  );
}

export default function ContactPageClient({ settings }: ContactPageClientProps) {
  const whatsappUrl = settings.whatsappNumber
    ? buildWhatsAppUrl(settings.whatsappNumber, 'Hi, I have a question about Pet’s Friendly Shop products.')
    : null;

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] bg-brand-100">
        <PawPrint className="pointer-events-none absolute -left-6 top-10 h-48 w-48 -rotate-12 text-brand-200" strokeWidth={1} />

        <div className="relative grid items-center gap-8 lg:grid-cols-2">
          <div className="flex justify-center px-6 pt-10 lg:justify-end lg:pr-10">
            <div className="relative aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-t-[10rem] rounded-b-3xl bg-brand-200 lg:max-w-[380px]">
              <Image
                src={HERO_IMAGE}
                alt="A fluffy white dog smiling"
                fill
                priority
                sizes="(min-width: 1024px) 380px, 340px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="px-6 pb-12 text-center lg:py-14 lg:pr-14 lg:text-left">
            <span className="inline-block rounded-full bg-brand-200 px-4 py-1.5 text-sm font-semibold text-brand-800">
              Contact Us
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] text-foreground sm:text-6xl">
              Get to
              <br />
              <span className="text-brand-500">Know Us</span>
            </h1>
            <p className="mt-6 text-lg font-semibold text-foreground">We love pets like you do :)</p>
            <p className="mx-auto mt-2 max-w-sm text-base leading-7 text-secondary lg:mx-0">
              Questions, product advice or help with an order — a real person from the Pet’s Friendly Shop team is happy to help.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <a href="#contact-form" className={pillButtonClass}>
                <PillButtonContent>Write to us</PillButtonContent>
              </a>
              {settings.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="inline-flex items-center gap-2 rounded-full bg-surface px-5 py-3.5 text-sm font-semibold text-foreground shadow-sm transition hover:text-brand-500"
                >
                  <Phone className="h-4 w-4 text-brand-500" />
                  Call us today · {settings.phone}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="contact-form" className="scroll-mt-36 lg:scroll-mt-24 rounded-[2rem] bg-brand-50 px-5 py-8 sm:px-10 lg:px-12 lg:py-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
          {/* LEFT — intro + contact details */}
          <div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl">
              Get in
              <span className="ml-4 inline-block h-[3px] w-14 align-middle bg-brand-500" />
              <br />
              touch <span className="text-brand-500">with us</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-secondary">
              We&apos;re here to help! Whether you have a question about a product, need help with an order, or just want
              advice for your pet, our team is ready to assist you.
            </p>

            <div className="mt-6 space-y-4">
              {settings.email ? (
                <div>
                  <p className="text-sm text-secondary">Email:</p>
                  <a href={`mailto:${settings.email}`} className="mt-0.5 block text-lg text-foreground transition hover:text-brand-500">
                    {settings.email}
                  </a>
                </div>
              ) : null}

              {settings.phone ? (
                <div>
                  <p className="text-sm text-secondary">Phone:</p>
                  <a href={`tel:${settings.phone}`} className="mt-0.5 block text-lg text-foreground transition hover:text-brand-500">
                    {settings.phone}
                  </a>
                </div>
              ) : null}

              {settings.address ? (
                <div className="flex items-start gap-3 text-secondary">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" strokeWidth={1.75} />
                  <span>{settings.address}</span>
                </div>
              ) : null}

              {settings.shopInfo ? (
                <div className="flex items-start gap-3 text-secondary">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" strokeWidth={1.75} />
                  <span>{settings.shopInfo}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {settings.email ? (
                <a href={`mailto:${settings.email}`} className={pillButtonClass}>
                  <PillButtonContent>Email us</PillButtonContent>
                </a>
              ) : null}

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 rounded-full border border-brand-500 bg-surface px-6 py-3.5 text-sm font-semibold text-brand-500 transition hover:bg-brand-500 hover:text-surface"
                >
                  <MessageCircleMore className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
              ) : null}
            </div>
          </div>

          {/* RIGHT — form card */}
          <ContactForm />
        </div>
      </section>

      <FaqSection categories={CONTACT_FAQS} />
    </main>
  );
}
