import { Heart, ShoppingBag } from 'lucide-react';
import { ProductWithImage } from '../lib/products';
import { formatINR, discountPercent } from '../lib/format';
import { useWishlist } from '../lib/wishlist';
import { useCart } from '../lib/cart';
import { useToast } from '../lib/toast';
import { useRouter } from '../lib/router';
import { StarRating } from './StarRating';
import { useState } from 'react';

export function ProductCard({ product }: { product: ProductWithImage }) {
  const { toggle, isWishlisted } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { navigate } = useRouter();
  const [imgLoaded, setImgLoaded] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const discount = discountPercent(Number(product.price), product.mrp ? Number(product.mrp) : null);
  const outOfStock = product.stock <= 0;

  return (
    <div
      className="group relative flex flex-col animate-fade-in"
      onMouseEnter={() => {}}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink-100 cursor-pointer"
        onClick={() => navigate(`/product/${product.slug}`)}
      >
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={product.image_url || `https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600`}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-blush-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
              {discount}% Off
            </span>
          )}
          {product.is_featured && (
            <span className="rounded-full bg-ink-900/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
              Featured
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-ink-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(product.id);
            toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info');
          }}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 backdrop-blur-sm shadow-sm transition-all hover:bg-white hover:scale-110"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              wishlisted ? 'fill-blush-500 text-blush-500' : 'text-ink-700'
            }`}
          />
        </button>

        {/* Quick add */}
        {!outOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product.id);
              toast('Added to cart');
            }}
            className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-xs font-semibold text-ink-900 shadow-md backdrop-blur-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-ink-900 hover:text-white"
          >
            <ShoppingBag className="h-4 w-4" />
            Quick Add
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1 px-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-wider text-ink-500">
            {product.color || ''} · {product.material || ''}
          </p>
          <StarRating rating={product.rating} />
        </div>
        <h3
          className="text-base font-medium text-ink-900 cursor-pointer hover:text-sand-700 transition-colors line-clamp-1"
          onClick={() => navigate(`/product/${product.slug}`)}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-ink-900">{formatINR(Number(product.price))}</span>
          {product.mrp && Number(product.mrp) > Number(product.price) && (
            <span className="text-sm text-ink-400 line-through">{formatINR(Number(product.mrp))}</span>
          )}
        </div>
      </div>
    </div>
  );
}
