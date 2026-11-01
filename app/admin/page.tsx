import { connectDB } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import AnnouncementSettingsForm from '@/components/admin/AnnouncementSettingsForm';

function StatCard({ title, value, accent = 'text-brand-500' }: { title: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-divider bg-brand-50 p-5 shadow-sm">
      <p className="text-sm font-medium text-secondary/70">{title}</p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await connectDB();

  const [productCount, orderCount, pendingOrderCount, lowStockCount] = await Promise.all([
    Product.countDocuments({}),
    Order.countDocuments({}),
    Order.countDocuments({ status: 'pending' }),
    Product.countDocuments({ stock: { $lt: 5 } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Admin Dashboard</h1>
        <p className="mt-2 text-secondary/70">A quick view of your store health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Products" value={productCount.toString()} />
        <StatCard title="Total Orders" value={orderCount.toString()} />
        <StatCard title="Pending Orders" value={pendingOrderCount.toString()} />
        <StatCard title="Low Stock Products" value={lowStockCount.toString()} />
      </div>

      <AnnouncementSettingsForm />
    </div>
  );
}
