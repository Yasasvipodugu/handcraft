import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
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
  X,
  Tag
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useNotifications();
  const { language, t, translate } = useLanguage();
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
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
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

  // Price range counts for quick-filter tabs
  const priceRangeCounts = {
    all: products.length,
    under1000: products.filter((p) => (p.publishedPrice || 0) < 1000).length,
    range1000to2500: products.filter((p) => (p.publishedPrice || 0) >= 1000 && (p.publishedPrice || 0) <= 2500).length,
    range2500to5000: products.filter((p) => (p.publishedPrice || 0) > 2500 && (p.publishedPrice || 0) <= 5000).length,
    above5000: products.filter((p) => (p.publishedPrice || 0) > 5000).length
  };

  const getCostTierBadge = (price: number) => {
    if (price < 1000) return { label: 'Under ₹1,000', tag: '< ₹1K', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    if (price <= 2500) return { label: '₹1,000 – ₹2,500', tag: '₹1K - ₹2.5K', bg: 'bg-amber-50 text-amber-900 border-amber-300' };
    if (price <= 5000) return { label: '₹2,500 – ₹5,000', tag: '₹2.5K - ₹5K', bg: 'bg-purple-50 text-purple-800 border-purple-300' };
    return { label: 'Above ₹5,000', tag: 'Above ₹5K', bg: 'bg-rose-50 text-rose-800 border-rose-300' };
  };

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

    const price = p.publishedPrice || 0;
    let matchesPrice = true;
    if (selectedPriceRange === 'under-1000') {
      matchesPrice = price < 1000;
    } else if (selectedPriceRange === '1000-2500') {
      matchesPrice = price >= 1000 && price <= 2500;
    } else if (selectedPriceRange === '2500-5000') {
      matchesPrice = price > 2500 && price <= 5000;
    } else if (selectedPriceRange === 'above-5000') {
      matchesPrice = price > 5000;
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-stone-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        
        {/* ===================================================================
            CUSTOMER SIDEBAR
           =================================================================== */}
        <aside className="lg:col-span-3 xl:col-span-3 bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-6 sticky top-24">
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
        <main className="lg:col-span-9 xl:col-span-9 space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                {translate('Direct Artisan Support')}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {currentUser.name} — {translate('Customer Dashboard')}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-lg">
                {translate('Empowering artisans with AI, digital tools and better market access.')}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('browse')}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer flex-shrink-0"
            >
              <Compass className="w-4 h-4 text-amber-950" />
              <span>{translate('Browse All Handicrafts')}</span>
            </button>
          </div>

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                    {translate('Available Crafts')}
                  </span>
                  <p className="text-2xl font-black text-stone-900 mt-1">{products.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    {translate('Artisan Makers')}
                  </span>
                  <p className="text-2xl font-black text-amber-900 mt-1">{artisans.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                    {translate('My Orders')}
                  </span>
                  <p className="text-2xl font-black text-stone-900 mt-1">{orders.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                    {translate('Direct Impact')}
                  </span>
                  <p className="text-sm font-bold text-emerald-800 mt-2">{translate('100% to Artisans')}</p>
                </div>
              </div>

              {/* Featured Handicrafts Preview */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-stone-900">{translate('Featured Handicrafts')}</h3>
                    <p className="text-xs text-stone-500">{translate('Curated authentic creations from verified artisans')}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="text-xs font-bold text-amber-800 hover:text-amber-900"
                  >
                    {translate('View Catalog')} ({products.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {products.slice(0, 8).map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </div>

              {/* Shop by Cost Range Interactive Showcase */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-stone-900">{translate('Shop by Cost Range')}</h3>
                    <p className="text-xs text-stone-500">{translate('Discover authentic crafts suited to your budget and gifting needs')}</p>
                  </div>
                  <span className="text-xs font-bold text-stone-400">{translate('4 Price Tiers')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      id: 'under-1000',
                      title: 'Under ₹1,000',
                      subtitle: 'Budget Friendly Utility Crafts',
                      desc: 'Terracotta planters, Kondapalli wooden toys, bamboo baskets & folk pottery.',
                      count: priceRangeCounts.under1000,
                      badge: 'Everyday Decor',
                      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950',
                      tagColor: 'bg-emerald-100 text-emerald-800'
                    },
                    {
                      id: '1000-2500',
                      title: '₹1,000 – ₹2,500',
                      subtitle: 'Popular Artisan Range',
                      desc: 'Classic rose gold watches, Mithila Madhubani art, Dhokra brass & jewelry.',
                      count: priceRangeCounts.range1000to2500,
                      badge: 'Most Popular',
                      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-950',
                      tagColor: 'bg-amber-100 text-amber-900'
                    },
                    {
                      id: '2500-5000',
                      title: '₹2,500 – ₹5,000',
                      subtitle: 'Artisan Heritage Crafts',
                      desc: 'Pure Kashmiri Pashmina cashmere shawls, fine woodwork & museum-grade art.',
                      count: priceRangeCounts.range2500to5000,
                      badge: 'GI Heritage',
                      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-950',
                      tagColor: 'bg-purple-100 text-purple-800'
                    },
                    {
                      id: 'above-5000',
                      title: 'Above ₹5,000',
                      subtitle: 'Masterpiece & Luxury',
                      desc: 'Royal Banarasi pure Katan silk sarees and generational mastercrafts.',
                      count: priceRangeCounts.above5000,
                      badge: 'Heirloom Luxury',
                      color: 'border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-950',
                      tagColor: 'bg-rose-100 text-rose-800'
                    }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => {
                        setSelectedPriceRange(tier.id);
                        setActiveTab('browse');
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between ${tier.color}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${tier.tagColor}`}>
                            {translate(tier.badge)}
                          </span>
                          <span className="text-xs font-black opacity-75">{tier.count} {translate('Items')}</span>
                        </div>
                        <h4 className="text-base font-black tracking-tight pt-1">{translate(tier.title)}</h4>
                        <p className="text-[11px] font-bold opacity-85">{translate(tier.subtitle)}</p>
                        <p className="text-[11px] opacity-70 line-clamp-2 pt-1">{tier.desc}</p>
                      </div>

                      <div className="pt-3 flex items-center gap-1 text-xs font-bold text-amber-800">
                        <span>{translate('Browse Items')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BROWSE HANDICRAFTS (DYNAMIC SEARCH & FILTER) */}
          {activeTab === 'browse' && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h3 className="font-black text-lg text-stone-900">{translate('Browse Artisan Handicrafts')}</h3>
                <p className="text-xs text-stone-500">
                  {translate('Showing real products stored in the database. Filter by category, location, or keyword.')}
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder={translate('Search crafts or artisans...')}
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
                    <option value="all">{translate('All Categories')}</option>
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
                    <option value="all">{translate('All Locations')}</option>
                    {locations
                      .filter((l) => l !== 'all')
                      .map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Cost Range Filter Dropdown */}
                <div>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-medium text-amber-950 font-bold"
                  >
                    <option value="all">{translate('All Cost Ranges')} ({priceRangeCounts.all})</option>
                    <option value="under-1000">{translate('Under ₹1,000')} ({priceRangeCounts.under1000})</option>
                    <option value="1000-2500">{translate('₹1,000 – ₹2,500')} ({priceRangeCounts.range1000to2500})</option>
                    <option value="2500-5000">{translate('₹2,500 – ₹5,000')} ({priceRangeCounts.range2500to5000})</option>
                    <option value="above-5000">{translate('Above ₹5,000')} ({priceRangeCounts.above5000})</option>
                  </select>
                </div>
              </div>

              {/* Interactive Cost Range Quick-Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
                <span className="font-bold text-stone-500 text-[11px] whitespace-nowrap">{translate('Cost Range:')}</span>
                {[
                  { id: 'all', label: translate('All Crafts'), count: priceRangeCounts.all },
                  { id: 'under-1000', label: translate('Under ₹1,000'), count: priceRangeCounts.under1000 },
                  { id: '1000-2500', label: translate('₹1,000 – ₹2,500'), count: priceRangeCounts.range1000to2500 },
                  { id: '2500-5000', label: translate('₹2,500 – ₹5,000'), count: priceRangeCounts.range2500to5000 },
                  { id: 'above-5000', label: translate('Above ₹5,000'), count: priceRangeCounts.above5000 }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedPriceRange(pill.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                      selectedPriceRange === pill.id
                        ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        selectedPriceRange === pill.id ? 'bg-amber-950 text-amber-100' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold border-t border-stone-100 pt-3">
                <span>{translate('Found')} {filteredProducts.length} {translate('handcrafted items:')}</span>
                {selectedPriceRange !== 'all' && (
                  <button
                    onClick={() => setSelectedPriceRange('all')}
                    className="text-amber-800 hover:text-amber-900 underline text-xs font-bold cursor-pointer"
                  >
                    {translate('Clear Cost Filter')}
                  </button>
                )}
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  {translate('No products matched your search. Try changing your filters.')}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
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
                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-xs">
                              {prod.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-xs shadow-xs ${getCostTierBadge(prod.publishedPrice || 0).bg}`}>
                              {getCostTierBadge(prod.publishedPrice || 0).tag}
                            </span>
                          </div>
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
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-black text-base text-amber-800">
                                ₹{prod.publishedPrice?.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] font-semibold text-stone-400">
                                ({getCostTierBadge(prod.publishedPrice || 0).label})
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400">{translate('Stock:')} {prod.stock || 1}</span>
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
                          <span>{translate('View Details')}</span>
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
                          <span>{translate('Contact Artisan')}</span>
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
