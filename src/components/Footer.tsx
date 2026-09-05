import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Heart, ShieldCheck, Award, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { translate, t } = useLanguage();
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white font-serif text-2xl font-bold">
                K
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Kala<span className="text-amber-500">Connect</span> AI
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {translate('footerTagline') || 'Empowering artisans. Preserving traditions. Connecting markets.'}
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/70 px-3 py-1 rounded-full border border-amber-800/80">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{translate('Direct Artisan Support')}</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{translate('Platform') || 'Platform'}</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link to="/marketplace" className="hover:text-amber-400 transition-colors">{translate('Browse All Handicrafts')}</Link>
              </li>
              <li>
                <Link to="/artisan/studio" className="hover:text-amber-400 transition-colors">{translate('AI Product Studio')}</Link>
              </li>
              <li>
                <Link to="/b2b" className="hover:text-amber-400 transition-colors">{translate('b2bMarketplace') || 'Business Marketplace'}</Link>
              </li>
              <li>
                <Link to="/customer/dashboard" className="hover:text-amber-400 transition-colors">{translate('Customer Dashboard')}</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-amber-400 transition-colors">{translate('cart') || 'Shopping Cart'}</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 text-stone-300 font-semibold transition-colors flex items-center gap-1">
                  <span>{translate('navAdmin') || 'Admin Console'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Craft Clusters */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Craft Clusters</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-500" /> Mithila & Madhubani (Bihar)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-500" /> Kondapalli Wooden Toys (Andhra Pradesh)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-500" /> Pashmina Handloom Weaving (Kashmir)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-500" /> Bankura Terracotta (West Bengal)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-500" /> Dhokra Lost-Wax Bell Metal (Chhattisgarh)</li>
            </ul>
          </div>

          {/* Company & Support Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support & Trust</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 transition-colors">About Us</a>
              </li>
              <li>
                <Link to="/artisan/studio" className="hover:text-amber-400 transition-colors">Artisan Support & Onboarding</Link>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('KalaConnect AI adheres to strict data protection standards for rural craft communities.'); }} className="hover:text-amber-400 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert('KalaConnect AI Fair Trade Terms: 100% direct artisan payments, verified origin guarantee.'); }} className="hover:text-amber-400 transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); alert('Support team: support@kalaconnect.ai | Toll-free artisan helpline: 1800-KALA-AI'); }} className="hover:text-amber-400 transition-colors">Contact Helpdesk</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>© 2026 KalaConnect AI Inc. All rights reserved. Empowering artisans. Preserving traditions. Connecting markets.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Preserving cultural craft heritage with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5" />
            <span>and Artificial Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
