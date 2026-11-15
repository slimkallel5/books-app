import { useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutOverlay } from './components/CheckoutOverlay';
import { HomePage } from './pages/HomePage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminPage } from './pages/AdminPage';
import { useAuth, useUi } from './lib/store';
import { useThemeEffect } from './lib/theme';

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function Shell() {
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const toggleCart = useUi((s) => s.toggleCart);

  useThemeEffect();

  return (
    <>
      <Header cartButtonRef={cartButtonRef} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage cartButtonRef={cartButtonRef} />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />

      <CartDrawer
        onCheckout={() => {
          toggleCart(false);
          setCheckoutOpen(true);
        }}
      />
      <CheckoutOverlay open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
