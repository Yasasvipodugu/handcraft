import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Palette,
  ShoppingBag,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success && res.user) {
      showToast(
        `Welcome Back, ${res.user.name}! 👋`,
        `Signed in as ${res.user.role === 'artisan' ? 'Master Artisan' : res.user.role === 'customer' ? 'Customer' : res.user.role.toUpperCase()}.`,
        'success'
      );

      // Automatic Role-based Redirection
      if (res.user.role === 'artisan') {
        navigate('/artisan/dashboard');
      } else if (res.user.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (res.user.role === 'b2b_buyer') {
        navigate('/b2b');
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(res.message || 'Invalid email or password. Please try again.');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[85vh] bg-stone-50/70 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-7">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-800 via-stone-900 to-amber-700 text-white flex items-center justify-center font-serif text-3xl font-bold mx-auto shadow-lg border border-amber-400/30">
            K
          </div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            Sign In to Kala<span className="text-amber-700">Connect</span>
          </h2>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            From Your Craft to the World. Access your artisan studio, personal catalog, and customer orders.
          </p>
        </div>

        {/* Auth Mode Toggle: Login | Sign Up */}
        <div className="bg-stone-200/70 p-1 rounded-2xl flex items-center shadow-inner">
          <button
            type="button"
            className="flex-1 py-2 text-xs font-bold rounded-xl bg-white text-stone-900 shadow-sm transition-all"
          >
            Sign In
          </button>
          <Link
            to="/register"
            className="flex-1 py-2 text-xs font-semibold rounded-xl text-stone-600 hover:text-stone-900 text-center transition-all"
          >
            Create Account (Sign Up)
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Login Failed: </span>
                {errorMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all text-stone-900 placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Tester Pills */}
          <div className="border-t border-stone-100 pt-4">
            <p className="text-[11px] font-semibold text-stone-500 mb-2.5 text-center">
              Quick Test Demo Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('artisan@demo.com', 'artisan123')}
                className="p-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <Palette className="w-3.5 h-3.5 text-amber-700" />
                  <span>Artisan Demo</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5 truncate">artisan@demo.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('customer@demo.com', 'customer123')}
                className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
                  <ShoppingBag className="w-3.5 h-3.5 text-stone-700" />
                  <span>Customer Demo</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5 truncate">customer@demo.com</div>
              </button>
            </div>
          </div>

          {/* Direct link to Sign Up */}
          <div className="text-center pt-2">
            <span className="text-xs text-stone-600">New to KalaConnect AI? </span>
            <Link
              to="/register"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 underline decoration-amber-300 underline-offset-4"
            >
              Sign up as Artisan or Customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
