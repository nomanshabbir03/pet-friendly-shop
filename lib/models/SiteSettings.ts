import { Schema, models, model } from 'mongoose';

// Singleton document — there is only ever one SiteSettings, identified by this fixed id.
// Mirrors the Announcement model's singleton pattern (lib/models/Announcement.ts).
export const SITE_SETTINGS_SINGLETON_ID = 'singleton';

const SiteSettingsSchema = new Schema(
  {
    _id: {
      type: String,
      default: SITE_SETTINGS_SINGLETON_ID,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      trim: true, // digits only, no +/spaces — matches the wa.me URL format already used site-wide
    },
    address: {
      type: String,
      trim: true, // shop location text
    },
    socialLinks: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      tiktok: { type: String, trim: true },
      youtube: { type: String, trim: true },
    },
    deliveryInfo: {
      type: String,
      trim: true,
    },
    shopInfo: {
      type: String,
      trim: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

export default models.SiteSettings || model('SiteSettings', SiteSettingsSchema);
