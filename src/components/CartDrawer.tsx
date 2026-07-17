import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useRouter } from '../lib/router';
import { formatINR } from '../lib/format';
import { FREE_SHIPPING_THRESHOLD } from '../lib/supabase';
import { ProductImage } from '../lib/supabase';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, updateQty, removeItem, loading } = useCart();
  const { navigate } = useRouter();

  if (!open) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const goCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-ink-50 shadow-2xl animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-ink-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-ink-800" />
            <h2 className="font-serif text-xl font-semibold">Your Cart</h2>
            <span className="text-sm text-ink-500">({items.length})</span>
          </div>
          <button onClick={onClose} className="p-2 text-ink-700 hover:bg-ink-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 grid place-items-center">
            <div className="h-8 w-8 rounded-full border-2 border-ink-300 border-t-ink-900 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-ink-100">
              <ShoppingBag className="h-8 w-8 text-ink-400" />
            </div>
            <div>
              <p className="font-serif text-xl text-ink-900">Your cart is empty</p>
              <p className="text-sm text-ink-500 mt-1">Let's find something you'll love.</p>
            </div>
            <button
              onClick={() => { onClose(); navigate('/shop'); }}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="px-5 py-3 bg-sand-50 border-b border-sand-100">
              {remaining > 0 ? (
                <p className="text-xs text-sand-800">
                  Add <span className="font-semibold">{formatINR(remaining)}</span> more for free shipping
                </p>
              ) : (
                <p className="text-xs text-emerald-700 font-medium">You've unlocked free shipping!</p>
              )}
              <div className="mt-1.5 h-1.5 rounded-full bg-sand-100 overflow-hidden">
                <div className="h-full bg-sand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map((item) => {
                const p = item.product as any;
                if (!p) return null;
                const imgs = ((p.images as ProductImage[]) || []).sort((a, b) => a.sort_order - b.sort_order);
                const img = imgs[0]?.url || 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=200';
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-ink-100">
                      <img src={img} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-ink-500">{p.color} · {p.material}</p>
                      <p className="text-sm font-semibold text-ink-900 mt-1">{formatINR(Number(p.price))}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-ink-200 bg-white">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} className="grid h-7 w-7 place-items-center text-ink-700 hover:bg-ink-100 rounded-l-full transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} className="grid h-7 w-7 place-items-center text-ink-700 hover:bg-ink-100 rounded-r-full transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-1.5 text-ink-400 hover:text-rose-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-ink-200 p-5 space-y-3 bg-white">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-600">Subtotal</span>
                <span className="font-semibold text-ink-900">{formatINR(subtotal)}</span>
              </div>
              <p className="text-xs text-ink-500">Taxes & shipping calculated at checkout.</p>
              <button onClick={goCheckout} className="btn-primary w-full">
                Checkout
              </button>
              <button onClick={() => { onClose(); navigate('/shop'); }} className="btn-ghost w-full">
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
