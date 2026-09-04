import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/database';
import { Product, Order, Artisan } from '../types';
import { ProductCard } from '../components/ProductCard';
import {
  Compass,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  MessageSquare,
  Clock,
  Store,
  MapPin,
  Star,
  Package
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { currentUser, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  // Ensure user is customer
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'customer') {
      switchRole('customer');
    }
  }, [currentUser?.role]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'explore' | 'wishlist' | 'orders' | 'artisans' | 'profile'>('dashboard');
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [orders, setOrders] = useState<Order[]>(() =>
    currentUser ? db.getOrdersByCustomer(currentUser.id) : db.getOrders()
  );
  const [artisans, setArtisans] = useState<Artisan[]>(() => db.getArtisans());
  const [wishlist, setWishlist] = useState<Product[]>(() => db.getProducts().slice(0, 3));

  const loadData = () => {
    setProducts(db.getProducts());
    if (currentUser) {
      setOrders(db.getOrdersByCustomer(currentUser.id));
    }
    setArtisans(db.getArtisans());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('all', loadData);
    return unsub;
  }, [currentUser?.id]);

  const recommendedCrafts = products.slice(0, 4);
  const recentlyViewed = products.slice(2, 6);

  return (
    <div className="min-h-screen bg-stone-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* ===================================================================
            SIDEBAR (Section 35)
           =================================================================== */}
        <aside className="lg:col-span-1 bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-11 h-11 rounded-full object-cover border border-amber-300"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-stone-900 truncate">{currentUser?.name || 'Priya Sharma'}</h3>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                Conscious Customer
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold text-stone-700">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'explore', label: 'Explore Crafts', icon: Compass, link: '/marketplace' },
              { id: 'ai-search', label: 'AI Search', icon: Sparkles, link: '/marketplace' },
              { id: 'artisans', label: 'Artisans', icon: Store },
              { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
              { id: 'cart', label: 'Cart', icon: ShoppingBag, link: '/cart' },
              { id: 'orders', label: `My Orders (${orders.length})`, icon: Package, link: '/customer/orders' },
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
            MAIN DASHBOARD CONTENT (Section 35)
           =================================================================== */}
        <main className="lg:col-span-4 space-y-8">
          
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-amber-800 via-stone-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                Customer Hub
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">
                Welcome, {currentUser?.name || 'Priya'}!
              </h1>
              <p className="text-xs text-stone-300 max-w-lg">
                Discover genuine GI-tagged Indian crafts, support generational artisans directly with zero intermediary cuts, and track your artisan dispatches.
              </p>
            </div>

            <button
              onClick={() => navigate('/marketplace')}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Crafts</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase">My Orders</span>
              <p className="text-2xl font-black text-stone-900 mt-0.5">{orders.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Wishlist Items</span>
              <p className="text-2xl font-black text-stone-900 mt-0.5">{wishlist.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Artisans Backed</span>
              <p className="text-2xl font-black text-amber-800 mt-0.5">
                {new Set(orders.map((o) => o.artisanId)).size || 3}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Fair Trade Impact</span>
              <p className="text-2xl font-black text-emerald-800 mt-0.5">100% Direct</p>
            </div>
          </div>

          {/* SECTION: Recommended Crafts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-stone-900">Recommended Crafts For You</h3>
                <p className="text-xs text-stone-500">Curated handcrafted pieces from verified artisan lineages</p>
              </div>
              <Link to="/marketplace" className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendedCrafts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* SECTION: Recently Viewed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-stone-900">Recently Viewed</h3>
                <p className="text-xs text-stone-500">Items you browsed in the handicraft marketplace</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentlyViewed.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* SECTION: Connected Artisans Directory */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-stone-900">Artisan Lineages & Direct Contacts</h3>
                <p className="text-xs text-stone-500">Generational craftspeople crafting your orders</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {artisans.slice(0, 3).map((art) => (
                <div
                  key={art.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <img
                    src={art.avatarUrl}
                    alt={art.name}
                    className="w-14 h-14 rounded-xl object-cover border border-amber-300"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-stone-900 truncate">{art.name}</h4>
                    <p className="text-[11px] text-amber-800 font-semibold truncate">{art.craftName}</p>
                    <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{art.village}, {art.state}</span>
                    </p>
                    <Link
                      to={`/artisan/store/${art.id}`}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-bold mt-1 inline-block"
                    >
                      Visit Storefront →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: Recent Orders Tracker */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-700" />
                <h3 className="font-black text-sm text-stone-900">Recent Order Activity</h3>
              </div>
              <Link to="/customer/orders" className="text-xs font-bold text-amber-800 hover:text-amber-900">
                View Full Timeline ({orders.length}) →
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No orders placed yet. Explore the marketplace!</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 2).map((ord) => (
                  <div key={ord.id} className="bg-stone-50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-black text-stone-900">Order #{ord.id}</span>
                      <p className="text-stone-500 text-[11px] mt-0.5">{ord.items.map((i) => i.productName).join(', ')}</p>
                      <span className="text-[10px] text-stone-400">Placed: {new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-stone-900">₹{ord.total.toLocaleString('en-IN')}</span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        {ord.status}
                      </span>
                      <Link
                        to="/customer/orders"
                        className="px-3 py-1 bg-white hover:bg-stone-100 rounded-lg border border-stone-300 font-bold text-[11px]"
                      >
                        Track
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
