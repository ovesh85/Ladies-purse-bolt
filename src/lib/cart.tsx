import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase, CartItem, Product } from './supabase';
import { useAuth } from './auth';

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  count: number;
  subtotal: number;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  updateQty: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*, images:product_images(*))')
      .eq('user_id', user.id);
    setLoading(false);
    if (error) {
      console.warn('Cart load error:', error.message);
      return;
    }
    setItems((data as CartItem[]) || []);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addToCart = async (productId: string, qty = 1) => {
    if (!user) {
      window.location.hash = '/login?redirect=' + encodeURIComponent(window.location.hash.slice(1) || '/');
      return;
    }
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await updateQty(existing.id, existing.quantity + qty);
      return;
    }
    const { error } = await supabase
      .from('cart_items')
      .insert({ product_id: productId, quantity: qty });
    if (error) {
      console.warn('Add to cart error:', error.message);
      return;
    }
    await load();
  };

  const updateQty = async (itemId: string, qty: number) => {
    if (qty <= 0) {
      await removeItem(itemId);
      return;
    }
    const { error } = await supabase.from('cart_items').update({ quantity: qty }).eq('id', itemId);
    if (error) console.warn('Update qty error:', error.message);
    await load();
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (error) console.warn('Remove item error:', error.message);
    await load();
  };

  const clearCart = async () => {
    if (!user) return;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
    if (error) console.warn('Clear cart error:', error.message);
    await load();
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    const p = i.product as Product | undefined;
    return sum + (p ? Number(p.price) * i.quantity : 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, count, subtotal, addToCart, updateQty, removeItem, clearCart, refresh: load }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
