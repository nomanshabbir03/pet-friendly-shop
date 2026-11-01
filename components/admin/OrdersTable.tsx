'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusClasses: Record<string, string> = {
  pending: 'bg-accent-100 text-accent-600',
  confirmed: 'bg-surface text-foreground',
  shipped: 'bg-accent-100 text-accent-600',
  delivered: 'bg-accent-100 text-accent-600',
  cancelled: 'bg-error/20 text-error',
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
      setLoading(false);
    }

    loadOrders();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      setOrders((current) => current.map((order) => (order._id === id ? { ...order, status } : order)));
    }
  };

  if (loading) {
    return <div className="rounded-2xl bg-brand-50 p-6 text-secondary/70">Loading orders…</div>;
  }

  return (
    <div className="rounded-2xl border border-divider bg-surface shadow-sm">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-divider text-sm">
        <thead className="bg-brand-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Order</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Customer</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Items</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Subtotal</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-brand-500">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-forest/10">
          {orders.map((order) => (
            <tr key={order._id} className="bg-surface/70">
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${order._id}`} className="font-semibold text-brand-500 hover:underline">
                  {String(order._id).slice(-6)}
                </Link>
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold text-brand-500">{order.customerName}</div>
                <div className="text-xs text-secondary/70">{order.phone}</div>
              </td>
              <td className="px-4 py-3 text-secondary">{order.items?.length ?? 0}</td>
              <td className="px-4 py-3 text-secondary">Rs. {order.subtotal}</td>
              <td className="px-4 py-3">
                <select
                  value={order.status}
                  onChange={(event) => handleStatusChange(order._id, event.target.value)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[order.status]}`}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
