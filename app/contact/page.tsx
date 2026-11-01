import type { Metadata } from 'next';
import ContactPageClient from '@/components/contact/ContactPageClient';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = {
  title: 'Contact Us | Pet’s Friendly Shop',
  description: 'Reach Pet’s Friendly Shop by WhatsApp, phone, or email for pet essentials and friendly support.',
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return <ContactPageClient settings={settings} />;
}
