import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
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
  Package,
  Phone,
  Mail,
  Filter,
  Eye,
  CheckCircle,
  X
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Protected Route Check
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'customer' && currentUser.role !== 'admin') {
      navigate('/artisan/dashboard');
    }
  }, [currentUser, navigate]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'browse' | 'orders' | 'artisans' | 'profile'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [contactArtisanModal, setContactArtisanModal] = useState<Artisan | null>(null);
  const [inquiryText, setInquiryText] = useState<string>('');

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

  const handleLogout = () => {
    logout();
    showToast('Signed Out', 'You have been safely logged out.', 'info');
    navigate('/login');
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactArtisanModal) return;

    db.addNotification({
      userId: contactArtisanModal.userId,
      role: 'artisan',
      title: `New Inquiry from ${currentUser?.name || 'Customer'}! 📩`,
      message: `Inquiry: "${inquiryText}". Contact: ${currentUser?.email} (${currentUser?.phone})`,
      type: 'b2b',
      read: false
    });

    showToast('Message Dispatched! ✉️', `Your message was sent to ${contactArtisanModal.name}.`, 'success');
    setContactArtisanModal(null);
    setInquiryText('');
  };

  // Filter products dynamically
  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];
  const locations = [
    'all',
    ...new Set(
      products
        .map((p) => {
          const parts = p.artisanLocation?.split(',') || [];
          return parts[parts.length - 1]?.trim();
        })
        .filter(Boolean)
    )
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.artisanName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesLocation =
      selectedLocation === 'all' ||
      (p.artisanLocation && p.artisanLocation.toLowerCase().includes(selectedLocation.toLowerCase()));

    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-stone-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* ===================================================================
            CUSTOMER SIDEBAR
           =================================================================== */}
        <aside className="lg:col-span-1 bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-full object-cover border border-amber-300 shadow-xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-stone-800 to-amber-800 text-white flex items-center justify-center font-bold text-base shadow-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-stone-900 truncate">{currentUser.name}</h3>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                Customer
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold text-stone-700">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'browse', label: 'Browse Handicrafts', icon: Compass },
              { id: 'artisans', label: `Meet Artisans (${artisans.length})`, icon: Store },
              { id: 'orders', label: `My Orders (${orders.length})`, icon: Package, link: '/customer/orders' },
              { id: 'cart', label: 'Cart', icon: ShoppingBag, link: '/cart' },
              { id: 'profile', label: 'My Profile', icon: User }
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

            {/* Prominent Visible Logout Button */}
            <div className="pt-3 border-t border-stone-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-bold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* ===================================================================
            MAIN CUSTOMER CONTENT AREA
           =================================================================== */}
        <main className="lg:col-span-4 space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                KalaConnect Member
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome, {currentUser.name}!
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-lg">
                Direct market connection to authentic Indian artisans. Discover GI-tagged crafts, wooden toys, handlooms, and folk art.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('browse')}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer flex-shrink-0"
            >
              <Compass className="w-4 h-4 text-amber-950" />
              <span>Browse All Handicrafts</span>
            </button>
          </div>

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                    Available Crafts
                  </span>
                  <p className="text-2xl font-black text-stone-900 mt-1">{products.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    Artisan Makers
                  </span>
                  <p className="text-2xl font-black text-amber-900 mt-1">{artisans.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                    My Orders
                  </span>
                  <p className="text-2xl font-black text-stone-900 mt-1">{orders.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                    Direct Impact
                  </span>
                  <p className="text-sm font-bold text-emerald-800 mt-2">100% to Artisans</p>
                </div>
              </div>

              {/* Featured Handicrafts Preview */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-stone-900">Featured Handicrafts</h3>
                    <p className="text-xs text-stone-500">Curated authentic creations from verified artisans</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="text-xs font-bold text-amber-800 hover:text-amber-900"
                  >
                    View Catalog ({products.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {products.slice(0, 6).map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BROWSE HANDICRAFTS (DYNAMIC SEARCH & FILTER) */}
          {activeTab === 'browse' && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h3 className="font-black text-lg text-stone-900">Browse Artisan Handicrafts</h3>
                <p className="text-xs text-stone-500">
                  Showing real products stored in the database. Filter by category, location, or keyword.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div className="relative sm:col-span-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search crafts or artisans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-medium"
                  >
                    <option value="all">All Categories</option>
                    {categories
                      .filter((c) => c !== 'all')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-medium"
                  >
                    <option value="all">All Locations</option>
                    {locations
                      .filter((l) => l !== 'all')
                      .map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-xs text-stone-500 font-semibold">
                Found {filteredProducts.length} handcrafted items:
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  No products matched your search. Try changing your filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="rounded-2xl border border-stone-200 overflow-hidden bg-white hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-44 object-cover"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-xs">
                            {prod.category}
                          </span>
                        </div>
                        <div className="p-4 space-y-1.5">
                          <h4 className="font-black text-sm text-stone-900 line-clamp-1">{prod.name}</h4>
                          <p className="text-xs text-stone-500 line-clamp-2">{prod.description}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-900 font-semibold pt-1">
                            <Store className="w-3.5 h-3.5 text-amber-700" />
                            <span>{prod.artisanName}</span>
                            <span className="text-stone-400">• {prod.artisanLocation}</span>
                          </div>
                          <div className="pt-2 flex items-center justify-between text-xs">
                            <span className="font-black text-base text-amber-800">
                              ₹{prod.publishedPrice?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-stone-400">Stock: {prod.stock || 1}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: View Details, Artisan Details, Contact */}
                      <div className="p-3.5 pt-0 grid grid-cols-2 gap-2">
                        <Link
                          to={`/marketplace/product/${prod.id}`}
                          className="py-2 text-center bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-800 flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                        <button
                          onClick={() => {
                            const artisan = artisans.find((a) => a.id === prod.artisanId || a.userId === prod.artisanId);
                            if (artisan) setContactArtisanModal(artisan);
                            else {
                              showToast('Artisan Info', `Artisan: ${prod.artisanName} (${prod.artisanLocation})`, 'info');
                            }
                          }}
                          className="py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Contact Artisan</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ARTISANS DIRECTORY */}
          {activeTab === 'artisans' && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-black text-lg text-stone-900">Meet Our Indian Artisans</h3>
                <p className="text-xs text-stone-500">Connect directly with creators across regional craft clusters</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artisans.map((artisan) => (
                  <div
                    key={artisan.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 flex items-start gap-3.5"
                  >
                    {artisan.avatarUrl ? (
                      <img
                        src={artisan.avatarUrl}
                        alt={artisan.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-amber-300 shadow-xs flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-stone-800 text-white flex items-center justify-center font-bold text-lg border border-amber-300 shadow-xs flex-shrink-0">
                        {artisan.name ? artisan.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-extrabold text-sm text-stone-900 truncate">{artisan.name}</h4>
                      <p className="text-xs text-amber-800 font-bold truncate">{artisan.craftName}</p>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {artisan.village}, {artisan.state}
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <Link
                          to={`/artisan/store/${artisan.id}`}
                          className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-[11px] font-bold text-stone-800 hover:bg-stone-50"
                        >
                          View Store
                        </Link>
                        <button
                          onClick={() => setContactArtisanModal(artisan)}
                          className="px-3 py-1 bg-amber-700 text-white rounded-lg text-[11px] font-bold hover:bg-amber-800 cursor-pointer"
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-black text-lg text-stone-900">Customer Profile</h3>
                <p className="text-xs text-stone-500">Your account details stored in the database</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-extrabold uppercase text-stone-400">Full Name</span>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">{currentUser.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-extrabold uppercase text-stone-400">Email Address</span>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">{currentUser.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-extrabold uppercase text-stone-400">Phone Number</span>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">{currentUser.phone || 'Not provided'}</p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-extrabold uppercase text-stone-400">Location</span>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">{currentUser.location || currentUser.state || 'India'}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out from Account</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Contact Artisan Modal */}
      {contactArtisanModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="font-black text-base text-stone-900">Contact {contactArtisanModal.name}</h4>
                <p className="text-xs text-amber-800 font-bold">{contactArtisanModal.craftName}</p>
              </div>
              <button
                onClick={() => setContactArtisanModal(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInquiry} className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <p className="font-bold text-stone-700">Artisan Location: {contactArtisanModal.village}, {contactArtisanModal.state}</p>
                <p className="text-stone-500">Direct Message: Will be sent to the artisan's personal inbox.</p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Your Message or Custom Craft Request</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ask about custom dimensions, bulk orders, materials, or delivery timelines..."
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  className="w-full p-3 border border-stone-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContactArtisanModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold shadow-sm"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
