import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

const statusClasses: Record<string, string> = {
  pending: 'bg-accent-100 text-accent-600',
  confirmed: 'bg-accent-100 text-accent-600',
  shipped: 'bg-accent-100 text-accent-600',
  delivered: 'bg-accent-100 text-accent-600',
  cancelled: 'bg-error/20 text-error',
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const order = await Order.findById(id).lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-500">Order Details</h1>
          <p className="mt-1 text-secondary/70">{String(order._id)}</p>
        </div>
        <Link href="/admin/orders" className="rounded-full border border-divider px-4 py-2 text-sm font-semibold text-brand-500 hover:bg-brand-50">
          Back to Orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-divider bg-brand-50 p-4">
            <h2 className="font-display text-xl text-brand-500">Customer</h2>
            <p className="mt-2 text-secondary/80">{order.customerName}</p>
            <p className="text-secondary/80">{order.phone}</p>
            <p className="text-secondary/80">{order.address}, {order.city}</p>
            {order.notes ? <p className="mt-2 text-sm text-secondary/70">Notes: {order.notes}</p> : null}
          </div>

          <div className="rounded-2xl border border-divider bg-surface p-4">
            <h2 className="font-display text-xl text-brand-500">Items</h2>
            <ul className="mt-3 space-y-2">
              {order.items.map((item: any) => (
                <li key={`${item.name}-${item.variantLabel || 'default'}`} className="flex items-center justify-between gap-3 rounded-xl bg-brand-50/70 p-3">
                  <span>
                    {item.name}
                    {item.variantLabel ? ` (${item.variantLabel})` : ''} × {item.quantity}
                  </span>
                  <span>Rs. {formatPrice(Number(item.price) * Number(item.quantity))}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-divider bg-surface p-4">
          <h2 className="font-display text-xl text-brand-500">Summary</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-secondary/80">
              <span>Subtotal</span>
              <span>Rs. {formatPrice(Number(order.subtotal || 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-500">Current Status</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[order.status]}`}>{order.status}</span>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-brand-500">Update Status</label>
            <form action={`/api/admin/orders/${order._id}`} method="PATCH" className="flex gap-2">
              <select name="status" defaultValue={order.status} className="flex-1 rounded-2xl border border-divider px-3 py-2 text-foreground">
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
              <button type="submit" className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface">
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
