import HeroSlideForm from '@/components/admin/HeroSlideForm';

export default function NewHeroSlidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Add Hero Slide</h1>
        <p className="mt-1 text-secondary">Add a new slide to the homepage hero slider.</p>
      </div>

      <HeroSlideForm mode="create" />
    </div>
  );
}
