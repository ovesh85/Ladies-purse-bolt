import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { useRouter } from '../lib/router';
import { useToast } from '../lib/toast';
import { supabase, Address, GST_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT, STORE_GSTIN, ProductImage } from '../lib/supabase';
import { openRazorpayCheckout } from '../lib/razorpay';
import { formatINR } from '../lib/format';
import { Loader2, Lock, Truck, CheckCircle2, Plus, ChevronRight } from 'lucide-react';

export function CheckoutPage() {
  const { user, profile } = useAuth();
  const { items, subtotal, clearCart, refresh } = useCart();
  const { navigate } = useRouter();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<{ orderNumber: string } | null>(null);

  // New address form
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0 && !success) {
      navigate('/shop');
      return;
    }
  }, [user, items.length, success, navigate]);

  const loadAddresses = async () => {
    if (!user) return;
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false });
    if (data) {
      setAddresses(data as Address[]);
      if (data.length > 0 && !selectedAddrId) setSelectedAddrId((data[0] as Address).id);
      else if (data.length === 0) setShowAddrForm(true);
    }
  };

  useEffect(() => { loadAddresses(); /* eslint-disable-next-line */ }, [user]);

  const gstAmount = useMemo(() => Math.round(subtotal * GST_RATE) / 100, [subtotal]);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const total = subtotal + gstAmount + shipping;

  const saveAddress = async (): Promise<Address | null> => {
    if (!user) return null;
    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      toast('Please fill all required address fields', 'error');
      return null;
    }
    const payload = {
      full_name: fullName,
      phone,
      line1,
      line2: line2 || null,
      city,
      state,
      pincode,
      is_default: addresses.length === 0,
    };
    const { data, error } = await supabase.from('addresses').insert(payload).select('*').maybeSingle();
    if (error || !data) {
      toast('Could not save address: ' + (error?.message || 'unknown'), 'error');
      return null;
    }
    await loadAddresses();
    setSelectedAddrId((data as Address).id);
    setShowAddrForm(false);
    return data as Address;
  };

  const placeOrder = async () => {
    if (!user) return;
    let addr = addresses.find((a) => a.id === selectedAddrId);
    if (!addr) {
      if (showAddrForm) {
        addr = (await saveAddress()) || undefined;
        if (!addr) return;
      } else {
        toast('Please select or add a shipping address', 'error');
        return;
      }
    }
    if (!addr) return;

    setPlacing(true);

    // Generate order number
    const { data: orderNum } = await supabase.rpc('generate_order_number');
    const orderNumber = orderNum as string;

    const shippingAddress = {
      full_name: addr.full_name,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
    };
    const billingAddress = {
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
    };

    // Create order
    const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
      order_number: orderNumber,
      status: 'pending',
      subtotal,
      gst_amount: gstAmount,
      shipping_amount: shipping,
      total,
      gst_number: gstNumber || null,
      billing_name: addr.full_name,
      billing_address: billingAddress,
      shipping_address: shippingAddress,
      payment_status: 'pending',
    }).select('id').maybeSingle();

    if (orderErr || !orderData) {
      toast('Could not place order: ' + (orderErr?.message || 'unknown'), 'error');
      setPlacing(false);
      return;
    }
    const orderId = (orderData as any).id;

    // Create order items
    const orderItems = items.map((i) => {
      const p = i.product as any;
      const imgs = ((p.images as ProductImage[]) || []).sort((a, b) => a.sort_order - b.sort_order);
      const itemGst = Math.round(Number(p.price) * i.quantity * GST_RATE) / 100;
      return {
        order_id: orderId,
        product_id: p.id,
        product_name: p.name,
        product_sku: p.sku,
        price: Number(p.price),
        quantity: i.quantity,
        gst_rate: GST_RATE,
        gst_amount: itemGst,
        image_url: imgs[0]?.url || '',
      };
    });
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) {
      toast('Could not save order items: ' + itemsErr.message, 'error');
      setPlacing(false);
      return;
    }

    // Open Razorpay
    openRazorpayCheckout({
      amount: total,
      orderNumber,
      customerName: addr.full_name,
      customerEmail: user.email || '',
      customerPhone: addr.phone,
      onSuccess: async (paymentId) => {
        // Mark order as paid
        await supabase.from('orders').update({
          payment_id: paymentId,
          payment_status: 'paid',
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        }).eq('id', orderId);
        await clearCart();
        await refresh();
        setPlacing(false);
        setSuccess({ orderNumber });
      },
      onFailure: async (err) => {
        await supabase.from('orders').update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        }).eq('id', orderId);
        setPlacing(false);
        toast('Payment failed: ' + (err?.message || 'please try again'), 'error');
      },
    });
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="grid h-20 w-20 mx-auto place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="font-serif text-4xl text-ink-900 mt-6">Order Confirmed!</h1>
        <p className="mt-3 text-ink-600">Thank you for your purchase. Your order number is:</p>
        <p className="mt-2 font-mono text-lg text-ink-900 bg-ink-100 inline-block px-4 py-2 rounded-lg">{success.orderNumber}</p>
        <p className="mt-4 text-sm text-ink-600">A GST invoice has been generated and is available in your account. We'll send updates to your email.</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={() => navigate('/account')} className="btn-primary">View My Orders</button>
          <button onClick={() => navigate('/shop')} className="btn-secondary">Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <nav className="text-xs text-ink-500 mb-4 flex items-center gap-1.5">
        <a href="#/shop" onClick={(e) => { e.preventDefault(); navigate('/shop'); }} className="hover:text-ink-800">Shop</a>
        <ChevronRight className="h-3 w-3" /> Checkout
      </nav>
      <h1 className="font-serif text-4xl lg:text-5xl text-ink-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-8">
          {/* Address */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl text-ink-900">Shipping Address</h2>
              {addresses.length > 0 && (
                <button onClick={() => setShowAddrForm((s) => !s)} className="text-sm text-sand-700 hover:underline flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add new
                </button>
              )}
            </div>

            {addresses.length > 0 && !showAddrForm && (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <label key={a.id} className={`block rounded-2xl bg-white ring-1 p-4 cursor-pointer transition-all ${selectedAddrId === a.id ? 'ring-ink-900' : 'ring-ink-200 hover:ring-ink-300'}`}>
                    <div className="flex items-start gap-3">
                      <input type="radio" name="addr" checked={selectedAddrId === a.id} onChange={() => setSelectedAddrId(a.id)} className="mt-1 accent-ink-900" />
                      <div className="flex-1">
                        <p className="font-medium text-ink-900">{a.full_name} <span className="text-ink-500 text-sm">· {a.phone}</span></p>
                        <p className="text-sm text-ink-600 mt-0.5">{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} - {a.pincode}</p>
                        {a.is_default && <span className="chip mt-2">Default</span>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {showAddrForm && (
              <div className="card p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ananya Reddy" />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
                  </div>
                </div>
                <div>
                  <label className="label">Address Line 1 *</label>
                  <input className="input" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Flat / House No." />
                </div>
                <div>
                  <label className="label">Address Line 2</label>
                  <input className="input" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Area / Landmark" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label">City *</label>
                    <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input className="input" value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Pincode *</label>
                    <input className="input" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="560001" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {addresses.length > 0 && (
                    <button onClick={() => setShowAddrForm(false)} className="btn-secondary">Cancel</button>
                  )}
                  <button onClick={saveAddress as any} className="btn-primary">Save Address</button>
                </div>
              </div>
            )}
          </section>

          {/* GST */}
          <section>
            <h2 className="font-serif text-2xl text-ink-900 mb-3">GST Details (Optional)</h2>
            <div className="card p-4">
              <label className="label">GSTIN</label>
              <input className="input" value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} placeholder="29ABCDE1234F1Z5" />
              <p className="text-xs text-ink-500 mt-2">Provide your GSTIN to receive a B2B tax invoice. Otherwise a B2C invoice will be generated.</p>
            </div>
          </section>

          {/* Items */}
          <section>
            <h2 className="font-serif text-2xl text-ink-900 mb-4">Order Items</h2>
            <div className="card divide-y divide-ink-100">
              {items.map((item) => {
                const p = item.product as any;
                const imgs = ((p.images as ProductImage[]) || []).sort((a, b) => a.sort_order - b.sort_order);
                const img = imgs[0]?.url || 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=200';
                return (
                  <div key={item.id} className="flex gap-4 p-4">
                    <div className="h-20 w-16 rounded-lg bg-ink-100 overflow-hidden flex-shrink-0">
                      <img src={img} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-900">{p.name}</p>
                      <p className="text-xs text-ink-500">{p.color} · {p.material}</p>
                      <p className="text-xs text-ink-600 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatINR(Number(p.price) * item.quantity)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 h-fit">
          <div className="card p-6">
            <h2 className="font-serif text-xl text-ink-900 mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-ink-600">Subtotal</span><span className="text-ink-900">{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-ink-600">GST (5%)</span><span className="text-ink-900">{formatINR(gstAmount)}</span></div>
              <div className="flex justify-between"><span className="text-ink-600">Shipping</span><span className="text-ink-900">{shipping === 0 ? 'Free' : formatINR(shipping)}</span></div>
              {shipping > 0 && (
                <p className="text-xs text-sand-700">Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-ink-200 flex justify-between items-baseline">
              <span className="font-medium text-ink-900">Total</span>
              <span className="font-serif text-2xl text-ink-900">{formatINR(total)}</span>
            </div>

            <button onClick={placeOrder} disabled={placing} className="btn-primary w-full mt-5">
              {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Pay {formatINR(total)}</>}
            </button>

            <div className="mt-4 space-y-2 text-xs text-ink-500">
              <p className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> 256-bit SSL secure payment via Razorpay</p>
              <p className="flex items-center gap-2"><Truck className="h-3.5 w-3.5" /> Free shipping over {formatINR(FREE_SHIPPING_THRESHOLD)}</p>
              <p className="text-ink-400">Seller: Marisol · GSTIN: {STORE_GSTIN}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
