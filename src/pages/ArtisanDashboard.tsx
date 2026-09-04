import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/database';
import { Product, Order, B2BRequirement } from '../types';
import {
  Sparkles,
  Package,
  ShoppingBag,
  DollarSign,
  Eye,
  Briefcase,
  Store,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Sliders,
  Award,
  Bell,
  User,
  LogOut,
  Layers,
  Coins,
  BarChart3
} from 'lucide-react';

export const ArtisanDashboard: React.FC = () => {
  const { currentArtisan, currentUser, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  // Auto-switch to artisan if not already
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'artisan') {
      switchRole('artisan');
    }
  }, [currentUser?.role]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'studio' | 'products' | 'orders' | 'b2b' | 'store' | 'analytics' | 'notifications' | 'profile'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [b2bReqs, setB2BReqs] = useState<B2BRequirement[]>([]);

  const loadData = () => {
    if (currentArtisan) {
      const prods = db.getProductsByArtisan(currentArtisan.id);
      setProducts(prods);
      const ords = db.getOrdersByArtisan(currentArtisan.id);
      setOrders(ords);
      const b2b = db.getB2BRequirements();
      setB2BReqs(b2b);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('all', loadData);
    return unsub;
  }, [currentArtisan?.id]);

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0) + (currentArtisan?.totalSales || 0);
  const activeProductsCount = products.filter((p) => p.status === 'active').length;
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0) + (currentArtisan?.profileViews || 0);

  return (
    <div className="min-h-screen bg-stone-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* ===================================================================
            ARTISAN SIDEBAR (Section 8)
           =================================================================== */}
        <aside className="lg:col-span-1 bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <img
              src={currentArtisan?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'}
              alt={currentArtisan?.name}
              className="w-11 h-11 rounded-full object-cover border border-amber-400"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-sm text-stone-900 truncate">{currentArtisan?.name || 'Kalyani Devi'}</h3>
              <p className="text-[11px] text-amber-800 font-semibold truncate">{currentArtisan?.craftName || 'Craftsperson'}</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold text-stone-700">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'studio', label: 'AI Product Studio', icon: Sparkles, link: '/artisan/studio' },
              { id: 'add-product', label: 'Add Product', icon: PlusCircle, link: '/artisan/studio' },
              { id: 'products', label: `My Products (${products.length})`, icon: Package, link: '/artisan/products' },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag, link: '/artisan/orders' },
              { id: 'b2b', label: `B2B Marketplace (${b2bReqs.length})`, icon: Briefcase, link: '/artisan/b2b' },
              { id: 'store', label: 'My Store', icon: Store, link: `/artisan/store/${currentArtisan?.id || 'artisan-1'}` },
              { id: 'analytics', label: 'Analytics', icon: BarChart3, link: '/impact' },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return item.link ? (
                <Link
                  key={item.id}
                  to={item.link}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-amber-700" />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-amber-800 text-white font-bold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-amber-700'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-stone-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* ===================================================================
            MAIN ARTISAN DASHBOARD (Section 8)
           =================================================================== */}
        <main className="lg:col-span-4 space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-amber-700 via-stone-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={currentArtisan?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                alt={currentArtisan?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md flex-shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    Welcome, {currentArtisan?.name || 'Artisan'}!
                  </h1>
                  {currentArtisan?.verificationStatus === 'verified' ? (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" />
                      <span>✓ Verified Artisan</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-stone-950">
                      Verification Pending
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  {currentArtisan?.craftName} • {currentArtisan?.village}, {currentArtisan?.state}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/artisan/studio')}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-950" />
              <span>Launch AI Product Studio</span>
            </button>
          </div>

          {/* 6 Required Statistics Cards (Section 8) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                Total Products
              </span>
              <p className="text-2xl font-black text-stone-900 mt-1">{products.length}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                Active Products
              </span>
              <p className="text-2xl font-black text-emerald-800 mt-1">{activeProductsCount}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                Orders
              </span>
              <p className="text-2xl font-black text-stone-900 mt-1">{orders.length}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                Sales
              </span>
              <p className="text-lg font-black text-stone-900 mt-1 truncate">
                ₹{totalSales.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                Product Views
              </span>
              <p className="text-2xl font-black text-stone-900 mt-1">{totalViews}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                B2B Requests
              </span>
              <p className="text-2xl font-black text-blue-800 mt-1">{b2bReqs.length}</p>
            </div>
          </div>

          {/* 8 Quick Actions (Section 8) */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <button
                onClick={() => navigate('/artisan/studio')}
                className="p-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white flex flex-col items-center text-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-amber-200" />
                <span className="text-xs font-bold">Create Product</span>
              </button>

              <button
                onClick={() => navigate('/artisan/studio')}
                className="p-4 rounded-2xl bg-stone-900 hover:bg-black text-white flex flex-col items-center text-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold">AI Product Studio</span>
              </button>

              <button
                onClick={() => navigate('/artisan/studio')}
                className="p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
              >
                <Coins className="w-5 h-5 text-amber-700" />
                <span className="text-xs font-bold">Price Assistant</span>
              </button>

              <button
                onClick={() => navigate('/artisan/products')}
                className="p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
              >
                <Package className="w-5 h-5 text-stone-700" />
                <span className="text-xs font-bold">My Products</span>
              </button>

              <button
                onClick={() => navigate(`/artisan/store/${currentArtisan?.id || 'artisan-1'}`)}
                className="p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
              >
                <Store className="w-5 h-5 text-purple-700" />
                <span className="text-xs font-bold">My Store</span>
              </button>

              <button
                onClick={() => navigate('/artisan/orders')}
                className="p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-bold">Orders</span>
              </button>

              <button
                onClick={() => navigate('/artisan/b2b')}
                className="p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
              >
                <Briefcase className="w-5 h-5 text-blue-700" />
                <span className="text-xs font-bold">B2B Requests</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className="p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
              >
                <Bell className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold">Notifications</span>
              </button>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-sm text-stone-900">Recent Customer Orders</h3>
              </div>
              <Link to="/artisan/orders" className="text-xs font-bold text-amber-800 hover:text-amber-900">
                View All ({orders.length}) →
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No orders received yet.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {orders.slice(0, 3).map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-black text-stone-900">Order #{ord.id}</span>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        Customer: {ord.customerName} ({ord.city}, {ord.state})
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-stone-900">₹{ord.total.toLocaleString('en-IN')}</span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900">
                        {ord.status}
                      </span>
                      <Link
                        to="/artisan/orders"
                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-[11px]"
                      >
                        Update
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};
