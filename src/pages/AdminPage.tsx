import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { supabase, Product, Order, OrderItem, Category } from '../lib/supabase';
import { fetchProducts, ProductWithCategory } from '../lib/products';
import { formatINR, formatDate } from '../lib/format';
import { useToast } from '../lib/toast';
import { downloadInvoice } from '../lib/invoice';
import { LayoutDashboard, Package, ShoppingBag, Plus, Pencil, Trash2, X, Loader2, TrendingUp, IndianRupee, Users, Download, Search } from 'lucide-react';

type AdminTab = 'dashboard' | 'products' | 'orders';

export function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const { navigate } = useRouter();
  const [tab, setTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-ink-400" /></div>;
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingBag },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-sand-700 font-medium">Admin</p>
        <h1 className="font-serif text-4xl lg:text-5xl text-ink-900 mt-1">Control Panel</h1>
        <p className="text-sm text-ink-600 mt-2">Manage products, track orders, and view store performance.</p>
      </div>

      <nav className="flex gap-1 mb-8 border-b border-ink-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </nav>

      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'orders' && <OrdersTab />}
    </div>
  );
}

function DashboardTab() {
  const [stats, setStats] = useState<{ revenue: number; orders: number; products: number; users: number } | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: orders }, { count: orderCount }, { count: productCount }, { count: userCount }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);
      const allOrders = (orders as Order[]) || [];
      const revenue = allOrders.reduce((s, o) => s + Number(o.total), 0);
      setStats({
        revenue,
        orders: orderCount || 0,
        products: productCount || 0,
        users: userCount || 0,
      });
      setRecentOrders(allOrders);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-ink-400" /></div>;

  const cards = [
    { label: 'Total Revenue', value: formatINR(stats?.revenue || 0), icon: IndianRupee, accent: 'text-emerald-700 bg-emerald-50' },
    { label: 'Orders', value: String(stats?.orders || 0), icon: ShoppingBag, accent: 'text-blue-700 bg-blue-50' },
    { label: 'Products', value: String(stats?.products || 0), icon: Package, accent: 'text-sand-700 bg-sand-50' },
    { label: 'Customers', value: String(stats?.users || 0), icon: Users, accent: 'text-blush-700 bg-blush-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-full ${c.accent}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-xs text-ink-500 uppercase tracking-wider mt-3">{c.label}</p>
            <p className="font-serif text-2xl text-ink-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-ink-900">Recent Orders</h2>
          <TrendingUp className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-500">No orders yet.</td></tr>
              ) : recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-ink-600">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="chip">{o.status}</span></td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const [ps, cats] = await Promise.all([fetchProducts({ limit: 100 }), supabase.from('categories').select('*').order('name')]);
    setProducts(ps);
    setCategories((cats.data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const onDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast('Could not delete: ' + error.message, 'error');
    else { toast('Product deleted'); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input className="input pl-10" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary"><Plus className="h-4 w-4" /> Add Product</button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-ink-400" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Stock</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-ink-100 overflow-hidden flex-shrink-0">
                        <img src={p.image_url || 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=100'} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-ink-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-ink-500">{p.sku} · {p.color}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-ink-600">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(Number(p.price))}</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className={p.stock <= 5 ? 'text-rose-600 font-medium' : 'text-ink-700'}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-1.5 text-ink-600 hover:bg-ink-100 rounded-lg" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => onDelete(p.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <ProductForm product={editing} categories={categories} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function ProductForm({ product, categories, onClose, onSaved }: { product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const isEdit = !!product;
  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [mrp, setMrp] = useState(product?.mrp ? String(product.mrp) : '');
  const [categoryId, setCategoryId] = useState(product?.category_id || categories[0]?.id || '');
  const [stock, setStock] = useState(product ? String(product.stock) : '0');
  const [sku, setSku] = useState(product?.sku || '');
  const [color, setColor] = useState(product?.color || '');
  const [material, setMaterial] = useState(product?.material || '');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(product?.is_featured || false);
  const [active, setActive] = useState(product?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const onSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        description,
        price: Number(price),
        mrp: mrp ? Number(mrp) : null,
        category_id: categoryId || null,
        stock: Number(stock),
        sku: sku || null,
        color: color || null,
        material: material || null,
        is_featured: featured,
        is_active: active,
      };
      if (isEdit && product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
        if (imageUrl) {
          await supabase.from('product_images').upsert({ product_id: product.id, url: imageUrl, alt_text: name, sort_order: 0 });
        }
        toast('Product updated');
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select('id').maybeSingle();
        if (error) throw error;
        if (data && imageUrl) {
          await supabase.from('product_images').insert({ product_id: (data as any).id, url: imageUrl, alt_text: name, sort_order: 0 });
        }
        toast('Product created');
      }
      onSaved();
    } catch (e: any) {
      toast('Error: ' + (e.message || 'unknown'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-50 rounded-2xl shadow-2xl animate-scale-in">
        <div className="sticky top-0 bg-ink-50/95 backdrop-blur-sm flex items-center justify-between p-5 border-b border-ink-200 z-10">
          <h2 className="font-serif text-xl text-ink-900">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-2 text-ink-700 hover:bg-ink-100 rounded-full"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label">Name *</label><input className="input" value={name} onChange={(e) => { setName(e.target.value); if (!isEdit) setSlug(slugify(e.target.value)); }} /></div>
            <div><label className="label">Slug</label><input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" /></div>
          </div>
          <div><label className="label">Description</label><textarea className="input min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div><label className="label">Price (₹) *</label><input type="number" className="input" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
            <div><label className="label">MRP (₹)</label><input type="number" className="input" value={mrp} onChange={(e) => setMrp(e.target.value)} /></div>
            <div><label className="label">Stock</label><input type="number" className="input" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="label">Category</label>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Color</label><input className="input" value={color} onChange={(e) => setColor(e.target.value)} /></div>
            <div><label className="label">Material</label><input className="input" value={material} onChange={(e) => setMaterial(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">SKU</label><input className="input" value={sku} onChange={(e) => setSku(e.target.value)} /></div>
            <div><label className="label">Image URL (Pexels)</label><input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.pexels.com/..." /></div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-ink-900" /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-ink-900" /> Active</label>
          </div>
        </div>
        <div className="sticky bottom-0 bg-ink-50/95 backdrop-blur-sm flex justify-end gap-2 p-5 border-t border-ink-200">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onSave} disabled={saving} className="btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Create Product'}</button>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const ords = (data as Order[]) || [];
    setOrders(ords);
    const map: Record<string, OrderItem[]> = {};
    for (const o of ords) {
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
      map[o.id] = (items as OrderItem[]) || [];
    }
    setItemsMap(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) toast('Could not update status', 'error');
    else { toast('Order marked ' + status); load(); }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-ink-400" /></div>;

  return (
    <div>
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              filter === f ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto text-ink-300" />
          <p className="font-serif text-xl text-ink-900 mt-3">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-ink-100">
                    <ShoppingBag className="h-5 w-5 text-ink-700" />
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">{o.order_number}</p>
                    <p className="text-xs text-ink-500">{formatDate(o.created_at)} · {formatINR(o.total)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="chip capitalize">{o.status}</span>
                  <span className={`chip ${o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.payment_status}</span>
                  <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="text-sm text-sand-700 hover:underline">
                    {expanded === o.id ? 'Hide' : 'View'}
                  </button>
                </div>
              </div>
              {expanded === o.id && (
                <div className="border-t border-ink-100 p-4 space-y-4 animate-slide-up">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-ink-500 mb-1">Customer</p>
                      <p className="font-medium text-ink-900">{o.billing_name}</p>
                      <p className="text-ink-600">{o.shipping_address.full_name}</p>
                      <p className="text-ink-600">{o.shipping_address.line1}, {o.shipping_address.city}, {o.shipping_address.state} - {o.shipping_address.pincode}</p>
                      <p className="text-ink-600">Phone: {o.shipping_address.phone}</p>
                      {o.gst_number && <p className="text-ink-600">GSTIN: {o.gst_number}</p>}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-ink-500 mb-1">Items</p>
                      <div className="space-y-1.5">
                        {(itemsMap[o.id] || []).map((it) => (
                          <div key={it.id} className="flex justify-between text-sm">
                            <span className="text-ink-700">{it.product_name} × {it.quantity}</span>
                            <span className="text-ink-900">{formatINR(Number(it.price) * it.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 mt-2 border-t border-ink-100 space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-ink-600">Subtotal</span><span>{formatINR(o.subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-ink-600">GST</span><span>{formatINR(o.gst_amount)}</span></div>
                        <div className="flex justify-between"><span className="text-ink-600">Shipping</span><span>{o.shipping_amount === 0 ? 'Free' : formatINR(o.shipping_amount)}</span></div>
                        <div className="flex justify-between font-semibold text-ink-900"><span>Total</span><span>{formatINR(o.total)}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-ink-100">
                    <span className="text-xs text-ink-500">Update status:</span>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:border-ink-900"
                    >
                      {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => downloadInvoice(o, itemsMap[o.id] || [])}
                      className="ml-auto inline-flex items-center gap-1.5 text-sm text-sand-700 hover:underline"
                    >
                      <Download className="h-4 w-4" /> Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
