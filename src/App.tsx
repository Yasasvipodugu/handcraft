import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import { DemoSwitcher } from './components/DemoSwitcher';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ImpactPage } from './pages/ImpactPage';
import { ArtisanDashboard } from './pages/ArtisanDashboard';
import { AiProductStudio } from './pages/AiProductStudio';
import { ArtisanProductsPage } from './pages/ArtisanProductsPage';
import { ArtisanOrdersPage } from './pages/ArtisanOrdersPage';
import { ArtisanStorePage } from './pages/ArtisanStorePage';
import { ArtisanB2BPage } from './pages/ArtisanB2BPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { CustomerOrdersPage } from './pages/CustomerOrdersPage';
import { B2BDashboardPage } from './pages/B2BDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen font-sans text-stone-900 bg-stone-50/50 selection:bg-amber-700 selection:text-white">
                {/* Interactive Persona Switcher Banner */}
                <DemoSwitcher />

                {/* Primary Navigation Bar */}
                <Navbar />

                {/* Main Content Router */}
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/marketplace/product/:id" element={<ProductDetailsPage />} />
                    <Route path="/product/:id" element={<ProductDetailsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/impact" element={<ImpactPage />} />

                    {/* Artisan Routes */}
                    <Route path="/artisan/dashboard" element={<ArtisanDashboard />} />
                    <Route path="/artisan/studio" element={<AiProductStudio />} />
                    <Route path="/artisan/products" element={<ArtisanProductsPage />} />
                    <Route path="/artisan/orders" element={<ArtisanOrdersPage />} />
                    <Route path="/artisan/store/:id" element={<ArtisanStorePage />} />
                    <Route path="/artisan/:id" element={<ArtisanStorePage />} />
                    <Route path="/artisan/b2b" element={<ArtisanB2BPage />} />

                    {/* Customer Routes */}
                    <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
                    <Route path="/customer/orders" element={<CustomerOrdersPage />} />

                    {/* B2B Buyer Routes */}
                    <Route path="/b2b" element={<B2BDashboardPage />} />
                    <Route path="/b2b/dashboard" element={<B2BDashboardPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

                    {/* Auth Routes & Role Aliases */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/artisan/login" element={<LoginPage />} />
                    <Route path="/customer/login" element={<LoginPage />} />
                    <Route path="/b2b/login" element={<LoginPage />} />
                    <Route path="/admin/login" element={<LoginPage />} />

                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/artisan/register" element={<RegisterPage />} />
                    <Route path="/customer/register" element={<RegisterPage />} />
                    <Route path="/b2b/register" element={<RegisterPage />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                {/* Global Footer */}
                <Footer />

                {/* Toast Notification Container */}
                <ToastContainer />
              </div>
            </CartProvider>
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
