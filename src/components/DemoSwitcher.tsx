import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/database';
import { useNotifications } from '../context/NotificationContext';
import { UserRole } from '../types';
import { Sparkles, RotateCcw, Shield, ShoppingBag, Palette, Briefcase, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoSwitcher: React.FC = () => {
  const { currentUser, switchRole } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const handleResetData = () => {
    if (window.confirm('Reset KalaConnect AI database to clean initial state? All mock orders and edits will reset.')) {
      db.resetToDemoData();
      showToast('Data Reset Complete! 🔄', 'Restored 10 verified artisans, 20 craft products, orders & B2B requests.', 'info');
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    showToast(
      'Persona Switched! ✨',
      `Now browsing as ${role.toUpperCase()}: ${
        role === 'artisan'
          ? 'Kalyani Devi (Artisan)'
          : role === 'customer'
          ? 'Priya Sharma (Customer)'
          : role === 'b2b_buyer'
          ? 'Rajesh Mehta (FabIndia)'
          : 'Vikramaditya (Admin)'
      }`,
      'info'
    );

    // Redirect to relevant dashboard
    if (role === 'artisan') navigate('/artisan/dashboard');
    else if (role === 'customer') navigate('/marketplace');
    else if (role === 'b2b_buyer') navigate('/b2b');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <div className="bg-stone-900 text-stone-200 text-xs py-2 px-3 sm:px-6 flex flex-wrap items-center justify-between border-b border-stone-800 shadow-inner z-50">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Persona Switcher:</span>
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
            title="Switch to Artisan (Kalyani Devi)"
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
            title="Switch to Customer (Priya Sharma)"
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
            title="Switch to B2B Buyer (FabIndia Sourcing)"
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
            title="Switch to Admin (Platform Evaluator)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Current Active Persona Info */}
        <span className="hidden md:inline-flex text-stone-400 items-center gap-1">
          Active: <strong className="text-stone-200">{currentUser?.name || 'Guest'}</strong>
          <span className="text-stone-500">({currentUser?.email})</span>
        </span>
      </div>

      {/* Language Toggle & Reset */}
      <div className="flex items-center gap-3 mt-1 sm:mt-0">
        <div className="flex items-center gap-1.5 bg-stone-800/80 px-2 py-1 rounded border border-stone-700">
          <Globe className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-stone-200 font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="en" className="bg-stone-800 text-white">English</option>
            <option value="te" className="bg-stone-800 text-white">తెలుగు (Telugu)</option>
          </select>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-1 text-stone-400 hover:text-amber-400 hover:bg-stone-800 px-2 py-1 rounded transition-colors cursor-pointer"
          title="Reset database to demo seed data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Data</span>
        </button>
      </div>
    </div>
  );
};
