import Link from 'next/link';
import VetServicesTable from '@/components/admin/VetServicesTable';

export default function AdminVetServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-500">Veterinary Services</h1>
          <p className="mt-1 text-secondary">Manage the cards shown in the homepage Veterinary section.</p>
        </div>
        <Link
          href="/admin/vet-services/new"
          className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90"
        >
          Add Service
        </Link>
      </div>

      <VetServicesTable />
    </div>
  );
}
