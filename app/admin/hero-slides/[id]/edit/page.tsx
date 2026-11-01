import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import HeroSlide from '@/lib/models/HeroSlide';
import HeroSlideForm from '@/components/admin/HeroSlideForm';

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const slide = await HeroSlide.findById(id).lean();

  if (!slide) {
    notFound();
  }

  // Safely convert the Mongoose lean doc (ObjectId, Date, etc.) to plain, serializable
  // values before handing it to the client component — mirrors the pattern used by
  // EditBrandPage (app/admin/brands/[id]/edit/page.tsx).
  const plainSlide = JSON.parse(JSON.stringify(slide));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Edit Hero Slide</h1>
        <p className="mt-1 text-secondary">Update this slide&apos;s image, text, button, or order.</p>
      </div>

      <HeroSlideForm mode="edit" slideId={String(slide._id)} initialValues={plainSlide} />
    </div>
  );
}
