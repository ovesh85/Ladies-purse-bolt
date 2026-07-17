import { useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../lib/wishlist';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../lib/supabase';

export function WishlistPage() {
  const { items, loading } = useWishlist();
  const { user } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!user) navigate('/login?redirect=/wishlist');
  }, [user, navigate]);

  if (!user) return null;

  const products = items
    .map((i) => {
      const p = i.product as any;
      if (!p) return null;
      const images = (p.images as ProductImage[] || []).sort((a, b) => a.sort_order - b.sort_order);
      return { ...p, images, image_url: images[0]?.url || '' };
    })
    .filter(Boolean) as any[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="font-serif text-4xl lg:text-5xl text-ink-900">Your Wishlist</h1>
        <p className="mt-2 text-sm text-ink-600">
          {loading ? 'Loading...' : `${items.length} ${items.length === 1 ? 'item saved' : 'items saved'}`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[0,1,2,3].map((i) => <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <div className="grid h-20 w-20 mx-auto place-items-center rounded-full bg-blush-100">
            <Heart className="h-8 w-8 text-blush-500" />
          </div>
          <p className="font-serif text-2xl text-ink-900 mt-4">Your wishlist is empty</p>
          <p className="text-sm text-ink-500 mt-1">Tap the heart on any product to save it here.</p>
          <button onClick={() => navigate('/shop')} className="btn-primary mt-6">Discover Handbags</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={{ ...p, image_url: '', images: [] }} />
          ))}
        </div>
      )}
    </div>
  );
}
