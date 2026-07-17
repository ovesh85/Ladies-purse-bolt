import { useEffect, useState } from 'react';
import { useParams } from '../lib/router';
import { fetchProductBySlug, fetchRelatedProducts, ProductWithCategory } from '../lib/products';
import { useCart } from '../lib/cart';
import { useWishlist } from '../lib/wishlist';
import { useToast } from '../lib/toast';
import { useRouter } from '../lib/router';
import { formatINR, discountPercent } from '../lib/format';
import { StarRating } from '../components/StarRating';
import { ProductCard } from '../components/ProductCard';
import { Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, Minus, Plus, ChevronRight } from 'lucide-react';

export function ProductDetailPage() {
  const { slug } = useParams();
  const { navigate } = useRouter();
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [related, setRelated] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveImage(0);
    setQty(1);
    fetchProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        if (p?.category_id) {
          fetchRelatedProducts(p.category_id, p.id, 4).then(setRelated).catch(() => {});
        }
      })
      .catch((e) => console.warn('Product load error:', e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[4/5] rounded-2xl skeleton" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 rounded skeleton" />
            <div className="h-6 w-1/3 rounded skeleton" />
            <div className="h-24 w-full rounded skeleton" />
            <div className="h-12 w-1/2 rounded skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-serif text-3xl text-ink-900">Product not found</h1>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-6">Back to Shop</button>
      </div>
    );
  }

  const discount = discountPercent(Number(product.price), product.mrp ? Number(product.mrp) : null);
  const outOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product.id, qty);
    toast('Added to cart');
  };

  const handleBuyNow = () => {
    addToCart(product.id, qty).then(() => navigate('/checkout'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-ink-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <a href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="hover:text-ink-800">Home</a>
        <ChevronRight className="h-3 w-3" />
        <a href="#/shop" onClick={(e) => { e.preventDefault(); navigate('/shop'); }} className="hover:text-ink-800">Shop</a>
        {product.category && (() => {
          const cat = product.category!;
          return (
            <>
              <ChevronRight className="h-3 w-3" />
              <a href={`#/shop?category=${cat.slug}`} onClick={(e) => { e.preventDefault(); navigate(`/shop?category=${cat.slug}`); }} className="hover:text-ink-800">{cat.name}</a>
            </>
          );
        })()}
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-ink-100">
            <img
              src={product.images[activeImage]?.url || product.image_url}
              alt={product.name}
              className="h-full w-full object-cover animate-fade-in"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square overflow-hidden rounded-xl bg-ink-100 ring-2 transition-all ${
                    i === activeImage ? 'ring-ink-900' : 'ring-transparent hover:ring-ink-300'
                  }`}
                >
                  <img src={img.url} alt={img.alt_text || product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:py-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="chip">{product.category?.name || 'Handbag'}</span>
            {product.is_featured && <span className="chip bg-sand-100 text-sand-800">Featured</span>}
          </div>
          <h1 className="font-serif text-3xl lg:text-4xl text-ink-900 leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={product.rating} size={16} />
            <span className="text-sm text-ink-600">{product.rating} · {product.reviews_count} reviews</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-ink-900">{formatINR(Number(product.price))}</span>
            {product.mrp && Number(product.mrp) > Number(product.price) && (
              <>
                <span className="text-lg text-ink-400 line-through">{formatINR(Number(product.mrp))}</span>
                <span className="rounded-full bg-blush-100 text-blush-700 px-2.5 py-1 text-xs font-semibold">{discount}% OFF</span>
              </>
            )}
          </div>
          <p className="text-xs text-ink-500 mt-1.5">Inclusive of all taxes</p>

          <div className="mt-6 prose prose-sm max-w-none text-ink-700">
            <p>{product.description}</p>
          </div>

          {/* Attributes */}
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm py-5 border-y border-ink-200">
            <div><dt className="text-ink-500 text-xs uppercase tracking-wider">Color</dt><dd className="text-ink-900 font-medium mt-0.5">{product.color || '—'}</dd></div>
            <div><dt className="text-ink-500 text-xs uppercase tracking-wider">Material</dt><dd className="text-ink-900 font-medium mt-0.5">{product.material || '—'}</dd></div>
            <div><dt className="text-ink-500 text-xs uppercase tracking-wider">SKU</dt><dd className="text-ink-900 font-medium mt-0.5">{product.sku || '—'}</dd></div>
            <div><dt className="text-ink-500 text-xs uppercase tracking-wider">Availability</dt><dd className="font-medium mt-0.5">{outOfStock ? <span className="text-rose-600">Out of stock</span> : <span className="text-emerald-700">{product.stock} in stock</span>}</dd></div>
          </dl>

          {/* Quantity + actions */}
          {!outOfStock && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-ink-200 bg-white">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-ink-700 hover:bg-ink-100 rounded-l-full transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-5 text-base font-medium">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="grid h-11 w-11 place-items-center text-ink-700 hover:bg-ink-100 rounded-r-full transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => { toggle(product.id); toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info'); }}
                className="grid h-11 w-11 place-items-center rounded-full border border-ink-200 bg-white hover:border-ink-900 transition-colors"
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-5 w-5 ${wishlisted ? 'fill-blush-500 text-blush-500' : 'text-ink-700'}`} />
              </button>
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button onClick={handleAddToCart} disabled={outOfStock} className="btn-secondary flex-1">
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={outOfStock} className="btn-primary flex-1">
              Buy Now
            </button>
          </div>

          {/* Trust */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Truck, label: 'Free shipping over ₹2,999' },
              { icon: RotateCcw, label: '7-day easy returns' },
              { icon: ShieldCheck, label: 'Secure payments' },
            ].map((t) => (
              <div key={t.label} className="rounded-xl bg-ink-50 p-3">
                <t.icon className="h-5 w-5 mx-auto text-sand-700" />
                <p className="text-[11px] text-ink-600 mt-1.5 leading-tight">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-2xl lg:text-3xl text-ink-900 mb-6">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
