import { useState } from 'react';
import { AuthProvider } from './lib/auth';
import { RouterProvider, useRouter } from './lib/router';
import { CartProvider } from './lib/cart';
import { WishlistProvider } from './lib/wishlist';
import { ToastProvider } from './lib/toast';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AuthPage } from './pages/AuthPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';

function Routes() {
  const { path } = useRouter();
  const [cartOpen, setCartOpen] = useState(false);

  const renderPage = () => {
    if (path === '/' || path === '') return <HomePage />;
    if (path === '/shop') return <ShopPage />;
    if (path.startsWith('/product/')) return <ProductDetailPage />;
    if (path === '/login') return <AuthPage />;
    if (path === '/wishlist') return <WishlistPage />;
    if (path === '/checkout') return <CheckoutPage />;
    if (path === '/account') return <AccountPage />;
    if (path === '/admin' || path.startsWith('/admin')) return <AdminPage />;
    return <NotFound />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Header onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <WhatsAppWidget />
    </div>
  );
}

function NotFound() {
  const { navigate } = useRouter();
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="font-serif text-7xl text-ink-900">404</p>
      <p className="mt-3 text-ink-600">This page wandered off. Let's get you back.</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-6">Back to Home</button>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes />
            </CartProvider>
          </WishlistProvider>
        </RouterProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
