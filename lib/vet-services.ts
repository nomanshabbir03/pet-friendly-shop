import { cache } from 'react';
import { connectDB } from '@/lib/mongodb';
import VetService from '@/lib/models/VetService';

export type VetServiceData = {
  _id: string;
  title: string;
  slug: string;
  icon: string;
  shortDescription: string;
  detailContent: string;
  isEmergency: boolean;
  order: number;
};

// Single source of truth for the homepage VeterinarySection. Wrapped in React's cache() so
// app/page.tsx and any other same-request caller share one DB read, matching the pattern
// already used by getLiveCategories()/getSiteSettings()/getHeroSlides.
export const getVetServices = cache(async (): Promise<VetServiceData[]> => {
  await connectDB();
  const services = await VetService.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

  return JSON.parse(JSON.stringify(services)).map((service: {
    _id: string;
    title: string;
    slug: string;
    icon?: string;
    shortDescription?: string;
    detailContent?: string;
    isEmergency?: boolean;
    order?: number;
  }) => ({
    _id: service._id,
    title: service.title,
    slug: service.slug,
    icon: service.icon || '',
    shortDescription: service.shortDescription || '',
    detailContent: service.detailContent || '',
    isEmergency: Boolean(service.isEmergency),
    order: service.order ?? 0,
  }));
});
