'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useCart, type CartItem } from '@/lib/cart-context';
import { clearBuyNowItem, loadBuyNowItem } from '@/lib/buy-now';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);
}

type FormState = {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState | 'cart', string>>;

const initialFormState: FormState = {
  customerName: '',
  phone: '',
  address: '',
  city: '',
  notes: '',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart: storedCart, clearCart } = useCart();
  // "Buy Now" (/checkout?buyNow=1) checks out only that one item and leaves the cart alone.
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [ready, setReady] = useState(false);
  const cart = useMemo(() => (isBuyNow ? (buyNowItem ? [buyNowItem] : []) : storedCart), [isBuyNow, buyNowItem, storedCart]);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('buyNow') === '1') {
      setIsBuyNow(true);
      setBuyNowItem(loadBuyNowItem());
    }
    setReady(true);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors: FormErrors = {};

    if (cart.length === 0) {
      nextErrors.cart = 'Your cart is empty. Add items before checkout.';
    }

    if (!formData.customerName.trim()) nextErrors.customerName = 'Please enter your full name.';
    if (!formData.phone.trim()) nextErrors.phone = 'Please enter your phone number.';
    if (!formData.address.trim()) nextErrors.address = 'Please enter your delivery address.';
    if (!formData.city.trim()) nextErrors.city = 'Please enter your city.';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          notes: formData.notes.trim() || undefined,
          items: cart.map((item) => ({
            productId: item.productId,
            name: item.name,
            variantLabel: item.variantLabel,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to place your order right now.');
      }

      if (isBuyNow) {
        clearBuyNowItem();
      } else {
        clearCart();
      }
      router.push(`/order-confirmation/${data.data._id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to place your order right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready) {
    return null;
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full rounded-3xl border border-divider bg-surface p-8 text-center shadow-sm">
          <h1 className="font-display text-2xl text-brand-500">Checkout is empty</h1>
          <p className="mt-3 text-secondary/70">Add a few essentials to your cart before placing an order.</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-brand-500 px-5 py-3 font-semibold text-surface transition hover:opacity-90"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-brand-500">Checkout</h1>
        <p className="mt-2 text-secondary/70">Quick, mobile-friendly delivery details for your pet essentials.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-divider bg-brand-50/70 p-5 shadow-sm sm:p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-500" htmlFor="customerName">
              Full Name
            </label>
            <input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="w-full rounded-2xl border border-divider bg-surface px-4 py-3 text-foreground outline-none ring-0"
              placeholder="Enter your full name"
            />
            {errors.customerName ? <p className="mt-2 text-sm text-error">{errors.customerName}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-500" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-2xl border border-divider bg-surface px-4 py-3 text-foreground outline-none ring-0"
              placeholder="03XX-XXXXXXX"
            />
            {errors.phone ? <p className="mt-2 text-sm text-error">{errors.phone}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-500" htmlFor="address">
              Full Address
            </label>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-2xl border border-divider bg-surface px-4 py-3 text-foreground outline-none ring-0"
              placeholder="House number, street, area"
            />
            {errors.address ? <p className="mt-2 text-sm text-error">{errors.address}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-500" htmlFor="city">
              City
            </label>
            <input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded-2xl border border-divider bg-surface px-4 py-3 text-foreground outline-none ring-0"
              placeholder="City"
            />
            {errors.city ? <p className="mt-2 text-sm text-error">{errors.city}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-500" htmlFor="notes">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-2xl border border-divider bg-surface px-4 py-3 text-foreground outline-none ring-0"
              placeholder="Any delivery instructions?"
            />
          </div>

          {errors.cart ? <p className="text-sm text-error">{errors.cart}</p> : null}
          {submitError ? <p className="text-sm text-error">{submitError}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-brand-500 px-4 py-3 font-semibold text-surface transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <aside className="rounded-3xl border border-divider bg-surface p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-xl text-brand-500">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.variantLabel || 'default'}`} className="flex items-start justify-between gap-3 rounded-2xl bg-brand-50/70 p-3">
                <div>
                  <p className="font-semibold text-brand-500">{item.name}</p>
                  {item.variantLabel ? <p className="text-sm text-secondary/70">{item.variantLabel}</p> : null}
                  <p className="text-sm text-secondary/70">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-brand-500">Rs. {formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-divider pt-4">
            <div className="flex items-center justify-between text-lg font-semibold text-brand-500">
              <span>Subtotal</span>
              <span>Rs. {formatPrice(subtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
