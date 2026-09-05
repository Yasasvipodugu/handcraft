import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  ShoppingBag,
  Bell,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Compass,
  Briefcase,
  BarChart3,
  CheckCircle,
  Clock,
  Layers,
  Shield,
  Package,
  Globe,
  Check
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../locales/translations';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { itemCount } = useCart();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'artisan') return '/artisan/dashboard';
    if (currentUser.role === 'b2b_buyer') return '/b2b';
    if (currentUser.role === 'admin') return '/admin';
    return '/customer/dashboard';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 via-stone-800 to-amber-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <span className="font-serif text-2xl font-bold tracking-tight text-amber-300">K</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg sm:text-xl tracking-tight text-stone-900 font-sans">
                    Kala<span className="text-amber-700">Connect</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full border border-amber-300/80 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-amber-700" /> AI
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 font-medium tracking-wide">
                  Smart Cataloging & Market Linkage
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-amber-800 bg-amber-50 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              <span>{t.navHome || 'Home'}</span>
            </Link>

            {/* Unauthenticated: Home, Explore, About */}
            {!currentUser && (
              <>
                <Link
                  to="/marketplace"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/marketplace')
                      ? 'text-amber-800 bg-amber-50 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>{t.navMarketplace || 'Explore'}</span>
                </Link>

                <Link
                  to="/impact"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/impact')
                      ? 'text-amber-800 bg-amber-50 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{t.navAbout || 'About'}</span>
                </Link>
              </>
            )}

            {/* Logged in Artisan: Home, My Dashboard, My Products, AI Studio */}
            {currentUser?.role === 'artisan' && (
              <>
                <Link
                  to="/artisan/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/artisan/dashboard')
                      ? 'text-amber-800 bg-amber-50 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{t.navDashboard || 'My Dashboard'}</span>
                </Link>

                <Link
                  to="/artisan/products"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/artisan/products')
                      ? 'text-amber-800 bg-amber-50 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>My Products</span>
                </Link>

                <Link
                  to="/artisan/studio"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname.includes('/artisan/studio')
                      ? 'bg-gradient-to-r from-amber-700 to-stone-800 text-white shadow-sm font-semibold'
                      : 'bg-amber-600/10 text-amber-900 hover:bg-amber-600/20 font-semibold border border-amber-300/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>{t.navStudio || 'AI Studio'}</span>
                </Link>
              </>
            )}

            {/* Logged in Customer: Home, Explore, My Profile / Orders */}
            {currentUser?.role === 'customer' && (
              <>
                <Link
                  to="/marketplace"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/marketplace')
                      ? 'text-amber-800 bg-amber-50 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>{t.navMarketplace || 'Explore'}</span>
                </Link>

                <Link
                  to="/customer/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/customer/dashboard')
                      ? 'text-amber-800 bg-amber-50 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{t.navDashboard || 'My Dashboard'}</span>
                </Link>

                <Link
                  to="/customer/orders"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/customer/orders')
                      ? 'text-amber-800 bg-amber-50 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.navOrders || 'My Orders'}</span>
                </Link>
              </>
            )}

            {currentUser?.role === 'b2b_buyer' && (
              <Link
                to="/b2b"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/b2b')
                    ? 'text-amber-800 bg-amber-50 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>{t.navB2B || 'B2B Wholesale'}</span>
              </Link>
            )}

            {currentUser?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200"
              >
                <Shield className="w-4 h-4 text-purple-700" />
                <span>{t.navAdmin || 'Admin Console'}</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons: Language, Notifications, Cart, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 🌐 Visible Language Selector Dropdown (7 Languages - NO HINDI) */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 hover:border-amber-600 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Change Language"
                aria-label="Language Selector"
              >
                <Globe className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span className="hidden sm:inline">
                  {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label.split(' ')[0] || 'English'}
                </span>
                <span className="sm:hidden uppercase text-[11px] font-extrabold">{language}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-1.5 border-b border-stone-100 text-[10px] font-black uppercase tracking-wider text-stone-400">
                    🌐 Select Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-amber-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-amber-100/80 text-amber-950 font-bold' : 'text-stone-700'
                        }`}
                      >
                        <span>{lang.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-800 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>


              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-700" />
                      <span className="font-bold text-stone-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-stone-400 text-xs">
                        No notifications right now
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markRead(notif.id);
                            if (notif.link) {
                              navigate(notif.link);
                              setNotificationsOpen(false);
                            }
                          }}
                          className={`p-3.5 hover:bg-amber-50/50 cursor-pointer transition-colors flex items-start gap-3 ${
                            !notif.read ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            {notif.type === 'order' ? (
                              <ShoppingBag className="w-4 h-4 text-emerald-600" />
                            ) : notif.type === 'verification' ? (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Briefcase className="w-4 h-4 text-amber-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-stone-900">{notif.title}</p>
                            <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-stone-400 mt-1 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Just now
                            </span>
                          </div>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-amber-600 flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full border border-stone-200 hover:border-amber-400 transition-all bg-stone-50"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-amber-600/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-semibold text-stone-800 max-w-[90px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-900 font-medium"
                    >
                      <Layers className="w-4 h-4 text-stone-400" />
                      <span>{t.navDashboard}</span>
                    </Link>

                    {currentUser.role === 'artisan' && (
                      <>
                        <Link
                          to="/artisan/products"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-900 font-medium"
                        >
                          <Compass className="w-4 h-4 text-stone-400" />
                          <span>My Products</span>
                        </Link>
                        <Link
                          to="/artisan/orders"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-900 font-medium"
                        >
                          <ShoppingBag className="w-4 h-4 text-stone-400" />
                          <span>{t.ordersReceived}</span>
                        </Link>
                      </>
                    )}

                    {currentUser.role === 'customer' && (
                      <Link
                        to="/customer/orders"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-900 font-medium"
                      >
                        <ShoppingBag className="w-4 h-4 text-stone-400" />
                        <span>{t.myOrders}</span>
                      </Link>
                    )}

                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-purple-900 bg-purple-50 hover:bg-purple-100 font-bold"
                      >
                        <Shield className="w-4 h-4 text-purple-700" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  {t.login}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-700 text-white hover:bg-amber-800 transition-colors shadow-xs"
                >
                  {t.register}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <Link
            to="/marketplace"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100"
          >
            <Compass className="w-5 h-5 text-amber-700" />
            <span>{t.navMarketplace}</span>
          </Link>

          <Link
            to="/artisan/studio"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-amber-100/70 text-amber-900 border border-amber-300/80"
          >
            <Sparkles className="w-5 h-5 text-amber-700" />
            <span>{t.navStudio} (AI Catalog)</span>
          </Link>

          <Link
            to="/b2b"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100"
          >
            <Briefcase className="w-5 h-5 text-amber-700" />
            <span>{t.navB2B}</span>
          </Link>

          <Link
            to="/impact"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-800 hover:bg-stone-100"
          >
            <BarChart3 className="w-5 h-5 text-amber-700" />
            <span>{t.ourImpact}</span>
          </Link>

          {currentUser && (
            <Link
              to={getDashboardPath()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentUser.role === 'admin'
                  ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200'
                  : 'text-stone-800 hover:bg-stone-100'
              }`}
            >
              {currentUser.role === 'admin' ? (
                <Shield className="w-5 h-5 text-purple-700" />
              ) : (
                <Layers className="w-5 h-5 text-amber-700" />
              )}
              <span>{currentUser.role === 'admin' ? 'Admin Console' : t.navDashboard}</span>
            </Link>
          )}

          {!currentUser && (
            <div className="pt-3 border-t border-stone-200 flex gap-2">
              <Link
                to="/login"
                className="flex-1 text-center py-2 rounded-lg bg-stone-100 text-stone-800 text-sm font-semibold"
              >
                {t.login}
              </Link>
              <Link
                to="/register"
                className="flex-1 text-center py-2 rounded-lg bg-amber-700 text-white text-sm font-semibold"
              >
                {t.register}
              </Link>
            </div>
          )}

          {currentUser && (
            <div className="pt-3 border-t border-stone-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({currentUser.name})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
