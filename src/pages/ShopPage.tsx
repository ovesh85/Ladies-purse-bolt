import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useRouter } from '../lib/router';
import { fetchProducts, fetchCategories, ProductWithCategory, Category } from '../lib/products';
import { ProductCard } from '../components/ProductCard';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const COLORS = ['Black', 'Tan', 'Beige', 'Burgundy', 'Navy Blue', 'Caramel', 'Silver', 'Olive Green', 'Blush Pink', 'Wine', 'Cream', 'Ivory', 'Rose Gold', 'Dusty Rose', 'Charcoal', 'Emerald'];

export function ShopPage() {
  const { query, navigate } = useRouter();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const categorySlug = query.get('category') || '';
  const search = query.get('search') || '';
  const [sort, setSort] = useState('featured');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const cat = categories.find((c) => c.slug === categorySlug);
    fetchProducts({
      category: cat?.id,
      search,
      sort,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
      colors: selectedColors.length ? selectedColors : undefined,
    })
      .then(setProducts)
      .catch((e) => console.warn('Shop load error:', e.message))
      .finally(() => setLoading(false));
  }, [categorySlug, search, sort, minPrice, maxPrice, selectedColors, categories]);

  const activeCategory = useMemo(() => categories.find((c) => c.slug === categorySlug), [categories, categorySlug]);

  const setCategory = (slug: string) => {
    const params = new URLSearchParams();
    if (slug) params.set('category', slug);
    if (search) params.set('search', search);
    navigate(`/shop${params.toString() ? '?' + params.toString() : ''}`);
  };

  const toggleColor = (c: string) => {
    setSelectedColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const clearFilters = () => {
    setMinPrice(null);
    setMaxPrice(null);
    setSelectedColors([]);
    setSort('featured');
  };

  const activeFilterCount = (minPrice !== null ? 1 : 0) + (maxPrice !== null ? 1 : 0) + selectedColors.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-xs text-ink-500 mb-2">
          <a href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="hover:text-ink-800">Home</a>
          <span className="mx-1.5">/</span>
          <span className="text-ink-700">{activeCategory ? activeCategory.name : 'Shop All'}</span>
        </nav>
        <h1 className="font-serif text-4xl lg:text-5xl text-ink-900">
          {activeCategory ? activeCategory.name : search ? `Results for "${search}"` : 'Shop All Handbags'}
        </h1>
        {activeCategory?.description && (
          <p className="mt-2 text-ink-600 max-w-2xl">{activeCategory.description}</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="hidden lg:flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-sand-700 hover:underline">Clear all</button>
              )}
            </div>

            {/* Categories */}
            <div>
              <p className="label">Category</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => setCategory('')}
                  className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    !categorySlug ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-100'
                  }`}
                >
                  All Handbags
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.slug)}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      categorySlug === c.slug ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-100'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="label">Price Range</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" value={minPrice ?? ''} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)} className="input py-2" />
                  <span className="text-ink-400">—</span>
                  <input type="number" placeholder="Max" value={maxPrice ?? ''} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)} className="input py-2" />
                </div>
                <div className="flex gap-1.5">
                  {[[0, 2000], [2000, 4000], [4000, 6000]].map(([lo, hi]) => (
                    <button
                      key={`${lo}-${hi}`}
                      onClick={() => { setMinPrice(lo); setMaxPrice(hi); }}
                      className="flex-1 text-[11px] px-2 py-1.5 rounded-md bg-ink-100 text-ink-700 hover:bg-ink-200 transition-colors"
                    >
                      ₹{lo/1000}k–₹{hi/1000}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Colors */}
            <div>
              <p className="label">Color</p>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleColor(c)}
                    className={`text-xs px-2.5 py-1.5 rounded-full border transition-all ${
                      selectedColors.includes(c)
                        ? 'border-ink-900 bg-ink-900 text-white'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-ink-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {activeFilterCount > 0 && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-900 text-white text-[10px]">{activeFilterCount}</span>
                )}
              </button>
              <p className="text-sm text-ink-600">
                {loading ? 'Loading...' : `${products.length} ${products.length === 1 ? 'item' : 'items'}`}
              </p>
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-full border border-ink-200 bg-white pl-4 pr-9 py-2 text-sm focus:outline-none focus:border-ink-900"
              >
                {SORTS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500 pointer-events-none" />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[0,1,2,3,4,5].map((i) => <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif text-2xl text-ink-900">No products found</p>
              <p className="text-sm text-ink-500 mt-2">Try adjusting your filters or search.</p>
              <button onClick={() => { clearFilters(); setCategory(''); }} className="btn-primary mt-6">Reset Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85%] bg-ink-50 shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ink-200">
              <h3 className="font-serif text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-ink-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <p className="label">Category</p>
                <div className="space-y-1.5">
                  <button onClick={() => { setCategory(''); setShowFilters(false); }} className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg ${!categorySlug ? 'bg-ink-900 text-white' : 'text-ink-700'}`}>All Handbags</button>
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => { setCategory(c.slug); setShowFilters(false); }} className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg ${categorySlug === c.slug ? 'bg-ink-900 text-white' : 'text-ink-700'}`}>{c.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="label">Price Range</p>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" value={minPrice ?? ''} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)} className="input py-2" />
                  <span className="text-ink-400">—</span>
                  <input type="number" placeholder="Max" value={maxPrice ?? ''} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)} className="input py-2" />
                </div>
              </div>
              <div>
                <p className="label">Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => toggleColor(c)} className={`text-xs px-2.5 py-1.5 rounded-full border ${selectedColors.includes(c) ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 bg-white text-ink-700'}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-ink-200 flex gap-2">
              <button onClick={clearFilters} className="btn-secondary flex-1">Clear</button>
              <button onClick={() => setShowFilters(false)} className="btn-primary flex-1">Show {products.length}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
