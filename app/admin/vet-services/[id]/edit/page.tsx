import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import VetService from '@/lib/models/VetService';
import VetServiceForm from '@/components/admin/VetServiceForm';

export default async function EditVetServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const service = await VetService.findById(id).lean();

  if (!service) {
    notFound();
  }

  // Safely convert the Mongoose lean doc (ObjectId, Date, etc.) to plain, serializable
  // values before handing it to the client component — mirrors EditBrandPage/EditHeroSlidePage.
  const plainService = JSON.parse(JSON.stringify(service));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Edit Vet Service</h1>
        <p className="mt-1 text-secondary">Update this service&apos;s content, icon, or emergency behavior.</p>
      </div>

      <VetServiceForm mode="edit" serviceId={String(service._id)} initialValues={plainService} />
    </div>
  );
}
