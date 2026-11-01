import OrdersTable from '@/components/admin/OrdersTable';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-500">Orders</h1>
        <p className="mt-1 text-secondary/70">Track incoming orders and update delivery status.</p>
      </div>

      <OrdersTable />
    </div>
  );
}
