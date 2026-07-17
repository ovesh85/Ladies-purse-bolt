import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { useRouter } from '../lib/router';
import { STORE_NAME, WHATSAPP_NUMBER } from '../lib/supabase';

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-ink-900 text-ink-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-semibold text-white">
              {STORE_NAME}<span className="text-sand-500">.</span>
            </h3>
            <p className="text-sm text-ink-300 leading-relaxed max-w-xs">
              Handcrafted handbags for the modern woman. Designed in India, made with care, shipped to your door.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-ink-800 hover:bg-sand-600 transition-colors" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-ink-800 hover:bg-sand-600 transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-ink-800 hover:bg-sand-600 transition-colors" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#/shop?category=tote-bags" onClick={(e) => { e.preventDefault(); navigate('/shop?category=tote-bags'); }} className="text-ink-300 hover:text-white transition-colors">Tote Bags</a></li>
              <li><a href="#/shop?category=shoulder-bags" onClick={(e) => { e.preventDefault(); navigate('/shop?category=shoulder-bags'); }} className="text-ink-300 hover:text-white transition-colors">Shoulder Bags</a></li>
              <li><a href="#/shop?category=clutches" onClick={(e) => { e.preventDefault(); navigate('/shop?category=clutches'); }} className="text-ink-300 hover:text-white transition-colors">Clutches</a></li>
              <li><a href="#/shop?category=sling-bags" onClick={(e) => { e.preventDefault(); navigate('/shop?category=sling-bags'); }} className="text-ink-300 hover:text-white transition-colors">Sling Bags</a></li>
              <li><a href="#/shop?category=backpacks" onClick={(e) => { e.preventDefault(); navigate('/shop?category=backpacks'); }} className="text-ink-300 hover:text-white transition-colors">Backpacks</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-4">Help</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#/account" onClick={(e) => { e.preventDefault(); navigate('/account'); }} className="text-ink-300 hover:text-white transition-colors">Track Order</a></li>
              <li><a href="#/shop" onClick={(e) => { e.preventDefault(); navigate('/shop'); }} className="text-ink-300 hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><span className="text-ink-300">GST Invoices</span></li>
              <li><span className="text-ink-300">Size & Care Guide</span></li>
              <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="text-ink-300 hover:text-white transition-colors">WhatsApp Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-ink-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-sand-500 flex-shrink-0" />
                <span>123 Commercial Street, Bengaluru 560001, Karnataka, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-sand-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-sand-500 flex-shrink-0" />
                <span>care@marisol.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-400">
          <p>© {new Date().getFullYear()} {STORE_NAME}. GSTIN: 29ABCDE1234F1Z5. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Secure payments via Razorpay</span>
            <span>·</span>
            <span>UPI · Cards · Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
