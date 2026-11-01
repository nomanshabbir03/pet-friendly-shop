import { cache } from 'react';
import { connectDB } from '@/lib/mongodb';
import SiteSettings, { SITE_SETTINGS_SINGLETON_ID } from '@/lib/models/SiteSettings';

export type SiteSettingsData = {
  email: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
  };
  deliveryInfo: string;
  shopInfo: string;
};

const EMPTY_SETTINGS: SiteSettingsData = {
  email: '',
  phone: '',
  whatsappNumber: '',
  address: '',
  socialLinks: { facebook: '', instagram: '', twitter: '', tiktok: '', youtube: '' },
  deliveryInfo: '',
  shopInfo: '',
};

// Single source of truth for every Server Component that needs contact/shop info (Footer,
// TrustBar, Contact page, order-confirmation, layout.tsx for the floating WhatsApp button).
// Always returns a fully-shaped object (never null/undefined, never missing a nested
// socialLinks key) so callers can do simple `{settings.email && ...}` checks without optional
// chaining everywhere. Wrapped in React's cache() so multiple callers within the same request
// (e.g. layout.tsx + a page) share one DB read, same pattern as getLiveCategories().
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  await connectDB();
  const doc = await SiteSettings.findById(SITE_SETTINGS_SINGLETON_ID).lean<Partial<SiteSettingsData> | null>();

  if (!doc) {
    return EMPTY_SETTINGS;
  }

  return {
    email: doc.email || '',
    phone: doc.phone || '',
    whatsappNumber: doc.whatsappNumber || '',
    address: doc.address || '',
    socialLinks: {
      facebook: doc.socialLinks?.facebook || '',
      instagram: doc.socialLinks?.instagram || '',
      twitter: doc.socialLinks?.twitter || '',
      tiktok: doc.socialLinks?.tiktok || '',
      youtube: doc.socialLinks?.youtube || '',
    },
    deliveryInfo: doc.deliveryInfo || '',
    shopInfo: doc.shopInfo || '',
  };
});
