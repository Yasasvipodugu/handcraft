import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { UserRole } from '../types';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Palette,
  ShoppingBag,
  Briefcase,
  Shield,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Role tab state: artisan | customer | b2b_buyer | admin
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    if (location.pathname.includes('/artisan')) return 'artisan';
    if (location.pathname.includes('/customer')) return 'customer';
    if (location.pathname.includes('/b2b') || location.pathname.includes('/buyer')) return 'b2b_buyer';
    if (location.pathname.includes('/admin')) return 'admin';
    return 'artisan';
  });

  const [email, setEmail] = useState<string>('artisan@demo.com');
  const [password, setPassword] = useState<string>('artisan123');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Update default demo credentials when switching tabs
  const handleTabChange = (role: UserRole) => {
    setActiveRole(role);
    setErrorMsg('');
    if (role === 'artisan') {
      setEmail('artisan@demo.com');
      setPassword('artisan123');
    } else if (role === 'customer') {
      setEmail('customer@demo.com');
      setPassword('customer123');
    } else if (role === 'b2b_buyer') {
      setEmail('buyer@demo.com');
      setPassword('buyer123');
    } else if (role === 'admin') {
      setEmail('admin@demo.com');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast('Welcome Back! 👋', `Logged in as ${activeRole.toUpperCase()}.`, 'success');
      if (activeRole === 'artisan') navigate('/artisan/dashboard');
      else if (activeRole === 'customer') navigate('/customer/dashboard');
      else if (activeRole === 'b2b_buyer') navigate('/b2b');
      else if (activeRole === 'admin') navigate('/admin');
    } else {
      setErrorMsg(res.message || 'Invalid credentials. Please verify or use demo accounts.');
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert(`Password reset link has been dispatched to ${email}. For instant testing, please use the demo password: ${activeRole === 'artisan' ? 'artisan123' : activeRole === 'customer' ? 'customer123' : activeRole === 'b2b_buyer' ? 'buyer123' : 'admin123'}`);
  };

  return (
    <div className="min-h-[85vh] bg-stone-50/70 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-7">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-serif text-3xl font-bold mx-auto shadow-md">
            K
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Sign In to KalaConnect AI
          </h2>
          <p className="text-xs text-stone-500">
            {activeRole === 'artisan' && 'Artisan / Seller Portal — Manage catalog, studio, and orders'}
            {activeRole === 'customer' && 'Customer Portal — Explore crafts and track shipments'}
            {activeRole === 'b2b_buyer' && 'B2B Enterprise Portal — Bulk artisan procurement & matching'}
            {activeRole === 'admin' && 'Administrator Portal — Platform governance & verification'}
          </p>
        </div>

        {/* 4 Separate User Role Tabs (Section 3) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-stone-200/80 rounded-2xl text-[11px] font-bold">
          {[
            { id: 'artisan', label: 'Artisan', icon: Palette },
            { id: 'customer', label: 'Customer', icon: ShoppingBag },
            { id: 'b2b_buyer', label: 'B2B Buyer', icon: Briefcase },
            { id: 'admin', label: 'Admin', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeRole === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as UserRole)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-700' : 'text-stone-400'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-sm text-stone-900 uppercase tracking-wider">
              {activeRole === 'artisan' && 'Artisan Login'}
              {activeRole === 'customer' && 'Customer Login'}
              {activeRole === 'b2b_buyer' && 'Business Buyer Login'}
              {activeRole === 'admin' && 'Administrator Login'}
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              Demo Ready
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Email Address:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs font-medium bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  Password:
                </label>
                <a
                  href="#forgot"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs font-medium bg-stone-50/50"
                />
              </div>
            </div>

            {/* Remember Me Checkbox (Section 6) */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-amber-700 rounded border-stone-300 accent-amber-700 cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-xs text-stone-600 font-medium cursor-pointer">
                Remember Me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration Redirect Button (Section 6, 33, 43) */}
          {activeRole !== 'admin' && (
            <div className="pt-4 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-500 mb-2">Don't have an account yet?</p>
              <Link
                to={`/register?role=${activeRole}`}
                className="inline-block w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors"
              >
                {activeRole === 'artisan' && 'Create Artisan Account'}
                {activeRole === 'customer' && 'Create Customer Account'}
                {activeRole === 'b2b_buyer' && 'Create Business Buyer Account'}
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
