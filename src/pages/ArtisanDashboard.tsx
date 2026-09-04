import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../services/database';
import { Product, Order, B2BRequirement } from '../types';
import {
  Sparkles,
  Package,
  ShoppingBag,
  Eye,
  Briefcase,
  Store,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Award,
  Bell,
  User,
  LogOut,
  Layers,
  Coins,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  X
} from 'lucide-react';

export const ArtisanDashboard: React.FC = () => {
  const { currentArtisan, currentUser, logout } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Protected Route Check
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'artisan' && currentUser.role !== 'admin') {
      navigate('/customer/dashboard');
    }
  }, [currentUser, navigate]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'profile' | 'orders'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [b2bReqs, setB2BReqs] = useState<B2BRequirement[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = () => {
    if (currentArtisan || currentUser) {
      const artisanId = currentArtisan?.id || currentUser?.id;
      const allProds = db.getProducts();
      // Strict ownership filtering: only products belonging to this artisan
      const myProds = allProds.filter(
        (p) =>
          p.artisanId === artisanId ||
          p.artisanId === `artisan-${currentUser?.id}` ||
          (currentArtisan && p.artisanId === currentArtisan.id)
      );
      setProducts(myProds);

      if (currentArtisan) {
        setOrders(db.getOrdersByArtisan(currentArtisan.id));
      }
      setB2BReqs(db.getB2BRequirements());
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('all', loadData);
    return unsub;
  }, [currentArtisan?.id, currentUser?.id]);

  const handleLogout = () => {
    logout();
    showToast('Signed Out', 'You have been logged out of your session.', 'info');
    navigate('/login');
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      const deleted = db.deleteProduct(productId, currentUser?.id);
      if (deleted) {
        showToast('Product Removed', `"${productName}" has been deleted.`, 'info');
        loadData();
      } else {
        showToast('Action Forbidden', 'You do not have permission to delete this product.', 'error');
      }
    }
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated = db.updateProduct(
      editingProduct.id,
      {
        name: editingProduct.name,
        category: editingProduct.category,
        material: editingProduct.material,
        publishedPrice: Number(editingProduct.publishedPrice),
        stock: Number(editingProduct.stock),
        description: editingProduct.description
      },
      currentUser?.id
    );

    if (updated) {
      showToast('Product Updated! ✓', `Saved updates for "${editingProduct.name}".`, 'success');
      setEditingProduct(null);
      loadData();
    } else {
      showToast('Update Failed', 'You do not have permission to edit this product.', 'error');
    }
  };

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0) + (currentArtisan?.totalSales || 0);
  const activeProductsCount = products.filter((p) => p.status === 'active').length;
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0) + (currentArtisan?.profileViews || 0);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-stone-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* ===================================================================
            ARTISAN SIDEBAR
           =================================================================== */}
        <aside className="lg:col-span-1 bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <img
              src={
                currentUser.avatar ||
                currentArtisan?.avatarUrl ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
              }
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover border border-amber-400 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-sm text-stone-900 truncate">{currentUser.name}</h3>
              <p className="text-[11px] text-amber-800 font-semibold truncate">
                {currentUser.craftCategory || currentUser.craft_type || currentArtisan?.craftName || 'Master Artisan'}
              </p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold text-stone-700">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'products', label: `My Products (${products.length})`, icon: Package },
              { id: 'profile', label: 'Artisan Profile', icon: User },
              { id: 'studio', label: 'AI Product Studio', icon: Sparkles, link: '/artisan/studio' },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag, link: '/artisan/orders' },
              { id: 'b2b', label: `B2B Wholesale (${b2bReqs.length})`, icon: Briefcase, link: '/artisan/b2b' },
              { id: 'store', label: 'Storefront', icon: Store, link: `/artisan/store/${currentArtisan?.id || currentUser.id}` }
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

            {/* Prominent Logout Button */}
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
            MAIN ARTISAN CONTENT AREA
           =================================================================== */}
        <main className="lg:col-span-4 space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-amber-700 via-stone-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={
                  currentUser.avatar ||
                  currentArtisan?.avatarUrl ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
                }
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md flex-shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    Welcome, {currentUser.name}!
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" />
                    <span>✓ Artisan</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300">
                  {currentUser.craftCategory || currentUser.craft_type || 'Generational Artisan'} • {currentUser.location || currentUser.state || 'India'}
                </p>
                <p className="text-[11px] text-amber-200">
                  Contact: {currentUser.phone} • {currentUser.email}
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

          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                    My Products
                  </span>
                  <p className="text-2xl font-black text-stone-900 mt-1">{products.length}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                    Active
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
                    Views
                  </span>
                  <p className="text-2xl font-black text-stone-900 mt-1">{totalViews}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                    B2B Inquiries
                  </span>
                  <p className="text-2xl font-black text-blue-800 mt-1">{b2bReqs.length}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                  Artisan Tools & Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <button
                    onClick={() => navigate('/artisan/studio')}
                    className="p-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white flex flex-col items-center text-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5 text-amber-200" />
                    <span className="text-xs font-bold">Add Handicraft</span>
                  </button>

                  <button
                    onClick={() => navigate('/artisan/studio')}
                    className="p-4 rounded-2xl bg-stone-900 hover:bg-black text-white flex flex-col items-center text-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold">AI Studio</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('products')}
                    className="p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
                  >
                    <Package className="w-5 h-5 text-stone-700" />
                    <span className="text-xs font-bold">My Products ({products.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className="p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
                  >
                    <User className="w-5 h-5 text-amber-700" />
                    <span className="text-xs font-bold">View Profile</span>
                  </button>
                </div>
              </div>

              {/* My Products Preview Grid */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-700" />
                    <h3 className="font-bold text-sm text-stone-900">My Listed Handicrafts</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-bold text-amber-800 hover:text-amber-900"
                  >
                    Manage All ({products.length}) →
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-sm text-stone-500">You have not added any handicrafts yet.</p>
                    <button
                      onClick={() => navigate('/artisan/studio')}
                      className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-amber-800"
                    >
                      + Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {products.slice(0, 3).map((prod) => (
                      <div
                        key={prod.id}
                        className="rounded-2xl border border-stone-200 overflow-hidden bg-stone-50/50 hover:shadow-md transition-shadow"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-3.5 space-y-2">
                          <h4 className="font-bold text-xs text-stone-900 truncate">{prod.name}</h4>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-amber-800">
                              ₹{prod.publishedPrice?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-stone-500 font-semibold">{prod.category}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                            <Link
                              to={`/marketplace/product/${prod.id}`}
                              className="flex-1 py-1 text-center bg-white border border-stone-200 hover:bg-stone-50 rounded-lg text-[11px] font-bold text-stone-700"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="p-1 px-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-[11px] font-bold text-amber-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1 px-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-[11px] font-bold text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY PRODUCTS (FULL MANAGEMENT) */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-black text-lg text-stone-900">My Handicraft Products</h3>
                  <p className="text-xs text-stone-500">
                    Products cataloged and published by {currentUser.name}. Only you can edit or delete these items.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/artisan/studio')}
                  className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="w-12 h-12 text-stone-300 mx-auto" />
                  <h4 className="font-bold text-base text-stone-800">No products uploaded yet</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Use the AI Product Studio to capture photos, generate background presets, translate descriptions, and publish your handicrafts.
                  </p>
                  <button
                    onClick={() => navigate('/artisan/studio')}
                    className="px-5 py-2.5 bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-amber-800"
                  >
                    Launch Studio & Add Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {products.map((prod) => (
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
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-xs">
                            {prod.category}
                          </span>
                        </div>
                        <div className="p-4 space-y-1.5">
                          <h4 className="font-black text-sm text-stone-900 line-clamp-1">{prod.name}</h4>
                          <p className="text-xs text-stone-500 line-clamp-2">{prod.description}</p>
                          <div className="pt-2 flex items-center justify-between text-xs">
                            <span className="font-black text-base text-amber-800">
                              ₹{prod.publishedPrice?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-stone-500">Stock: {prod.stock || 1}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: View, Edit, Delete */}
                      <div className="p-3.5 pt-0 grid grid-cols-3 gap-2">
                        <Link
                          to={`/marketplace/product/${prod.id}`}
                          className="py-1.5 text-center bg-stone-50 hover:bg-stone-100 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                        <button
                          onClick={() => setEditingProduct(prod)}
                          className="py-1.5 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-bold text-amber-800 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="py-1.5 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold text-rose-700 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ARTISAN PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h3 className="font-black text-lg text-stone-900">Artisan Profile & Workshop Details</h3>
                <p className="text-xs text-stone-500">
                  This information is displayed to customers and corporate wholesale buyers on the marketplace.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="flex flex-col items-center text-center space-y-3 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                  <img
                    src={
                      currentUser.avatar ||
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={currentUser.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-300 shadow-md"
                  />
                  <div>
                    <h4 className="font-black text-base text-stone-900">{currentUser.name}</h4>
                    <p className="text-xs text-amber-800 font-bold mt-0.5">Master Artisan</p>
                    <span className="inline-block mt-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Verified Member
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] font-extrabold uppercase text-stone-400">Full Name</span>
                      <p className="text-sm font-bold text-stone-900 mt-0.5">{currentUser.name}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] font-extrabold uppercase text-stone-400">Craft Specialization</span>
                      <p className="text-sm font-bold text-amber-800 mt-0.5">
                        {currentUser.craftCategory || currentUser.craft_type || 'Traditional Crafts'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] font-extrabold uppercase text-stone-400">Workshop Location</span>
                      <p className="text-sm font-bold text-stone-900 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        {currentUser.location || currentUser.state || 'India'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] font-extrabold uppercase text-stone-400">Contact Phone</span>
                      <p className="text-sm font-bold text-stone-900 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-amber-700" />
                        {currentUser.phone || 'Not provided'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 sm:col-span-2">
                      <span className="text-[10px] font-extrabold uppercase text-stone-400">Registered Email</span>
                      <p className="text-sm font-bold text-stone-900 mt-0.5 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-amber-700" />
                        {currentUser.email}
                      </p>
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
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-black text-base text-stone-900">Edit Handicraft Product</h4>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2.5 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.publishedPrice}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, publishedPrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 border border-stone-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Available Stock</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock || 1}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    }
                    className="w-full p-2.5 border border-stone-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full p-2.5 border border-stone-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Material</label>
                  <input
                    type="text"
                    value={editingProduct.material}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, material: e.target.value })
                    }
                    className="w-full p-2.5 border border-stone-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full p-2.5 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
