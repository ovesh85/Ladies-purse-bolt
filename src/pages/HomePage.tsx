import { useEffect, useState } from 'react';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react';
import { useRouter } from '../lib/router';
import { fetchProducts, fetchCategories, ProductWithCategory, Category } from '../lib/products';
import { ProductCard } from '../components/ProductCard';

export function HomePage() {
  const { navigate } = useRouter();
  const [featured, setFeatured] = useState<ProductWithCategory[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProducts({ featured: true, limit: 4 }),
      fetchProducts({ sort: 'newest', limit: 8 }),
      fetchCategories(),
    ])
      .then(([f, n, c]) => {
        setFeatured(f);
        setNewArrivals(n);
        setCategories(c);
      })
      .catch((e) => console.warn('Home load error:', e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-100">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Handbags collection"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-50/95 via-ink-50/70 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-xl animate-slide-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-sand-700 ring-1 ring-sand-200">
              <Sparkles className="h-3 w-3" /> New Season · 2026
            </span>
            <h1 className="mt-5 font-serif text-5xl lg:text-7xl font-medium leading-[1.05] text-ink-900 text-balance">
              Carry your story, beautifully.
            </h1>
            <p className="mt-5 text-lg text-ink-700 leading-relaxed max-w-md">
              Handcrafted handbags designed for the modern woman. From boardroom to brunch, find the piece that's unmistakably you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={() => navigate('/shop')} className="btn-primary group">
                Shop the Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={() => navigate('/shop?category=clutches')} className="btn-secondary">
                Explore Clutches
              </button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-ink-700">
              <div>
                <p className="font-serif text-2xl text-ink-900">4.8★</p>
                <p className="text-xs">2,400+ reviews</p>
              </div>
              <div className="h-8 w-px bg-ink-300" />
              <div>
                <p className="font-serif text-2xl text-ink-900">18+</p>
                <p className="text-xs">curated styles</p>
              </div>
              <div className="h-8 w-px bg-ink-300" />
              <div>
                <p className="font-serif text-2xl text-ink-900">7-day</p>
                <p className="text-xs">easy returns</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-ink-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink-200">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders over ₹2,999' },
            { icon: RotateCcw, title: '7-Day Returns', desc: 'No-questions-asked return policy' },
            { icon: ShieldCheck, title: 'Secure Payments', desc: 'Razorpay-protected checkout' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3 px-6 py-5">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-sand-50 text-sand-700">
                <b.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">{b.title}</p>
                <p className="text-xs text-ink-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-sand-700 font-medium">Browse</p>
            <h2 className="font-serif text-3xl lg:text-4xl text-ink-900 mt-1">Shop by Category</h2>
          </div>
          <button onClick={() => navigate('/shop')} className="hidden sm:inline-flex items-center gap-1 text-sm text-ink-700 hover:text-ink-900 link-underline">
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/shop?category=${c.slug}`)}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink-100"
            >
              <img
                src={c.image_url || ''}
                alt={c.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <p className="text-white font-serif text-lg leading-tight">{c.name}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-sand-700 font-medium">Curated picks</p>
            <h2 className="font-serif text-3xl lg:text-4xl text-ink-900 mt-1">Featured This Season</h2>
          </div>
          <button onClick={() => navigate('/shop')} className="hidden sm:inline-flex items-center gap-1 text-sm text-ink-700 hover:text-ink-900 link-underline">
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[0,1,2,3].map((i) => <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Editorial banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900">
          <div className="absolute inset-0">
            <img src="https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="Evening collection" className="h-full w-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/70 to-transparent" />
          </div>
          <div className="relative px-8 py-16 lg:px-16 lg:py-24 max-w-lg">
            <p className="text-xs uppercase tracking-wider text-sand-300 font-medium">The Evening Edit</p>
            <h2 className="mt-3 font-serif text-3xl lg:text-5xl text-white text-balance">For nights that deserve a little extra.</h2>
            <p className="mt-4 text-ink-200">Discover clutches and minis that turn an entrance into a moment.</p>
            <button onClick={() => navigate('/shop?category=clutches')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink-900 hover:bg-sand-50 transition-colors">
              Shop the Edit <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-sand-700 font-medium">Just in</p>
            <h2 className="font-serif text-3xl lg:text-4xl text-ink-900 mt-1">New Arrivals</h2>
          </div>
          <button onClick={() => navigate('/shop')} className="hidden sm:inline-flex items-center gap-1 text-sm text-ink-700 hover:text-ink-900 link-underline">
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[0,1,2,3].map((i) => <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {newArrivals.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-ink-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-wider text-sand-700 font-medium">Loved by</p>
            <h2 className="font-serif text-3xl lg:text-4xl text-ink-900 mt-1">2,400+ Happy Customers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Ananya R.', city: 'Mumbai', text: 'The Aria tote is my new everyday companion. The leather is gorgeous and it fits everything.', rating: 5 },
              { name: 'Priya M.', city: 'Bengaluru', text: 'Ordered the Crystal Box Clutch for a wedding — got so many compliments. GST invoice came instantly.', rating: 5 },
              { name: 'Sneha K.', city: 'Delhi', text: 'Quick shipping, beautiful packaging, and the Ivy sling is perfect for daily use. Will buy again.', rating: 4 },
            ].map((t) => (
              <div key={t.name} className="card p-6">
                <div className="flex items-center gap-0.5 mb-3">
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} className={n <= t.rating ? 'text-sand-500' : 'text-ink-200'}>★</span>
                  ))}
                </div>
                <p className="text-sm text-ink-700 leading-relaxed">"{t.text}"</p>
                <div className="mt-4 pt-4 border-t border-ink-100">
                  <p className="text-sm font-medium text-ink-900">{t.name}</p>
                  <p className="text-xs text-ink-500">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
