import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/database';
import { Artisan, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import {
  CheckCircle,
  MapPin,
  Award,
  Calendar,
  Phone,
  Mail,
  Star,
  Sparkles,
  BookOpen,
  Store,
  Layers
} from 'lucide-react';

export const ArtisanStorePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (id) {
      const art = db.getArtisanById(id) || db.getArtisans()[0];
      if (art) {
        setArtisan(art);
        const prods = db.getProductsByArtisan(art.id);
        setProducts(prods);
      }
    }
  }, [id]);

  if (!artisan) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-xl font-bold text-stone-800">Storefront Not Found</h3>
        <Link to="/marketplace" className="mt-4 px-6 py-2 bg-amber-700 text-white rounded-xl text-xs font-bold">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/70 pb-16">
      {/* Banner Cover */}
      <div className="relative h-64 sm:h-80 w-full bg-stone-900 overflow-hidden">
        <img
          src={artisan.bannerUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80'}
          alt={artisan.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>

        {/* Floating Verified Stamp */}
        {artisan.verificationStatus === 'verified' && (
          <div className="absolute top-6 right-6 bg-emerald-700/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-emerald-400 flex items-center gap-1.5 shadow-lg">
            <CheckCircle className="w-4 h-4 text-white" />
            <span>✓ VERIFIED MASTER ARTISAN</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 relative z-10 space-y-10">
        
        {/* Artisan Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {artisan.avatarUrl ? (
              <img
                src={artisan.avatarUrl}
                alt={artisan.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-amber-700 to-stone-800 text-white flex items-center justify-center font-black text-3xl sm:text-4xl border-4 border-white shadow-xl flex-shrink-0">
                {artisan.name ? artisan.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">{artisan.name}</h1>
                {artisan.verificationStatus === 'verified' && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>✓ Verified Artisan</span>
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-amber-800">{artisan.craftName}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {artisan.village}, {artisan.district}, {artisan.state}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  {artisan.experienceYears} Years of Generational Craft Experience
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {artisan.rating} / 5.0 Rating
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={`tel:${artisan.phone}`}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold text-center"
            >
              Contact Workshop
            </a>
            <Link
              to="/marketplace"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold text-center"
            >
              Shop Collection
            </Link>
          </div>
        </div>

        {/* "Meet the Artisan" Story & Cultural Significance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <BookOpen className="w-5 h-5 text-amber-700" />
              <h2 className="text-lg font-extrabold text-stone-900">Meet the Artisan</h2>
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Artisan Biography & Lineage
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed">{artisan.bio}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Cultural & Sacred Significance
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed">{artisan.culturalSignificance}</p>
            </div>
          </div>

          {/* Awards & GI Accreditations */}
          <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-200">
              <Award className="w-5 h-5 text-amber-800" />
              <h3 className="text-sm font-extrabold text-stone-900">Awards & Recognition</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-stone-700">
              {(artisan.awards || ['National Handicrafts Merit Award', 'GI Certified Craftsperson']).map(
                (award, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 flex-shrink-0"></span>
                    <span>{award}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Artisan's Products Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                Products by {artisan.name}
              </h2>
              <p className="text-xs text-stone-500">Handcrafted directly in {artisan.village}</p>
            </div>
            <span className="text-xs font-bold text-stone-600">{products.length} items listed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
