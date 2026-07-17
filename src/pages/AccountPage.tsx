import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import { supabase, Order, OrderItem, Address } from '../lib/supabase';
import { formatINR, formatDate } from '../lib/format';
import { downloadInvoice } from '../lib/invoice';
import { useToast } from '../lib/toast';
import { Package, MapPin, User as UserIcon, FileText, Download, ChevronRight, Loader2, Plus, Trash2, Check } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-ink-100 text-ink-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-amber-100 text-amber-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
  refunded: 'bg-ink-100 text-ink-700',
};

export function AccountPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { query, navigate } = useRouter();
  const { toast } = useToast();
  const tab = query.get('tab') || 'orders';

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login?redirect=/account'); return; }
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
  }, [user, profile, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingOrders(true);
      const { data } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const ords = (data as Order[]) || [];
      setOrders(ords);
      const itemsMap: Record<string, OrderItem[]> = {};
      for (const o of ords) {
        const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
        itemsMap[o.id] = (items as OrderItem[]) || [];
      }
      setOrderItems(itemsMap);
      setLoadingOrders(false);
    })();
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    setAddresses((data as Address[]) || []);
  };
  useEffect(() => { loadAddresses(); /* eslint-disable-next-line */ }, [user]);

  const setTab = (t: string) => navigate(`/account?tab=${t}`);

  const saveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user!.id);
    setSavingProfile(false);
    if (error) toast('Could not save profile', 'error');
    else { toast('Profile updated'); refreshProfile(); }
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) toast('Could not delete address', 'error');
    else { toast('Address removed'); loadAddresses(); }
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id).neq('id', id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    loadAddresses();
  };

  if (!user) return null;

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <h1 className="font-serif text-4xl lg:text-5xl text-ink-900 mb-2">My Account</h1>
      <p className="text-sm text-ink-600 mb-8">Welcome back, {profile?.full_name || user.email}.</p>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-100'
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
            <button onClick={() => { signOut(); navigate('/'); }} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 whitespace-nowrap transition-colors">
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div>
          {tab === 'orders' && (
            <div>
              <h2 className="font-serif text-2xl text-ink-900 mb-5">Order History</h2>
              {loadingOrders ? (
                <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-ink-400" /></div>
              ) : orders.length === 0 ? (
                <div className="card p-10 text-center">
                  <Package className="h-10 w-10 mx-auto text-ink-300" />
                  <p className="font-serif text-xl text-ink-900 mt-3">No orders yet</p>
                  <p className="text-sm text-ink-500 mt-1">When you place an order, it'll appear here.</p>
                  <button onClick={() => navigate('/shop')} className="btn-primary mt-5">Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="card overflow-hidden">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-ink-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-ink-100">
                            <Package className="h-5 w-5 text-ink-700" />
                          </div>
                          <div>
                            <p className="font-medium text-ink-900">{o.order_number}</p>
                            <p className="text-xs text-ink-500">{formatDate(o.created_at)} · {formatINR(o.total)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`chip ${STATUS_STYLES[o.status] || ''}`}>{o.status}</span>
                          <ChevronRight className={`h-4 w-4 text-ink-400 transition-transform ${expandedOrder === o.id ? 'rotate-90' : ''}`} />
                        </div>
                      </button>
                      {expandedOrder === o.id && (
                        <div className="border-t border-ink-100 p-4 space-y-3 animate-slide-up">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="text-sm font-medium text-ink-900">Items</p>
                            <button
                              onClick={() => downloadInvoice(o, orderItems[o.id] || [])}
                              className="inline-flex items-center gap-1.5 text-sm text-sand-700 hover:underline"
                            >
                              <FileText className="h-4 w-4" /> Download GST Invoice <Download className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(orderItems[o.id] || []).map((it) => (
                              <div key={it.id} className="flex items-center gap-3 text-sm">
                                <div className="h-12 w-10 rounded bg-ink-100 overflow-hidden flex-shrink-0">
                                  <img src={it.image_url || 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=100'} alt={it.product_name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-ink-900">{it.product_name}</p>
                                  <p className="text-xs text-ink-500">Qty {it.quantity} · {formatINR(Number(it.price))}</p>
                                </div>
                                <p className="font-medium">{formatINR(Number(it.price) * it.quantity)}</p>
                              </div>
                            ))}
                          </div>
                          <div className="pt-3 border-t border-ink-100 text-sm space-y-1">
                            <div className="flex justify-between"><span className="text-ink-600">Subtotal</span><span>{formatINR(o.subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-ink-600">GST</span><span>{formatINR(o.gst_amount)}</span></div>
                            <div className="flex justify-between"><span className="text-ink-600">Shipping</span><span>{o.shipping_amount === 0 ? 'Free' : formatINR(o.shipping_amount)}</span></div>
                            <div className="flex justify-between font-semibold text-ink-900 pt-1"><span>Total Paid</span><span>{formatINR(o.total)}</span></div>
                            {o.payment_id && <p className="text-xs text-ink-500 pt-1">Payment Ref: {o.payment_id}</p>}
                          </div>
                          <div className="pt-3 border-t border-ink-100 text-sm">
                            <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">Shipping to</p>
                            <p className="text-ink-800">{o.shipping_address.full_name}</p>
                            <p className="text-ink-600">{o.shipping_address.line1}{o.shipping_address.line2 ? `, ${o.shipping_address.line2}` : ''}, {o.shipping_address.city}, {o.shipping_address.state} - {o.shipping_address.pincode}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-2xl text-ink-900">Saved Addresses</h2>
                <button onClick={() => navigate('/checkout')} className="btn-secondary text-sm"><Plus className="h-4 w-4" /> Add</button>
              </div>
              {addresses.length === 0 ? (
                <div className="card p-10 text-center">
                  <MapPin className="h-10 w-10 mx-auto text-ink-300" />
                  <p className="font-serif text-xl text-ink-900 mt-3">No addresses yet</p>
                  <p className="text-sm text-ink-500 mt-1">Add an address during checkout to save it here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((a) => (
                    <div key={a.id} className="card p-4">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-ink-900">{a.full_name}</p>
                        {a.is_default && <span className="chip bg-emerald-100 text-emerald-700">Default</span>}
                      </div>
                      <p className="text-sm text-ink-600 mt-1">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                      <p className="text-sm text-ink-600">{a.city}, {a.state} - {a.pincode}</p>
                      <p className="text-xs text-ink-500 mt-1">Phone: {a.phone}</p>
                      <div className="mt-3 pt-3 border-t border-ink-100 flex gap-3 text-xs">
                        {!a.is_default && (
                          <button onClick={() => setDefault(a.id)} className="text-sand-700 hover:underline flex items-center gap-1">
                            <Check className="h-3 w-3" /> Set default
                          </button>
                        )}
                        <button onClick={() => deleteAddress(a.id)} className="text-rose-600 hover:underline flex items-center gap-1 ml-auto">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="max-w-md">
              <h2 className="font-serif text-2xl text-ink-900 mb-5">Profile Details</h2>
              <div className="card p-6 space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input bg-ink-100" value={user.email || ''} disabled />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
                </div>
                <button onClick={saveProfile} disabled={savingProfile} className="btn-primary">
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
