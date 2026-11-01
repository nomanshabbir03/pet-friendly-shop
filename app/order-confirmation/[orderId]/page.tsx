import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getSiteSettings } from '@/lib/site-settings';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  await connectDB();
  const order = await Order.findById(orderId).lean();

  if (!order) {
    notFound();
  }

  const settings = await getSiteSettings();
  const message = [
    'Order received!',
    `Order ID: ${order._id}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}, ${order.city}`,
    'Items:',
    ...order.items.map((item: { name: string; quantity: number; variantLabel?: string | null }) => {
      const variantText = item.variantLabel ? ` (${item.variantLabel})` : '';
      return `- ${item.name}${variantText} x${item.quantity}`;
    }),
    `Subtotal: Rs. ${formatPrice(Number(order.subtotal || 0))}`,
  ].join('\n');
  const whatsappUrl = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`
    : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-divider bg-surface p-6 shadow-sm sm:p-8">
        <div className="rounded-2xl bg-brand-500/15 p-5">
          <h1 className="font-display text-2xl text-brand-500">Order received!</h1>
          <p className="mt-2 text-secondary/80">Your order has been received and we will reach out shortly.</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl text-brand-500">Order details</h2>
              <p className="mt-1 text-sm text-secondary">Order ID: {String(order._id)}</p>
            </div>

            <div className="rounded-2xl border border-divider bg-brand-50/70 p-4">
              <h3 className="font-semibold text-brand-500">Items</h3>
              <ul className="mt-3 space-y-2 text-secondary/80">
                {order.items.map((item: { name: string; quantity: number; variantLabel?: string | null; price: number }) => (
                  <li key={`${item.name}-${item.variantLabel || 'default'}`} className="flex items-center justify-between gap-3">
                    <span>
                      {item.name}
                      {item.variantLabel ? ` (${item.variantLabel})` : ''} × {item.quantity}
                    </span>
                    <span>Rs. {formatPrice(Number(item.price ?? 0) * Number(item.quantity ?? 0))}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-divider bg-brand-50/70 p-4">
              <h3 className="font-semibold text-brand-500">Delivery address</h3>
              <p className="mt-2 text-secondary/80">{order.address}, {order.city}</p>
              <p className="mt-1 text-secondary/80">{order.customerName}</p>
              <p className="text-secondary/80">{order.phone}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-divider bg-surface p-4">
            <h2 className="font-display text-xl text-brand-500">Summary</h2>
            <div className="mt-4 space-y-2 text-secondary/80">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>Rs. {formatPrice(Number(order.subtotal || 0))}</span>
              </div>
            </div>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brand-500 px-4 py-3 font-semibold text-surface transition hover:opacity-90"
              >
                Confirm via WhatsApp
              </a>
            ) : null}

            <Link href="/" className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-divider px-4 py-3 font-semibold text-brand-500 transition hover:border-error/20 hover:text-error">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
