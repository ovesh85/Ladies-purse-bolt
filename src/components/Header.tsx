import { useEffect, useState } from 'react';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import { useRouter } from '../lib/router';
import { useCart } from '../lib/cart';
import { useWishlist } from '../lib/wishlist';
import { useAuth } from '../lib/auth';
import { STORE_NAME } from '../lib/supabase';

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { navigate, path } = useRouter();
  const { count } = useCart();
  const { items } = useWishlist();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Shop All', path: '/shop' },
    { label: 'Totes', path: '/shop?category=tote-bags' },
    { label: 'Shoulder', path: '/shop?category=shoulder-bags' },
    { label: 'Clutches', path: '/shop?category=clutches' },
    { label: 'Sling', path: '/shop?category=sling-bags' },
    { label: 'Backpacks', path: '/shop?category=backpacks' },
    { label: 'Mini', path: '/shop?category=mini-bags' },
  ];

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  const isActive = (p: string) => {
    if (p === '/shop') return path === '/shop';
    return false;
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-ink-900 text-ink-50 text-xs tracking-wider text-center py-2 px-4">
        Free shipping on orders over ₹2,999 · Easy 7-day returns · GST invoice with every order
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-ink-50/95 backdrop-blur-md shadow-sm border-b border-ink-200/60'
            : 'bg-ink-50/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 -ml-2 text-ink-800"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <a
              href="#/"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              className="font-serif text-2xl lg:text-3xl font-semibold tracking-tight text-ink-900"
            >
              {STORE_NAME}
              <span className="text-sand-600">.</span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-7 text-sm">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={`#${item.path}`}
                  onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                  className={`link-underline text-ink-700 hover:text-ink-900 transition-colors ${
                    isActive(item.path) ? 'text-ink-900 font-medium' : ''
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="p-2 text-ink-800 hover:bg-ink-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              <a
                href="#/wishlist"
                onClick={(e) => { e.preventDefault(); navigate('/wishlist'); }}
                className="relative p-2 text-ink-800 hover:bg-ink-100 rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-blush-600 text-[10px] font-bold text-white">
                    {items.length}
                  </span>
                )}
              </a>

              {user ? (
                <div className="relative group">
                  <button
                    className="p-2 text-ink-800 hover:bg-ink-100 rounded-full transition-colors"
                    aria-label="Account"
                  >
                    <User className="h-5 w-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all origin-top-right">
                    <div className="rounded-2xl bg-white ring-1 ring-ink-200 shadow-lg p-2">
                      <div className="px-3 py-2 border-b border-ink-100 mb-1">
                        <p className="text-sm font-medium text-ink-900 truncate">
                          {profile?.full_name || 'Account'}
                        </p>
                        <p className="text-xs text-ink-500 truncate">{user.email}</p>
                      </div>
                      <button onClick={() => navigate('/account')} className="w-full text-left px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 rounded-lg">My Orders</button>
                      <button onClick={() => navigate('/account?tab=addresses')} className="w-full text-left px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 rounded-lg">Addresses</button>
                      <button onClick={() => navigate('/account?tab=profile')} className="w-full text-left px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 rounded-lg">Profile</button>
                      {isAdmin && (
                        <button onClick={() => navigate('/admin')} className="w-full text-left px-3 py-2 text-sm text-sand-700 font-medium hover:bg-sand-50 rounded-lg">Admin Panel</button>
                      )}
                      <button
                        onClick={() => { signOut(); navigate('/'); }}
                        className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg border-t border-ink-100 mt-1 pt-2"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  href="#/login"
                  onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                  className="p-2 text-ink-800 hover:bg-ink-100 rounded-full transition-colors"
                  aria-label="Sign in"
                >
                  <User className="h-5 w-5" />
                </a>
              )}

              <button
                onClick={onOpenCart}
                className="relative p-2 text-ink-800 hover:bg-ink-100 rounded-full transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-sand-600 text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="pb-4 animate-slide-up">
              <form onSubmit={onSearch} className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search for totes, clutches, slings..."
                  className="w-full rounded-full border border-ink-200 bg-white pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-ink-900"
                />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85%] bg-ink-50 shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ink-200">
              <span className="font-serif text-xl font-semibold">{STORE_NAME}</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={`#${item.path}`}
                  onClick={(e) => { e.preventDefault(); navigate(item.path); setMenuOpen(false); }}
                  className="block px-3 py-3 text-base text-ink-800 hover:bg-ink-100 rounded-xl transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <hr className="my-2 border-ink-200" />
              {user ? (
                <>
                  <button onClick={() => { navigate('/account'); setMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base text-ink-800 hover:bg-ink-100 rounded-xl">My Account</button>
                  {isAdmin && (
                    <button onClick={() => { navigate('/admin'); setMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base text-sand-700 font-medium hover:bg-sand-50 rounded-xl">Admin Panel</button>
                  )}
                  <button onClick={() => { signOut(); setMenuOpen(false); navigate('/'); }} className="block w-full text-left px-3 py-3 text-base text-rose-600 hover:bg-rose-50 rounded-xl">Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base text-ink-800 hover:bg-ink-100 rounded-xl">Sign In</button>
                  <button onClick={() => { navigate('/login?mode=signup'); setMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base text-ink-800 hover:bg-ink-100 rounded-xl">Create Account</button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
