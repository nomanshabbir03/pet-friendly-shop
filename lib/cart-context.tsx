'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  variantLabel: string | null;
  quantity: number;
};

type CartState = CartItem[];

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; productId: string; variantLabel: string | null }
  | { type: 'UPDATE_QUANTITY'; productId: string; variantLabel: string | null; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE_CART'; items: CartState };

type CartContextValue = {
  cart: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantLabel: string | null) => void;
  updateQuantity: (productId: string, variantLabel: string | null, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.find(
        (item) => item.productId === action.item.productId && item.variantLabel === action.item.variantLabel
      );

      if (existingItem) {
        return state.map((item) =>
          item.productId === action.item.productId && item.variantLabel === action.item.variantLabel
            ? { ...item, quantity: item.quantity + action.item.quantity }
            : item
        );
      }

      return [...state, action.item];
    }
    case 'REMOVE_ITEM': {
      return state.filter(
        (item) => !(item.productId === action.productId && item.variantLabel === action.variantLabel)
      );
    }
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return state.filter(
          (item) => !(item.productId === action.productId && item.variantLabel === action.variantLabel)
        );
      }

      return state.map((item) =>
        item.productId === action.productId && item.variantLabel === action.variantLabel
          ? { ...item, quantity: action.quantity }
          : item
      );
    }
    case 'CLEAR_CART':
      return [];
    case 'HYDRATE_CART':
      return action.items;
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, [] as CartState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);

    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedValue = window.localStorage.getItem('petstar-cart');

      if (!storedValue) {
        return;
      }

      const parsed = JSON.parse(storedValue) as CartState;
      if (Array.isArray(parsed)) {
        dispatch({ type: 'HYDRATE_CART', items: parsed });
      }
    } catch {
      // Ignore invalid persisted cart data.
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('petstar-cart', JSON.stringify(cart));
  }, [cart, hydrated]);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (productId: string, variantLabel: string | null) =>
    dispatch({ type: 'REMOVE_ITEM', productId, variantLabel });
  const updateQuantity = (productId: string, variantLabel: string | null, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', productId, variantLabel, quantity });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
    }),
    [cart, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
