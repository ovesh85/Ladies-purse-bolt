import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase, WishlistItem } from './supabase';
import { useAuth } from './auth';

type WishlistContextValue = {
  items: WishlistItem[];
  productIds: Set<string>;
  loading: boolean;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  refresh: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*, images:product_images(*))')
      .eq('user_id', user.id);
    setLoading(false);
    if (error) {
      console.warn('Wishlist load error:', error.message);
      return;
    }
    setItems((data as WishlistItem[]) || []);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (productId: string) => {
    if (!user) {
      window.location.hash = '/login?redirect=' + encodeURIComponent(window.location.hash.slice(1) || '/');
      return;
    }
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      const { error } = await supabase.from('wishlist_items').delete().eq('id', existing.id);
      if (error) console.warn('Wishlist remove error:', error.message);
    } else {
      const { error } = await supabase.from('wishlist_items').insert({ product_id: productId });
      if (error) console.warn('Wishlist add error:', error.message);
    }
    await load();
  };

  const productIds = new Set(items.map((i) => i.product_id));
  const isWishlisted = (productId: string) => productIds.has(productId);

  return (
    <WishlistContext.Provider value={{ items, productIds, loading, toggle, isWishlisted, refresh: load }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
