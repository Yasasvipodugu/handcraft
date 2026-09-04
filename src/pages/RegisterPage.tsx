import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Palette,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Role selector: 'artisan' | 'customer'
  const [role, setRole] = useState<'artisan' | 'customer'>('artisan');

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [location, setLocation] = useState<string>('Andhra Pradesh');
  const [craftType, setCraftType] = useState<string>('Kondapalli Wooden Toys & Dolls');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please provide a contact phone number.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (role === 'artisan' && !craftType.trim()) {
      setErrorMsg('Please specify your craft type or specialization.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      confirmPassword,
      role,
      location: location.trim(),
      craftType: role === 'artisan' ? craftType.trim() : undefined,
      avatar: ''
    });
    setLoading(false);

    if (res.success && res.user) {
      showToast(
        `Welcome to KalaConnect AI! 🎉`,
        `Account successfully created for ${name}.`,
        'success'
      );

      // Automatic Role-based Redirection to personal dashboard
      if (role === 'artisan') {
        navigate('/artisan/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      setErrorMsg(res.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-[90vh] bg-stone-50/70 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto space-y-7">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-800 via-stone-900 to-amber-700 text-white flex items-center justify-center font-serif text-3xl font-bold mx-auto shadow-lg border border-amber-400/30">
            K
          </div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            Create Your Kala<span className="text-amber-700">Connect</span> Account
          </h2>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Join India's AI-empowered artisan marketplace. Create a dedicated artisan profile or start discovering authentic crafts.
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="bg-stone-200/70 p-1 rounded-2xl flex items-center shadow-inner max-w-sm mx-auto">
          <Link
            to="/login"
            className="flex-1 py-2 text-xs font-semibold rounded-xl text-stone-600 hover:text-stone-900 text-center transition-all"
          >
            Sign In
          </Link>
          <button
            type="button"
            className="flex-1 py-2 text-xs font-bold rounded-xl bg-white text-stone-900 shadow-sm transition-all"
          >
            Create Account
          </button>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          
          {/* STEP: Role Selection (Artisan vs Customer) */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-2.5">
              Select Your Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('artisan')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  role === 'artisan'
                    ? 'border-amber-700 bg-amber-50/60 shadow-sm'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-xl ${role === 'artisan' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                    <Palette className="w-5 h-5" />
                  </div>
                  {role === 'artisan' && <CheckCircle2 className="w-5 h-5 text-amber-700" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900">Artisan / Maker</h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Showcase handicrafts, use AI cataloging studio, and sell to buyers.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  role === 'customer'
                    ? 'border-amber-700 bg-amber-50/60 shadow-sm'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-xl ${role === 'customer' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  {role === 'customer' && <CheckCircle2 className="w-5 h-5 text-amber-700" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900">Customer / Buyer</h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Discover authentic handmade products and connect directly with artisans.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Error: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Full Name <span className="text-amber-700">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder={role === 'artisan' ? 'e.g. Ramesh Kumar' : 'e.g. Priya Sharma'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all text-stone-900"
                />
              </div>
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Email Address <span className="text-amber-700">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Phone Number <span className="text-amber-700">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Password <span className="text-amber-700">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Confirm Password <span className="text-amber-700">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Location Field */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                Location (State / City / Region) <span className="text-amber-700">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Kondapalli, Andhra Pradesh or Bengaluru, Karnataka"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all text-stone-900"
                />
              </div>
            </div>

            {/* Artisan-Specific: Craft Type */}
            {role === 'artisan' && (
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Artisan Craft Specialization</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Craft Type / Category <span className="text-amber-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kondapalli Toys, Kalamkari Textiles, Blue Pottery, Brass Dhokra"
                    value={craftType}
                    onChange={(e) => setCraftType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all text-stone-900"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create {role === 'artisan' ? 'Artisan' : 'Customer'} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link back to Sign In */}
          <div className="text-center pt-2">
            <span className="text-xs text-stone-600">Already registered on KalaConnect AI? </span>
            <Link
              to="/login"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 underline decoration-amber-300 underline-offset-4"
            >
              Sign In to your dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
