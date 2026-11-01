import type { CartItem } from '@/lib/cart-context';

// "Buy Now" checks out a single item without touching the persisted cart. The item is parked in
// sessionStorage (per-tab, cleared when the tab closes) and /checkout?buyNow=1 reads it.
const BUY_NOW_KEY = 'petstar-buy-now';

export const BUY_NOW_CHECKOUT_URL = '/checkout?buyNow=1';

export function saveBuyNowItem(item: CartItem) {
  try {
    window.sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(item));
  } catch {
    // Storage unavailable (e.g. private mode) — checkout will show its empty state.
  }
}

export function loadBuyNowItem(): CartItem | null {
  try {
    const stored = window.sessionStorage.getItem(BUY_NOW_KEY);
    return stored ? (JSON.parse(stored) as CartItem) : null;
  } catch {
    return null;
  }
}

export function clearBuyNowItem() {
  try {
    window.sessionStorage.removeItem(BUY_NOW_KEY);
  } catch {
    // Ignore.
  }
}
