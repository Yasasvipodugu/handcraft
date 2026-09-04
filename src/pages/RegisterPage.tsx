import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { UserRole } from '../types';
import {
  User,
  Mail,
  Phone,
  Lock,
  Globe,
  Palette,
  MapPin,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Building,
  CheckCircle,
  Camera
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected registration role: artisan | customer | b2b_buyer
  const [role, setRole] = useState<'artisan' | 'customer' | 'b2b_buyer'>(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'customer' || location.pathname.includes('/customer')) return 'customer';
    if (roleParam === 'b2b_buyer' || roleParam === 'buyer' || location.pathname.includes('/b2b') || location.pathname.includes('/buyer')) return 'b2b_buyer';
    return 'artisan';
  });

  useEffect(() => {
    if (location.pathname.includes('/customer')) setRole('customer');
    else if (location.pathname.includes('/b2b') || location.pathname.includes('/buyer')) setRole('b2b_buyer');
    else if (location.pathname.includes('/artisan')) setRole('artisan');
  }, [location.pathname]);

  // Common Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [state, setState] = useState<string>('Andhra Pradesh');
  const [city, setCity] = useState<string>('Vijayawada');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('te');

  // Artisan-Specific Fields (Section 7)
  const [craftType, setCraftType] = useState<string>('Kondapalli Wooden Toys');
  const [artisanBio, setArtisanBio] = useState<string>(
    'Master artisan practicing generational hand-carved wood craftsmanship with non-toxic natural colors.'
  );
  const [profilePhoto, setProfilePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  );

  // Business Buyer Specific Fields (Section 44)
  const [businessName, setBusinessName] = useState<string>('FabIndia Corporate Sourcing');
  const [businessCategory, setBusinessCategory] = useState<string>('Retail & Corporate Gifting');
  const [businessLocation, setBusinessLocation] = useState<string>('New Delhi Corporate Hub');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: role === 'b2b_buyer' ? `${name} (${businessName})` : name,
      email,
      phone,
      role,
      state: role === 'b2b_buyer' ? businessLocation : state,
      district: city,
      language: preferredLanguage,
      craftCategory: role === 'artisan' ? craftType : role === 'b2b_buyer' ? businessCategory : undefined,
      avatar: profilePhoto
    });
    setLoading(false);

    if (res.success) {
      showToast('Account Created! 🎉', `Welcome to KalaConnect AI, ${name}.`, 'success');
      if (role === 'artisan') navigate('/artisan/dashboard');
      else if (role === 'b2b_buyer') navigate('/b2b');
      else navigate('/customer/dashboard');
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-stone-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto space-y-7">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-serif text-3xl font-bold mx-auto shadow-md">
            K
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Create KalaConnect AI Account
          </h2>
          <p className="text-xs text-stone-500">
            Select your account type and start connecting directly with the craft ecosystem
          </p>
        </div>

        {/* Role Selector Tabs (Section 3) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200/80 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('artisan')}
            className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'artisan'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-700" />
            <span>Artisan / Seller</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'customer'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('b2b_buyer')}
            className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'b2b_buyer'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-700" />
            <span>Business Buyer</span>
          </button>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-sm text-stone-900 uppercase tracking-wider">
              {role === 'artisan' && 'Artisan Registration'}
              {role === 'customer' && 'Customer Registration'}
              {role === 'b2b_buyer' && 'Business Buyer Registration'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {role === 'artisan' && 'Set up your workshop storefront and start creating AI catalogs'}
              {role === 'customer' && 'Create your personal account to purchase handmade Indian crafts'}
              {role === 'b2b_buyer' && 'Register your enterprise to post bulk requirements and receive proposals'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            
            {/* Common: Full Name / Contact Person */}
            <div>
              <label className="block text-stone-700 font-bold uppercase mb-1">
                {role === 'b2b_buyer' ? 'Contact Person Name:' : 'Full Name:'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'artisan' ? 'e.g. Lakshmi Devi' : 'e.g. Rajesh Sharma'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                />
              </div>
            </div>

            {/* B2B Buyer Specific: Business Name & Category (Section 44) */}
            {role === 'b2b_buyer' && (
              <>
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Business Name:</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. FabIndia Corporate Gifting"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold uppercase mb-1">Business Category:</label>
                    <input
                      type="text"
                      required
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      placeholder="e.g. Retail, Hospitality, Export"
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-bold uppercase mb-1">Business Location:</label>
                    <input
                      type="text"
                      required
                      value={businessLocation}
                      onChange={(e) => setBusinessLocation(e.target.value)}
                      placeholder="e.g. New Delhi, Mumbai"
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Common: Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">
                  {role === 'b2b_buyer' ? 'Business Email:' : 'Email Address:'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Phone Number:</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Common: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Password:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Confirm Password:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Artisan Specific Fields (Section 7) */}
            {role === 'artisan' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold uppercase mb-1">Craft Type:</label>
                    <div className="relative">
                      <Palette className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={craftType}
                        onChange={(e) => setCraftType(e.target.value)}
                        placeholder="e.g. Kondapalli Toys, Bamboo Craft"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold uppercase mb-1">Profile Photo URL:</label>
                    <div className="relative">
                      <Camera className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={profilePhoto}
                        onChange={(e) => setProfilePhoto(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold uppercase mb-1">State:</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Andhra Pradesh"
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold uppercase mb-1">City / Village:</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Vijayawada"
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Artisan Bio / Story:</label>
                  <textarea
                    rows={2}
                    value={artisanBio}
                    onChange={(e) => setArtisanBio(e.target.value)}
                    placeholder="Describe your craft lineage and workshop experience..."
                    className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                  />
                </div>
              </>
            )}

            {/* Language Preference */}
            <div>
              <label className="block text-stone-700 font-bold uppercase mb-1">Preferred Language:</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs bg-white"
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="ml">മലയാളം (Malayalam)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="or">ଓଡ଼ిଆ (Odia)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>
                {loading
                  ? 'Creating Account...'
                  : role === 'artisan'
                  ? 'Create Artisan Account'
                  : role === 'customer'
                  ? 'Create Customer Account'
                  : 'Create Business Buyer Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-800 hover:text-amber-900 font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
