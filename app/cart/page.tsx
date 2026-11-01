'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-divider bg-surface p-8 text-center shadow-sm">
          <h1 className="mb-3 font-display text-2xl text-brand-500">Your cart is empty</h1>
          <p className="mb-6 text-secondary/70">Add some products to start building your order.</p>
          <Link href="/" className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-surface transition hover:opacity-90">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-brand-500">Your Cart</h1>
          <p className="text-secondary/70">Review your selected products and quantities.</p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="rounded-full border border-divider bg-surface px-4 py-2 text-sm font-medium text-secondary/80 transition hover:border-error/20 hover:text-error"
        >
          Clear Cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_0.7fr]">
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.variantLabel || 'default'}`}
              className="flex flex-col gap-4 rounded-2xl border border-divider bg-brand-50/70 p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="h-24 w-full overflow-hidden rounded-xl bg-surface sm:w-24">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-secondary/70">No image</div>
                )}
              </div>

              <div className="flex-1">
                <h2 className="font-display text-lg text-brand-500">{item.name}</h2>
                {item.variantLabel ? <p className="text-sm text-secondary/70">Size: {item.variantLabel}</p> : null}
                <p className="mt-1 font-semibold text-brand-500">Rs. {formatPrice(item.price)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full border border-divider bg-surface">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.variantLabel, item.quantity - 1)}
                    className="px-3 py-2 text-brand-500"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-10 text-center font-semibold text-secondary">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.variantLabel, item.quantity + 1)}
                    className="px-3 py-2 text-brand-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.variantLabel)}
                  className="flex items-center gap-1 text-sm font-medium text-error"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-divider bg-surface p-6 shadow-sm">
          <h2 className="font-display text-xl text-brand-500">Order Summary</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-secondary/80">
              <span>Subtotal</span>
              <span>Rs. {formatPrice(subtotal)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-500 px-4 py-3 font-semibold text-surface transition hover:opacity-90"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
