import VetServiceForm from '@/components/admin/VetServiceForm';

export default function NewVetServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Add Vet Service</h1>
        <p className="mt-1 text-secondary">Add a new card to the homepage Veterinary section.</p>
      </div>

      <VetServiceForm mode="create" />
    </div>
  );
}
