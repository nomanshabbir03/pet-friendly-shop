import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import type { SiteSettingsData } from '@/lib/site-settings';

type FooterProps = {
  settings: SiteSettingsData;
};

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M21.582 7.186a2.51 2.51 0 0 0-1.766-1.778C18.254 5 12 5 12 5s-6.254 0-7.816.408a2.51 2.51 0 0 0-1.766 1.778A26.3 26.3 0 0 0 2 12a26.3 26.3 0 0 0 .418 4.814 2.51 2.51 0 0 0 1.766 1.778C5.746 19 12 19 12 19s6.254 0 7.816-.408a2.51 2.51 0 0 0 1.766-1.778A26.3 26.3 0 0 0 22 12a26.3 26.3 0 0 0-.418-4.814ZM9.999 15.5v-7l6.001 3.5-6.001 3.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M9 12a4 4 0 1 0 4 4V4c.8 2.2 2.6 3.6 5 3.8" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.022 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.918 8.437-9.94z" />
    </svg>
  );
}

type FooterLinkGroup = { title: string; links: { href: string; label: string }[] };

const linkGroups: FooterLinkGroup[] = [
  {
    title: 'Shop',
    links: [
      { href: '/products', label: 'All Products' },
      { href: '/best-sellers', label: 'Best Sellers' },
      { href: '/cart', label: 'Cart' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/services', label: 'Services' },
      { href: '/contact', label: 'Contact' },
      { href: '/faqs', label: 'FAQs' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/faqs', label: 'Shipping Info' },
      { href: '/faqs', label: 'Returns & Refunds' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export default function Footer({ settings }: FooterProps) {
  const { socialLinks } = settings;
  const socials = [
    { href: socialLinks.facebook, label: 'Facebook', icon: <FacebookIcon /> },
    { href: socialLinks.instagram, label: 'Instagram', icon: <InstagramIcon /> },
    { href: socialLinks.tiktok, label: 'TikTok', icon: <TikTokIcon /> },
    { href: socialLinks.twitter, label: 'Twitter', icon: <TwitterIcon /> },
    { href: socialLinks.youtube, label: 'YouTube', icon: <YoutubeIcon /> },
  ].filter((social) => social.href);

  const phone = settings.phone || settings.whatsappNumber;

  return (
    <footer className="overflow-hidden border-t border-divider bg-surface text-foreground">
      <div className="mx-auto max-w-7xl px-5 pt-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          {/* CONTACT */}
          <div>
            <p className="text-base font-bold text-foreground">Every pet deserves the best</p>
            <ul className="mt-5 space-y-4 text-base text-secondary">
              {settings.email ? (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-3 transition hover:text-brand-500">
                    <Mail className="h-5 w-5 shrink-0 text-brand-500" strokeWidth={1.75} />
                    {settings.email}
                  </a>
                </li>
              ) : null}
              {phone ? (
                <li>
                  <a
                    href={settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : `tel:${phone}`}
                    className="flex items-center gap-3 transition hover:text-brand-500"
                  >
                    <Phone className="h-5 w-5 shrink-0 text-brand-500" strokeWidth={1.75} />
                    {phone}
                  </a>
                </li>
              ) : null}
              {settings.address ? (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" strokeWidth={1.75} />
                  {settings.address}
                </li>
              ) : null}
            </ul>
          </div>

          {/* LINK GROUPS */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="text-base font-bold uppercase tracking-wide text-foreground">{group.title}</p>
              <ul className="mt-5 space-y-4 text-base text-secondary">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition hover:text-brand-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* FOLLOW */}
          {socials.length > 0 ? (
            <div>
              <p className="text-base font-bold uppercase tracking-wide text-foreground">Follow</p>
              <div className="mt-5 flex flex-wrap items-center gap-5 text-foreground">
                {socials.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="transition hover:text-brand-500 [&_svg]:h-6 [&_svg]:w-6"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <p className="mt-14 text-center text-base text-secondary">
          © 2026 Pet’s Friendly Shop. All rights reserved.
        </p>

        <div className="mt-8 border-t border-divider pt-8">
          {/* Oversized wordmark — SVG text stretched to the full container width at any viewport. */}
          <svg
            viewBox="0 0 1000 100"
            role="img"
            aria-label="Pet’s Friendly Shop"
            className="block w-full select-none"
            preserveAspectRatio="xMidYMax meet"
          >
            <text
              x="0"
              y="82"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              className="fill-brand-500"
              style={{ fontSize: 86, fontWeight: 900, fontFamily: 'var(--font-display), sans-serif' }}
            >
              PET’S FRIENDLY SHOP
            </text>
          </svg>
        </div>
      </div>
    </footer>
  );
}
