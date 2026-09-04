import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/database';
import { ProductCard } from '../components/ProductCard';
import { ImpactCharts } from '../components/ImpactCharts';
import {
  Sparkles,
  Camera,
  Mic,
  Coins,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Briefcase,
  Users,
  Compass,
  Star,
  Layers,
  ChevronRight,
  Sliders,
  Award,
  Globe,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { currentUser, switchRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const featuredProducts = db.getProducts().slice(0, 4);
  const featuredArtisans = db.getArtisans().slice(0, 4);

  const handleStartSelling = () => {
    if (currentUser?.role === 'artisan') {
      navigate('/artisan/studio');
    } else {
      switchRole('artisan');
      navigate('/artisan/studio');
    }
  };

  const handleExploreCrafts = () => {
    navigate('/marketplace');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===================================================================
          SECTION 1: HERO SECTION
         =================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-stone-50 to-white pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-stone-200/70">
        <div className="absolute inset-0 artisan-pattern opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Startup Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 text-xs font-bold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>AI-Driven Market Linkage & Smart Cataloging Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-stone-950 tracking-tight leading-[1.1] font-sans">
              From Your Craft to <span className="text-amber-700">the World.</span>
            </h1>

            {/* Supporting Tagline */}
            <p className="text-lg sm:text-xl text-stone-800 font-semibold leading-relaxed max-w-3xl mx-auto">
              Empowering artisans with AI, digital tools and better market access.
            </p>
            <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Turn your handmade products into professional digital catalogs and reach customers beyond your local market.
            </p>

            {/* Working Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <button
                onClick={handleStartSelling}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>START SELLING</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleExploreCrafts}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-300 font-extrabold text-sm sm:text-base transition-all shadow-xs hover:shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-700" />
                <span>EXPLORE CRAFTS</span>
              </button>
            </div>

            {/* Visual Flow Banner: PHOTO -> AI -> CATALOG -> PRICE -> MARKET */}
            <div className="pt-10 max-w-3xl mx-auto">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-amber-200/90 shadow-md">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-900 mb-3">
                  The Seamless 5-Stage Artisan Workflow
                </div>
                <div className="grid grid-cols-5 items-center gap-1 sm:gap-3 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-1 shadow-2xs">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-stone-900">PHOTO</span>
                    <span className="text-[9px] text-stone-500 hidden md:inline">Camera Snap</span>
                  </div>

                  <div className="flex flex-col items-center relative">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold mb-1 shadow-2xs">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-stone-900">AI</span>
                    <span className="text-[9px] text-stone-500 hidden md:inline">Studio BG</span>
                  </div>

                  <div className="flex flex-col items-center relative">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-1 shadow-2xs">
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-stone-900">CATALOG</span>
                    <span className="text-[9px] text-stone-500 hidden md:inline">Voice & Spec</span>
                  </div>

                  <div className="flex flex-col items-center relative">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-1 shadow-2xs">
                      <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-stone-900">PRICE</span>
                    <span className="text-[9px] text-stone-500 hidden md:inline">Fair Trade</span>
                  </div>

                  <div className="flex flex-col items-center relative">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center font-bold mb-1 shadow-2xs">
                      <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-stone-900">MARKET</span>
                    <span className="text-[9px] text-stone-500 hidden md:inline">Direct Buyers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto text-left">
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <p className="text-2xl font-black text-stone-900">10+</p>
                <p className="text-[11px] text-stone-500 font-semibold">Master Artisans</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <p className="text-2xl font-black text-stone-900">20+</p>
                <p className="text-[11px] text-stone-500 font-semibold">GI-Certified Crafts</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <p className="text-2xl font-black text-stone-900">₹8.4L+</p>
                <p className="text-[11px] text-stone-500 font-semibold">Artisan Fair Revenue</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <p className="text-2xl font-black text-stone-900">100%</p>
                <p className="text-[11px] text-stone-500 font-semibold">Direct to Creator</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 2: THE PROBLEM WE SOLVE
         =================================================================== */}
      <section className="py-16 sm:py-24 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              The Grassroots Reality
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
              Empowering India’s 7 Million Artisans
            </h2>
            <p className="text-sm sm:text-base text-stone-600">
              Traditional craftspeople hold centuries of indigenous art, yet struggle with digital literacy, predatory middlemen, and market exclusion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                ✕
              </div>
              <h3 className="text-lg font-bold text-stone-900">Predatory Middlemen Margins</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Rural artisans typically receive less than 15-20% of the final retail price, while intermediaries pocket up to 80% through opaque supply chains.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                📸
              </div>
              <h3 className="text-lg font-bold text-stone-900">Poor Photography & Cataloging</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ordinary indoor lighting and cluttered backgrounds fail e-commerce quality checks, making handcrafted products look inferior to factory duplicates.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                🗣️
              </div>
              <h3 className="text-lg font-bold text-stone-900">Digital & Linguistic Barriers</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Complex English listing forms on conventional marketplaces alienate non-English speaking artisans who can eloquently explain their work only through voice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 3: HOW KALACONNECT WORKS
         =================================================================== */}
      <section className="py-16 sm:py-24 bg-stone-50/60 border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Simple 5-Step System
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
              How KalaConnect AI Works
            </h2>
            <p className="text-sm sm:text-base text-stone-600">
              From a village workshop to verified buyers worldwide in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Camera className="w-6 h-6 text-amber-700" />
              </div>
              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest">Step 1</span>
              <h4 className="text-sm font-bold text-stone-900">Snap Photo</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Artisan takes a quick photo using their smartphone camera or uploads an image.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Mic className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest">Step 2</span>
              <h4 className="text-sm font-bold text-stone-900">Voice in Native Tongue</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Speak naturally in Telugu, Tamil, or English. KalaConnect transcribes and translates instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6 text-purple-700" />
              </div>
              <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-widest">Step 3</span>
              <h4 className="text-sm font-bold text-stone-900">AI Catalog Generation</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                AI creates product title, cultural story, materials, dimensions, and search tags.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Coins className="w-6 h-6 text-emerald-700" />
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Step 4</span>
              <h4 className="text-sm font-bold text-stone-900">Fair Price Assistant</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Transparent calculation of material, labor hours, and margin to prevent underselling.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-800 text-white flex items-center justify-center font-bold">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest">Step 5</span>
              <h4 className="text-sm font-bold text-stone-900">1-Click Publish</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Live immediately on artisan’s personalized storefront and public e-commerce marketplace.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/artisan/studio"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Launch AI Product Studio Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 4: PLATFORM FEATURES
         =================================================================== */}
      <section className="py-16 sm:py-24 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Startup Technology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
              Built Specifically for Generational Artisans
            </h2>
            <p className="text-sm sm:text-base text-stone-600">
              Every tool is optimized for low-bandwidth mobile devices, zero technical barrier, and maximum fair-trade surplus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Authentic Photo Enhancement</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Background isolation and neutral studio lighting that preserves authentic weave, chisel marks, and natural dye colors without synthetic distortion.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Regional Voice Support</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Web Speech API integration supporting Telugu, Tamil, Kannada, Malayalam, Bengali, Odia, and English for hands-free cataloging.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Fair Wage Price Engine</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Calculates fair hourly labor compensation and production costs to protect artisans against undercutting and unfair buyer leverage.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Store className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Instant Digital Storefront</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every artisan receives a dedicated, sharable web storefront with their bio, craft lineage, verified badge, and product inventory.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-stone-900">B2B Bulk Sourcing Marketplace</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Direct corporate matching for bulk gifting, hotels, export buyers, and designers with automated contract quote generation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Award className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-base font-bold text-stone-900">GI Verification & Trust Badge</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Government GI and identity verification seals displayed on listings to build customer confidence and authenticate heritage origins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 5: CRAFT CATEGORIES SHOWCASE
         =================================================================== */}
      <section className="py-16 sm:py-24 bg-stone-50/60 border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700">
                Curated Marketplace
              </span>
              <h2 className="text-3xl font-extrabold text-stone-900 mt-1">
                Authentic Indian Handicrafts
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Direct from verified master artisans across India with GI tag certifications.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 group"
            >
              <span>View All Products</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 6: ARTISAN SUCCESS STORIES & IMPACT
         =================================================================== */}
      <section className="py-16 sm:py-24 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700">
              Living Heritage Custodians
            </span>
            <h2 className="text-3xl font-extrabold text-stone-900">
              Meet Our Verified Master Artisans
            </h2>
            <p className="text-sm text-stone-500">
              Generational custodians of indigenous craft lineages verified on KalaConnect AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {featuredArtisans.map((artisan) => (
              <div
                key={artisan.id}
                className="bg-stone-50 rounded-2xl p-5 border border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col items-center text-center group"
              >
                <img
                  src={artisan.avatarUrl}
                  alt={artisan.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-amber-600/30 group-hover:scale-105 transition-transform"
                />
                <h4 className="text-base font-bold text-stone-900 mt-3">{artisan.name}</h4>
                <p className="text-xs font-semibold text-amber-800">{artisan.craftName}</p>
                <p className="text-[11px] text-stone-500 mt-1">{artisan.village}, {artisan.state}</p>

                {artisan.verificationStatus === 'verified' && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>✓ VERIFIED ARTISAN</span>
                  </span>
                )}

                <p className="text-xs text-stone-600 mt-3 line-clamp-3 leading-relaxed">
                  {artisan.bio}
                </p>

                <button
                  onClick={() => navigate(`/artisan/store/${artisan.id}`)}
                  className="mt-4 w-full py-2 rounded-xl text-xs font-semibold bg-white hover:bg-amber-700 hover:text-white text-stone-800 border border-stone-300 transition-colors cursor-pointer"
                >
                  Visit Storefront
                </button>
              </div>
            ))}
          </div>

          {/* Measurable Economic Impact */}
          <div className="mb-8 text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700">
              Measurable Outcomes
            </span>
            <h3 className="text-2xl font-extrabold text-stone-900">
              Impact on Rural Craft Communities
            </h3>
            <p className="text-xs text-stone-500">
              Transforming fair trade incomes and eliminating predatory intermediaries.
            </p>
          </div>

          <ImpactCharts />
        </div>
      </section>

      {/* ===================================================================
          SECTION 7: CALL TO ACTION
         =================================================================== */}
      <section className="py-20 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-900/60 px-3 py-1 rounded-full border border-amber-700 inline-block">
                Join the Movement
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Empowering Traditional Indian Artisans with Modern AI
              </h2>
              <p className="text-stone-300 text-sm leading-relaxed max-w-lg">
                Whether you are an artisan seeking direct global market access or a conscious buyer looking for genuine GI-certified handicrafts, KalaConnect AI bridges the gap.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleStartSelling}
                  className="px-7 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-98 text-center cursor-pointer"
                >
                  START SELLING (ARTISAN)
                </button>
                <button
                  onClick={handleExploreCrafts}
                  className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition-all text-center cursor-pointer"
                >
                  BROWSE MARKETPLACE
                </button>
              </div>
            </div>

            {/* B2B Sourcing Callout Card */}
            <div className="bg-stone-900/90 rounded-3xl p-6 sm:p-8 border border-stone-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-amber-400">
                <HeartHandshake className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">For Enterprises & Bulk Buyers</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Corporate Gifting & Direct Artisan Cluster Procurement
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Connect directly with verified weaving, pottery, and woodcraft cooperatives for corporate gift hampers, eco-packaging, interior decor, and export contracts.
              </p>
              <button
                onClick={() => {
                  switchRole('b2b_buyer');
                  navigate('/b2b');
                }}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
              >
                Post Bulk Requirement
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
