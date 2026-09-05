import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../services/database';
import { Artisan, Product, Order, User, B2BRequirement, B2BProposal, OrderStatus, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Shield,
  CheckCircle,
  XCircle,
  Users,
  ShoppingBag,
  Package,
  TrendingUp,
  AlertCircle,
  Eye,
  Trash2,
  MapPin,
  Briefcase,
  Layers,
  FileText,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  DollarSign,
  BarChart3,
  Search,
  Filter,
  ArrowRight,
  Download,
  Plus,
  Send,
  ExternalLink,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Check
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, switchRole, logout } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Ensure role is admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      switchRole('admin');
    }
  }, [currentUser?.role]);

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'users'
    | 'artisans'
    | 'customers'
    | 'buyers'
    | 'products'
    | 'orders'
    | 'categories'
    | 'verification'
    | 'b2b-reqs'
    | 'proposals'
    | 'reports'
    | 'analytics'
    | 'notifications'
    | 'settings'
  >('dashboard');

  const [artisans, setArtisans] = useState<Artisan[]>(() => db.getArtisans());
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => db.getOrders());
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [b2bReqs, setB2BReqs] = useState<B2BRequirement[]>(() => db.getB2BRequirements());
  const [proposals, setProposals] = useState<B2BProposal[]>(() => db.getB2BProposals());

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  // Broadcast Notification Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRole, setBroadcastRole] = useState<'all' | UserRole>('all');

  // Category Addition Form
  const [customCategories, setCustomCategories] = useState<string[]>([
    'Bamboo & Cane',
    'Pottery & Terracotta',
    'Textiles & Handloom',
    'Woodwork & Wooden Toys',
    'Paintings & Folk Art',
    'Metalcraft & Brass'
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Settings Toggles
  const [systemSettings, setSystemSettings] = useState({
    aiBackgroundEngine: true,
    voiceTranslationPipeline: true,
    fairTradeGuardrails: true,
    kycPreScreening: true,
    whatsappAlerts: true
  });

  const loadData = () => {
    setArtisans(db.getArtisans());
    setProducts(db.getProducts());
    setOrders(db.getOrders());
    setUsers(db.getUsers());
    setB2BReqs(db.getB2BRequirements());
    setProposals(db.getB2BProposals());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('all', loadData);
    return unsub;
  }, []);

  // Admin Action 1: VERIFY ARTISAN
  const handleVerifyArtisan = (artisanId: string, name: string) => {
    const updated = db.updateArtisanVerification(artisanId, 'verified');
    if (updated) {
      showToast(
        'Artisan Verified! ✓',
        `${name} has been certified as a Verified Master Artisan.`,
        'success'
      );
      loadData();
    }
  };

  // Admin Action 2: REJECT ARTISAN
  const handleRejectArtisan = (artisanId: string, name: string) => {
    const updated = db.updateArtisanVerification(artisanId, 'rejected');
    if (updated) {
      showToast(
        'Artisan Status Updated',
        `${name}'s verification status marked as Rejected.`,
        'warning'
      );
      loadData();
    }
  };

  // Admin Action 3: APPROVE PRODUCT
  const handleApproveProduct = (productId: string, name: string) => {
    db.updateProduct(productId, { status: 'active' });
    showToast('Product Approved', `"${name}" is active on the marketplace.`, 'success');
    loadData();
  };

  // Admin Action 4: REMOVE PRODUCT
  const handleRemoveProduct = (productId: string, name: string) => {
    if (window.confirm(`Admin Action: Remove "${name}" from platform?`)) {
      db.deleteProduct(productId);
      showToast('Product Removed', `"${name}" removed from platform.`, 'info');
      loadData();
    }
  };

  // Admin Action 5: UPDATE ORDER STATUS
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    db.updateOrderStatus(orderId, newStatus);
    showToast('Order Status Updated 📦', `Order #${orderId} marked as ${newStatus.toUpperCase()}.`, 'success');
    loadData();
  };

  // Admin Action 6: EXPORT AUDIT JSON
  const handleExportAuditJSON = () => {
    const auditData = {
      platform: 'KalaConnect AI',
      exportedAt: new Date().toISOString(),
      summary: {
        totalArtisans: artisans.length,
        verifiedArtisans: artisans.filter((a) => a.verificationStatus === 'verified').length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        b2bRequirements: b2bReqs.length,
        b2bProposals: proposals.length
      },
      artisans: artisans.map((a) => ({
        id: a.id,
        name: a.name,
        craftName: a.craftName,
        state: a.state,
        verificationStatus: a.verificationStatus,
        totalSales: a.totalSales
      })),
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        artisan: p.artisanName,
        category: p.category,
        price: p.publishedPrice || (p as any).price || 0,
        status: p.status
      })),
      orders: orders.map((o) => ({
        id: o.id,
        customer: o.customerName || (o as any).shippingAddress?.name || 'Customer',
        total: o.total,
        status: o.status,
        createdAt: o.createdAt
      }))
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kalaconnect_audit_report_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Report Downloaded! 📥', 'Comprehensive audit report saved to your device.', 'success');
  };

  // Admin Action 7: EXPORT AUDIT CSV
  const handleExportAuditCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Order ID,Customer,Amount (INR),Status,Date\n';
    orders.forEach((o) => {
      const cust = (o.customerName || (o as any).shippingAddress?.name || 'Customer').replace(/,/g, ' ');
      csvContent += `${o.id},"${cust}",${o.total},${o.status},"${o.createdAt}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kalaconnect_orders_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Downloaded! 📊', 'Orders audit CSV file generated successfully.', 'success');
  };

  // Admin Action 8: SEND BROADCAST
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('Incomplete Announcement', 'Please enter a title and message.', 'warning');
      return;
    }
    const targetUsers = users.filter((u) => broadcastRole === 'all' || u.role === broadcastRole);
    targetUsers.forEach((u) => {
      db.addNotification({
        userId: u.id,
        role: u.role,
        title: `📢 ${broadcastTitle}`,
        message: broadcastMessage,
        type: 'system',
        read: false,
        link: u.role === 'artisan' ? '/artisan/dashboard' : u.role === 'b2b_buyer' ? '/b2b' : '/customer/dashboard'
      });
    });
    showToast('Announcement Dispatched! 📢', `Broadcast delivered to ${targetUsers.length} active platform users.`, 'success');
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  // Admin Action 9: ADD CATEGORY
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    if (customCategories.includes(newCategoryInput.trim())) {
      showToast('Category Exists', 'This craft cluster is already registered.', 'info');
      return;
    }
    setCustomCategories([...customCategories, newCategoryInput.trim()]);
    showToast('Category Added! ✨', `"${newCategoryInput.trim()}" added to active craft clusters.`, 'success');
    setNewCategoryInput('');
  };

  // 8 Statistics KPIs
  const registeredArtisansCount = artisans.length;
  const productsCount = products.length;
  const customersCount = users.filter((u) => u.role === 'customer').length || 1;
  const b2bBuyersCount = users.filter((u) => u.role === 'b2b_buyer').length || 1;
  const ordersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingVerificationCount = artisans.filter((a) => a.verificationStatus === 'pending').length;
  const activeB2BReqsCount = b2bReqs.length;

  const pendingArtisans = artisans.filter((a) => a.verificationStatus === 'pending');
  const verifiedArtisans = artisans.filter((a) => a.verificationStatus === 'verified');

  // Filtered views
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      searchQuery === '' ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.state && u.state.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const filteredArtisans = artisans.filter((a) => {
    const matchesVerification = verificationFilter === 'all' || a.verificationStatus === verificationFilter;
    const matchesSearch =
      searchQuery === '' ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.craftName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVerification && matchesSearch;
  });

  const filteredProducts = products.filter((p) => {
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artisanName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const custName = o.customerName || (o as any).shippingAddress?.name || '';
    const matchesSearch =
      searchQuery === '' ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* ===================================================================
            SIDEBAR (All 15 Tabs Functional)
           =================================================================== */}
        <aside className="lg:col-span-1 bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-500 font-extrabold flex items-center justify-center border border-amber-500/40">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-stone-900 truncate">
                Admin Console
              </h3>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                Super Admin
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold text-stone-700">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'users', label: `Users (${users.length})`, icon: Users },
              { id: 'artisans', label: `Artisans (${artisans.length})`, icon: Users },
              { id: 'customers', label: `Customers (${customersCount})`, icon: ShoppingBag },
              { id: 'buyers', label: `Business Buyers (${b2bBuyersCount})`, icon: Briefcase },
              { id: 'products', label: `Products (${products.length})`, icon: ShoppingBag },
              { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
              { id: 'categories', label: 'Categories', icon: Layers },
              { id: 'verification', label: `Artisan Audit (${pendingVerificationCount})`, icon: Shield, badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined },
              { id: 'b2b-reqs', label: `B2B Requests (${b2bReqs.length})`, icon: Briefcase },
              { id: 'proposals', label: `Proposals (${proposals.length})`, icon: FileText },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'notifications', label: 'Announcements', icon: Bell },
              { id: 'settings', label: 'Settings', icon: Settings },
              {
                id: 'logout',
                label: 'Logout',
                icon: LogOut,
                action: () => {
                  logout();
                  navigate('/login');
                }
              }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveTab(item.id as any);
                      setSearchQuery('');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white font-bold shadow-sm'
                      : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-stone-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ===================================================================
            MAIN CONTENT AREA
           =================================================================== */}
        <main className="lg:col-span-4 space-y-8">
          
          {/* Top Admin Banner */}
          <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-900/60 px-3 py-1 rounded-full border border-amber-700 inline-block">
                Master Administration Console
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, Vikramaditya / Platform Governance
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                Live artisan certification, AI catalog moderation, multi-cluster oversight, and direct fair-trade compliance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportAuditJSON}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Download JSON Platform Audit"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT JSON</span>
              </button>
              <button
                onClick={handleExportAuditCSV}
                className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Download CSV Orders Report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT CSV</span>
              </button>
            </div>
          </div>

          {/* TAB 1: DASHBOARD / OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* 8 Statistics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('artisans')}
                  className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-1 cursor-pointer hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Total Artisans</span>
                    <Users className="w-4 h-4 text-amber-700" />
                  </div>
                  <p className="text-2xl font-extrabold text-stone-900">{registeredArtisansCount}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">{verifiedArtisans.length} verified</p>
                </div>

                <div
                  onClick={() => setActiveTab('products')}
                  className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-1 cursor-pointer hover:border-purple-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Products Listed</span>
                    <ShoppingBag className="w-4 h-4 text-purple-700" />
                  </div>
                  <p className="text-2xl font-extrabold text-stone-900">{productsCount}</p>
                  <p className="text-[10px] text-purple-600">Active catalog items</p>
                </div>

                <div
                  onClick={() => setActiveTab('customers')}
                  className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-1 cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Total Customers</span>
                    <Users className="w-4 h-4 text-blue-700" />
                  </div>
                  <p className="text-2xl font-extrabold text-stone-900">{customersCount}</p>
                  <p className="text-[10px] text-blue-600">Conscious consumers</p>
                </div>

                <div
                  onClick={() => setActiveTab('buyers')}
                  className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-1 cursor-pointer hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">B2B Buyers</span>
                    <Briefcase className="w-4 h-4 text-amber-700" />
                  </div>
                  <p className="text-2xl font-extrabold text-stone-900">{b2bBuyersCount}</p>
                  <p className="text-[10px] text-amber-600">Corporate & retail</p>
                </div>

                <div
                  onClick={() => setActiveTab('orders')}
                  className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-1 cursor-pointer hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Total Orders</span>
                    <Package className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="text-2xl font-extrabold text-stone-900">{ordersCount}</p>
                  <p className="text-[10px] text-emerald-600">Fulfilled & pending</p>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="text-2xl font-extrabold text-stone-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-emerald-600">100% direct artisan pay</p>
                </div>

                <div
                  onClick={() => setActiveTab('verification')}
                  className="bg-white p-4 rounded-3xl border border-amber-300 shadow-sm space-y-1 bg-amber-50/40 cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-900 uppercase">Pending Verif.</span>
                    <Shield className="w-4 h-4 text-amber-700" />
                  </div>
                  <p className="text-2xl font-extrabold text-amber-950">{pendingVerificationCount}</p>
                  <p className="text-[10px] text-amber-800 font-bold">Action required</p>
                </div>

                <div
                  onClick={() => setActiveTab('b2b-reqs')}
                  className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-1 cursor-pointer hover:border-purple-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Active B2B Reqs</span>
                    <TrendingUp className="w-4 h-4 text-purple-700" />
                  </div>
                  <p className="text-2xl font-extrabold text-stone-900">{activeB2BReqsCount}</p>
                  <p className="text-[10px] text-purple-600">Institutional tenders</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <button
                    onClick={() => setActiveTab('verification')}
                    className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors flex flex-col justify-between cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-amber-700 mb-2" />
                    <span className="text-xs font-bold text-stone-900 block">Verify Artisans</span>
                    <span className="text-[10px] text-stone-500">{pendingVerificationCount} pending</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('products')}
                    className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-colors flex flex-col justify-between cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-purple-700 mb-2" />
                    <span className="text-xs font-bold text-stone-900 block">Review Products</span>
                    <span className="text-[10px] text-stone-500">{products.length} cataloged</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors flex flex-col justify-between cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-emerald-700 mb-2" />
                    <span className="text-xs font-bold text-stone-900 block">View Orders</span>
                    <span className="text-[10px] text-stone-500">{orders.length} orders</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('categories')}
                    className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-colors flex flex-col justify-between cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-blue-700 mb-2" />
                    <span className="text-xs font-bold text-stone-900 block">Categories</span>
                    <span className="text-[10px] text-stone-500">{customCategories.length} craft clusters</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-left transition-colors flex flex-col justify-between cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-orange-700 mb-2" />
                    <span className="text-xs font-bold text-stone-900 block">Announcements</span>
                    <span className="text-[10px] text-stone-500">Broadcast alert</span>
                  </button>

                  <button
                    onClick={handleExportAuditJSON}
                    className="p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-left transition-colors flex flex-col justify-between cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-stone-700 mb-2" />
                    <span className="text-xs font-bold text-stone-900 block">Audit Export</span>
                    <span className="text-[10px] text-stone-500">JSON & CSV</span>
                  </button>
                </div>
              </div>

              {/* Pending Artisan Verifications */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <h3 className="font-extrabold text-base text-stone-900">
                      Pending Artisan Verifications ({pendingArtisans.length})
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500">Artisan Lineage & Authenticity Audit</span>
                </div>

                {pendingArtisans.length === 0 ? (
                  <div className="p-8 text-center text-stone-400 text-xs flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <span className="font-semibold text-stone-600">All artisan applications are fully audited and verified!</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingArtisans.map((artisan) => (
                      <div
                        key={artisan.id}
                        className="p-5 rounded-2xl border border-stone-200 bg-amber-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          {artisan.avatarUrl ? (
                            <img
                              src={artisan.avatarUrl}
                              alt={artisan.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-amber-300 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-stone-800 text-white flex items-center justify-center font-bold text-lg border border-amber-300 flex-shrink-0">
                              {artisan.name ? artisan.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-stone-900">{artisan.name}</h4>
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                Pending Review
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-amber-900 mt-0.5">{artisan.craftName} ({artisan.craftCategory})</p>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {artisan.village}, {artisan.state} • {artisan.experienceYears} Years Heritage
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-0 border-stone-200">
                          <button
                            onClick={() => handleVerifyArtisan(artisan.id, artisan.name)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>✓ VERIFY ARTISAN</span>
                          </button>
                          <button
                            onClick={() => handleRejectArtisan(artisan.id, artisan.name)}
                            className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>REJECT</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Platform Orders Table */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="font-extrabold text-base text-stone-900">Recent Platform Transactions</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    View All ({orders.length}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px]">
                        <th className="pb-3 font-bold">Order ID</th>
                        <th className="pb-3 font-bold">Buyer</th>
                        <th className="pb-3 font-bold">Items</th>
                        <th className="pb-3 font-bold">Amount</th>
                        <th className="pb-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.slice(0, 5).map((order) => {
                        const buyerName = order.customerName || (order as any).shippingAddress?.name || 'Customer';
                        return (
                          <tr key={order.id} className="hover:bg-stone-50/60">
                            <td className="py-3 font-bold text-stone-900">#{order.id}</td>
                            <td className="py-3 text-stone-700 font-medium">{buyerName}</td>
                            <td className="py-3 text-stone-500">{order.items.length} craft item(s)</td>
                            <td className="py-3 font-extrabold text-stone-900">₹{order.total.toLocaleString('en-IN')}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Platform User Directory</h3>
                  <p className="text-xs text-stone-500">Manage all registered artisans, customers, and corporate buyers</p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                  {(['all', 'artisan', 'customer', 'b2b_buyer', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        userRoleFilter === role
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
                      }`}
                    >
                      {role === 'all' ? `All (${users.length})` : role === 'b2b_buyer' ? 'B2B Buyers' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name, email, or state..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs focus:outline-none focus:border-amber-700 bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 flex items-start gap-3.5">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-300 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-700 to-stone-800 text-white flex items-center justify-center font-bold text-sm border border-stone-300 flex-shrink-0">
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-stone-900 truncate">{u.name}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'artisan'
                            ? 'bg-amber-100 text-amber-900'
                            : u.role === 'b2b_buyer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-stone-400" /> {u.email}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" /> {u.district ? `${u.district}, ` : ''}{u.state || 'India'}
                      </p>
                      {u.phone && (
                        <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" /> {u.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ARTISANS DIRECTORY & STORE ACCESS */}
          {activeTab === 'artisans' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Artisan Master Directory</h3>
                  <p className="text-xs text-stone-500">Direct links to storefronts, verification badges, and craft profiles</p>
                </div>
                <div className="flex gap-1.5 text-xs font-bold">
                  {(['all', 'verified', 'pending', 'rejected'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setVerificationFilter(status)}
                      className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        verificationFilter === status
                          ? 'bg-amber-700 text-white border-amber-700'
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
                      }`}
                    >
                      {status === 'all' ? `All (${artisans.length})` : status === 'verified' ? 'Verified (✓)' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artisans by name, craft, or state..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs focus:outline-none focus:border-amber-700 bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArtisans.map((artisan) => (
                  <div key={artisan.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3">
                    <div className="flex items-start gap-4">
                      {artisan.avatarUrl ? (
                        <img
                          src={artisan.avatarUrl}
                          alt={artisan.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-amber-300 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-stone-800 text-white flex items-center justify-center font-bold text-lg border border-amber-300 flex-shrink-0">
                          {artisan.name ? artisan.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-stone-900">{artisan.name}</h4>
                          {artisan.verificationStatus === 'verified' ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> ✓ VERIFIED
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-amber-900 mt-0.5">{artisan.craftName}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {artisan.village}, {artisan.state} • {artisan.experienceYears} Years Heritage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/80">
                      <Link
                        to={`/artisan/store/${artisan.id}`}
                        className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Storefront</span>
                      </Link>

                      <div className="flex items-center gap-1.5">
                        {artisan.verificationStatus !== 'verified' ? (
                          <button
                            onClick={() => handleVerifyArtisan(artisan.id, artisan.name)}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRejectArtisan(artisan.id, artisan.name)}
                            className="px-3 py-1 rounded-xl bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-700 font-bold text-xs cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMERS DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Customer Directory</h3>
                  <p className="text-xs text-stone-500">Retail conscious consumers purchasing directly from master artisans</p>
                </div>
                <span className="text-xs font-bold bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
                  {users.filter((u) => u.role === 'customer').length} Active Customers
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.filter((u) => u.role === 'customer').map((customer) => {
                  const custOrders = orders.filter((o) => o.customerId === customer.id);
                  const custSpent = custOrders.reduce((sum, o) => sum + o.total, 0);
                  return (
                    <div key={customer.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 flex items-start gap-4">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-300 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-stone-800 to-amber-800 text-white flex items-center justify-center font-bold text-sm border border-stone-300 flex-shrink-0">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-stone-900">{customer.name}</h4>
                        <p className="text-xs text-stone-500 mt-0.5">{customer.email}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{customer.district || customer.state || 'India'}</p>
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-stone-200/60 text-[11px] font-semibold text-stone-700">
                          <span>{custOrders.length} Order(s)</span>
                          <span>•</span>
                          <span className="font-bold text-emerald-700">₹{custSpent.toLocaleString('en-IN')} Spent</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: B2B BUYERS DIRECTORY */}
          {activeTab === 'buyers' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Institutional & B2B Buyer Directory</h3>
                  <p className="text-xs text-stone-500">Corporate partners, luxury brands, and institutional procurement teams</p>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  {users.filter((u) => u.role === 'b2b_buyer').length} Enterprise Buyers
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.filter((u) => u.role === 'b2b_buyer').map((buyer) => {
                  const reqCount = b2bReqs.filter((r) => r.buyerId === buyer.id).length;
                  return (
                    <div key={buyer.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3">
                      <div className="flex items-start gap-4">
                        {buyer.avatar ? (
                          <img
                            src={buyer.avatar}
                            alt={buyer.name}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-300 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-stone-900 text-white flex items-center justify-center font-bold text-sm border border-stone-300 flex-shrink-0">
                            {buyer.name ? buyer.name.charAt(0).toUpperCase() : 'B'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-stone-900">{buyer.name}</h4>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Verified Enterprise
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{buyer.email}</p>
                          <p className="text-[11px] text-stone-500 mt-0.5">{buyer.state || 'New Delhi, India'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 text-xs font-semibold text-stone-700">
                        <span>{reqCount} Bulk Tenders Posted</span>
                        <Link to="/b2b" className="text-amber-800 hover:underline font-bold">
                          View B2B Hub →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: PRODUCTS MODERATION */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Platform Product Moderation</h3>
                  <p className="text-xs text-stone-500">Audit AI-enhanced listings, prices, and active craft items</p>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                  {products.length} Products Cataloged
                </span>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by product name or artisan..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs focus:outline-none focus:border-amber-700 bg-stone-50"
                  />
                </div>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-2xl border border-stone-200 text-xs font-semibold bg-stone-50 text-stone-700 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {customCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {filteredProducts.map((prod) => {
                  const displayPrice = prod.publishedPrice || (prod as any).price || 0;
                  const displayImg = prod.image || (prod as any).images?.[0] || '';
                  return (
                    <div
                      key={prod.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={displayImg}
                          alt={prod.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-stone-200 flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-stone-900">{prod.name}</h4>
                          <p className="text-xs text-amber-800 font-semibold">{prod.artisanName} • {prod.category}</p>
                          <p className="text-xs font-extrabold text-stone-900 mt-1">₹{displayPrice.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Link
                          to={`/marketplace/product/${prod.id}`}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                        <button
                          onClick={() => handleApproveProduct(prod.id, prod.name)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRemoveProduct(prod.id, prod.name)}
                          className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Platform Order Management</h3>
                  <p className="text-xs text-stone-500">Live order status fulfillment, tracking codes, and customer transactions</p>
                </div>
                <div className="flex flex-wrap gap-1 text-xs font-bold">
                  {(['all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
                      }`}
                    >
                      {st === 'all' ? `All (${orders.length})` : st.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders by Order ID or Customer Name..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs focus:outline-none focus:border-amber-700 bg-stone-50"
                />
              </div>

              <div className="space-y-3">
                {filteredOrders.map((ord) => {
                  const buyerName = ord.customerName || (ord as any).shippingAddress?.name || 'Customer';
                  const buyerCity = ord.city || (ord as any).shippingAddress?.city || 'India';
                  return (
                    <div key={ord.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-800">Order #{ord.id}</span>
                          <span className="text-[11px] text-stone-400">Tracking: {ord.trackingNumber}</span>
                        </div>
                        <p className="font-bold text-sm text-stone-900">{buyerName} ({buyerCity})</p>
                        <p className="text-xs text-stone-500">
                          Items: {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto">
                        <div className="text-right mr-2">
                          <span className="text-base font-extrabold text-stone-900 block">₹{ord.total.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-stone-400">{ord.paymentMethod || 'Online'}</span>
                        </div>

                        {/* Status dropdown */}
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-800 shadow-2xs cursor-pointer focus:outline-none focus:border-amber-700"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">In Production</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: CATEGORIES & CLUSTERS */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Craft Clusters & Geographic Categories</h3>
                  <p className="text-xs text-stone-500">Manage craft clusters supported across Indian states</p>
                </div>
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="Enter new craft cluster name (e.g. Dokra Metalcasting, Blue Pottery)..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-200 text-xs focus:outline-none focus:border-amber-700 bg-stone-50 font-medium"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </form>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {customCategories.map((cat, idx) => {
                  const pCount = products.filter((p) => p.category === cat).length;
                  return (
                    <div key={idx} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900">{cat}</span>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-[11px] text-stone-500">{pCount} catalog items listed</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 9: ARTISAN VERIFICATION AUDIT */}
          {activeTab === 'verification' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="pb-4 border-b border-stone-100">
                <h3 className="font-extrabold text-lg text-stone-900">Artisan Authenticity & Verification Audit</h3>
                <p className="text-xs text-stone-500">Review lineage, village origin, and award the official "✓ VERIFIED ARTISAN" badge</p>
              </div>

              <div className="space-y-4">
                {artisans.map((artisan) => (
                  <div
                    key={artisan.id}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {artisan.avatarUrl ? (
                        <img
                          src={artisan.avatarUrl}
                          alt={artisan.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-stone-300 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-stone-800 text-white flex items-center justify-center font-bold text-lg border border-stone-300 flex-shrink-0">
                          {artisan.name ? artisan.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-stone-900">{artisan.name}</h4>
                          {artisan.verificationStatus === 'verified' ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>✓ VERIFIED ARTISAN</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              Pending Review
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-amber-900 mt-0.5">{artisan.craftName} ({artisan.craftCategory})</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {artisan.village}, {artisan.state} • {artisan.experienceYears} Years Heritage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {artisan.verificationStatus !== 'verified' && (
                        <button
                          onClick={() => handleVerifyArtisan(artisan.id, artisan.name)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Verify</span>
                        </button>
                      )}
                      {artisan.verificationStatus !== 'rejected' && (
                        <button
                          onClick={() => handleRejectArtisan(artisan.id, artisan.name)}
                          className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: B2B REQUIREMENTS OVERSIGHT */}
          {activeTab === 'b2b-reqs' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">B2B Bulk Procurement Tenders</h3>
                  <p className="text-xs text-stone-500">Corporate requirements posted by verified enterprise buyers</p>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  {b2bReqs.length} Active Tenders
                </span>
              </div>

              <div className="space-y-3">
                {b2bReqs.map((req) => (
                  <div key={req.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md">
                        {req.category}
                      </span>
                      <span className="font-extrabold text-emerald-700 text-sm">₹{req.budget.toLocaleString('en-IN')} Budget</span>
                    </div>
                    <p className="text-xs font-bold text-stone-900">{req.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 pt-1">
                      <span>Buyer: <strong>{req.buyerCompany}</strong></span>
                      <span>•</span>
                      <span>Qty: <strong>{req.requiredQuantity} units</strong></span>
                      <span>•</span>
                      <span>Delivery: {req.deliveryLocation}</span>
                      <span>•</span>
                      <span>Required By: {req.requiredDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: B2B PROPOSALS & QUOTES */}
          {activeTab === 'proposals' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Artisan Wholesale Proposals</h3>
                  <p className="text-xs text-stone-500">Quotes and lead times submitted by artisans to corporate buyers</p>
                </div>
                <span className="text-xs font-bold bg-purple-100 text-purple-900 px-3 py-1 rounded-full">
                  {proposals.length} Proposals
                </span>
              </div>

              <div className="space-y-3">
                {proposals.map((prop) => (
                  <div key={prop.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">{prop.artisanName}</span>
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          {prop.craft}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-700">
                        ₹{prop.proposedPricePerUnit} / unit ({prop.proposedLeadDays} days lead)
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200/70">
                      "{prop.message}"
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                      <span>Requirement: #{prop.requirementId}</span>
                      <span className="font-bold uppercase text-stone-700 bg-stone-200 px-2 py-0.5 rounded-full">
                        {prop.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12 & 13: REPORTS & ANALYTICS */}
          {(activeTab === 'reports' || activeTab === 'analytics') && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Platform Growth & Impact Metrics</h3>
                  <p className="text-xs text-stone-500">Economic and operational metrics verified across all rural craft hubs</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportAuditJSON}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={handleExportAuditCSV}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-amber-900 font-bold uppercase text-[10px]">Artisan Income Growth</span>
                  <p className="text-3xl font-extrabold text-amber-950">+240%</p>
                  <p className="text-[11px] text-amber-800">Average artisan earnings via KalaConnect AI</p>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-emerald-900 font-bold uppercase text-[10px]">Direct Margin Retained</span>
                  <p className="text-3xl font-extrabold text-emerald-950">92%</p>
                  <p className="text-[11px] text-emerald-800">Direct artisan payments with zero middleman markup</p>
                </div>
                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                  <span className="text-purple-900 font-bold uppercase text-[10px]">AI Studio Catalog Speed</span>
                  <p className="text-3xl font-extrabold text-purple-950">4.2 min</p>
                  <p className="text-[11px] text-purple-800">From voice photo to live market catalog listing</p>
                </div>
              </div>

              {/* Regional breakdown table */}
              <div className="pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400 mb-3">Regional Craft Distribution</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px]">
                        <th className="pb-2 font-bold">State / Region</th>
                        <th className="pb-2 font-bold">Craft Specialty</th>
                        <th className="pb-2 font-bold">Artisan Clusters</th>
                        <th className="pb-2 font-bold">Volume Retained</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {[
                        { state: 'Andhra Pradesh', craft: 'Kondapalli Toys & Bamboo', clusters: 'Krishna & Godavari', volume: '₹3,40,000' },
                        { state: 'Bihar', craft: 'Madhubani & Mithila Folk Art', clusters: 'Madhubani Hub', volume: '₹2,10,000' },
                        { state: 'West Bengal', craft: 'Bankura Terracotta Pottery', clusters: 'Bishnupur & Bankura', volume: '₹1,95,000' },
                        { state: 'Kashmir', craft: 'Pashmina Handloom Weaving', clusters: 'Srinagar Craft Colony', volume: '₹4,80,000' },
                        { state: 'Chhattisgarh', craft: 'Dhokra Lost-Wax Bell Metal', clusters: 'Bastar Tribal Collective', volume: '₹1,75,000' }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="py-2.5 font-bold text-stone-900">{row.state}</td>
                          <td className="py-2.5 text-stone-700">{row.craft}</td>
                          <td className="py-2.5 text-stone-500">{row.clusters}</td>
                          <td className="py-2.5 font-bold text-emerald-700">{row.volume}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: ANNOUNCEMENTS & NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="pb-4 border-b border-stone-100">
                <h3 className="font-extrabold text-lg text-stone-900">Broadcast Platform Announcements</h3>
                <p className="text-xs text-stone-500">Dispatch live updates, policy notifications, and market tips to all users</p>
              </div>

              <form onSubmit={handleSendBroadcast} className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-stone-700">Announcement Title:</label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. New Festive Bulk Procurement Drive Opened"
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white focus:outline-none focus:border-amber-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Target Audience:</label>
                    <select
                      value={broadcastRole}
                      onChange={(e) => setBroadcastRole(e.target.value as any)}
                      className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white font-semibold text-stone-800 focus:outline-none focus:border-amber-700"
                    >
                      <option value="all">All Platform Users</option>
                      <option value="artisan">Artisans Only</option>
                      <option value="b2b_buyer">B2B Buyers Only</option>
                      <option value="customer">Customers Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Message Body:</label>
                  <textarea
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Enter announcement details for artisans and buyers..."
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white focus:outline-none focus:border-amber-700"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast Notification</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 15: SETTINGS & GOVERNANCE */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">Platform Governance & Engine Settings</h3>
                  <p className="text-xs text-stone-500">Fine-tune AI thresholds, speech pipelines, and verification protocols</p>
                </div>
                <button
                  onClick={() => {
                    showToast('Settings Saved ✓', 'Platform configurations updated successfully.', 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'aiBackgroundEngine',
                    title: 'AI Background Replacement & Studio Synthesis Engine',
                    desc: 'Automatically replaces messy room walls and surfaces with photorealistic craft studios.'
                  },
                  {
                    key: 'voiceTranslationPipeline',
                    title: 'Multilingual Telugu-to-English Speech Pipeline',
                    desc: 'Enables Web Speech API voice capture and strictly enforces non-hallucination rules.'
                  },
                  {
                    key: 'fairTradeGuardrails',
                    title: 'Fair-Trade Pricing Recommendation Engine',
                    desc: 'Calculates Minimum, Recommended, and Premium margins ensuring 100% direct artisan compensation.'
                  },
                  {
                    key: 'kycPreScreening',
                    title: 'Automated Artisan Identity Pre-Screening',
                    desc: 'Checks artisan location, experience, and photo metadata before submission.'
                  },
                  {
                    key: 'whatsappAlerts',
                    title: 'Direct WhatsApp & SMS Dispatch Alerts',
                    desc: 'Alerts artisans directly on their mobile device when an order or B2B quote is received.'
                  }
                ].map((item) => {
                  const isEnabled = (systemSettings as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-sm text-stone-900">{item.title}</h5>
                        <p className="text-xs text-stone-500">{item.desc}</p>
                      </div>

                      <button
                        onClick={() => {
                          setSystemSettings({
                            ...systemSettings,
                            [item.key]: !isEnabled
                          });
                          showToast('Setting Updated', `${item.title} is now ${!isEnabled ? 'Enabled' : 'Disabled'}.`, 'info');
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isEnabled
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isEnabled ? 'Enabled ✓' : 'Disabled'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
