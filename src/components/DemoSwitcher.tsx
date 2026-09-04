import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/database';
import { useNotifications } from '../context/NotificationContext';
import { UserRole } from '../types';
import { Sparkles, RotateCcw, Shield, ShoppingBag, Palette, Briefcase, Globe, LogOut, User, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const DemoSwitcher: React.FC = () => {
  const { currentUser, login, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Reset KalaConnect AI database to clean initial state? All mock orders and edits will reset.')) {
      db.resetToDemoData();
      showToast('Data Reset Complete! 🔄', 'Restored verified artisans, products, and sample orders.', 'info');
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      artisan: { email: 'artisan@demo.com', pass: 'artisan123' },
      customer: { email: 'customer@demo.com', pass: 'customer123' },
      b2b_buyer: { email: 'buyer@demo.com', pass: 'buyer123' },
      admin: { email: 'admin@demo.com', pass: 'admin123' }
    };
    const c = creds[role];
    const res = await login(c.email, c.pass);
    if (res.success && res.user) {
      showToast(
        'Demo Login! ✨',
        `Logged in as ${res.user.name} (${role.toUpperCase()})`,
        'info'
      );
      if (role === 'artisan') navigate('/artisan/dashboard');
      else if (role === 'customer') navigate('/customer/dashboard');
      else if (role === 'b2b_buyer') navigate('/b2b');
      else if (role === 'admin') navigate('/admin');
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-3 left-3 z-50 px-3 py-1.5 rounded-full bg-stone-900 text-amber-400 text-xs font-bold shadow-lg border border-amber-500/40 flex items-center gap-1.5 hover:bg-stone-800 transition-all cursor-pointer"
        title="Open Quick Tester Bar"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Tester Tools</span>
      </button>
    );
  }

  return (
    <div className="bg-stone-900 text-stone-200 text-xs py-2 px-3 sm:px-6 flex flex-wrap items-center justify-between border-b border-stone-800 shadow-inner z-50 gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Tester Demo Logins:</span>
        </span>

        {/* 4 Role quick buttons */}
        <div className="inline-flex rounded-lg bg-stone-800/90 p-0.5 border border-stone-700">
          <button
            onClick={() => handleRoleSelect('artisan')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
              currentUser?.role === 'artisan'
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
            }`}
            title="Login as Demo Artisan (Kalyani Devi)"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Artisan</span>
          </button>

          <button
            onClick={() => handleRoleSelect('customer')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
              currentUser?.role === 'customer'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
            }`}
            title="Login as Demo Customer (Ananya Sharma)"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => handleRoleSelect('b2b_buyer')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
              currentUser?.role === 'b2b_buyer'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
            }`}
            title="Login as B2B Buyer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>B2B Buyer</span>
          </button>

          <button
            onClick={() => handleRoleSelect('admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
              currentUser?.role === 'admin'
                ? 'bg-purple-600 text-white shadow-sm font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
            }`}
            title="Login as Admin"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Current Active User Display */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 text-[11px] text-stone-300 border border-stone-700">
          <User className="w-3 h-3 text-amber-400" />
          <span>Active: </span>
          <strong className="text-white truncate max-w-[120px]">
            {currentUser ? currentUser.name : 'Guest (Signed Out)'}
          </strong>
          {currentUser && (
            <button
              onClick={() => {
                logout();
                showToast('Signed Out', 'You have logged out.', 'info');
                navigate('/login');
              }}
              className="ml-1.5 text-rose-400 hover:text-rose-300 font-bold underline"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language selector */}
        <div className="flex items-center gap-1 bg-stone-800/90 rounded-lg p-0.5 border border-stone-700">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              language === 'en' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('te')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              language === 'te' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            తెలుగు
          </button>
        </div>

        {/* Reset Mock DB */}
        <button
          onClick={handleResetData}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors text-[11px] cursor-pointer"
          title="Reset database to initial samples"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden md:inline">Reset DB</span>
        </button>

        {/* Dismiss bar */}
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded text-stone-500 hover:text-stone-300"
          title="Minimize tester bar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
