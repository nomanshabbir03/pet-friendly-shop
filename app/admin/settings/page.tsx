import SiteSettingsForm from '@/components/admin/SiteSettingsForm';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Site Settings</h1>
        <p className="mt-1 text-secondary">Manage the contact, shop, and social info shown across the site.</p>
      </div>

      <SiteSettingsForm />
    </div>
  );
}
