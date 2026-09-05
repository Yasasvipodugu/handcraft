import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { Star, CheckCircle, Heart, ShoppingBag, Eye, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useNotifications();
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    showToast(
      !isSaved ? 'Added to Wishlist! ❤️' : 'Removed from Wishlist',
      !isSaved ? `"${product.name}" is saved to your favorites.` : 'Item removed from favorites.',
      'info'
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Wishlist / Save Button */}
        <button
          onClick={handleSaveToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isSaved
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={isSaved ? 'Remove from Wishlist' : 'Save Product'}
          aria-label="Save product"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Category Pill & Cost Range Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          <span className="bg-stone-900/80 backdrop-blur-xs text-stone-100 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {translate(product.category)}
          </span>
          <span className="bg-amber-100/90 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300 backdrop-blur-xs shadow-xs">
            {product.publishedPrice < 1000
              ? translate('Under ₹1,000')
              : product.publishedPrice <= 2500
              ? translate('₹1,000 – ₹2,500')
              : product.publishedPrice <= 5000
              ? translate('₹2,500 – ₹5,000')
              : translate('Above ₹5,000')}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Artisan & Location with Verification Badge */}
          <div className="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-1">
            <Link
              to={`/artisan/store/${product.artisanId}`}
              className="font-medium text-stone-700 hover:text-amber-700 flex items-center gap-1 group/artisan"
            >
              <span className="truncate max-w-[130px]">{product.artisanName}</span>
              {product.artisanVerified && (
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-300"
                  title="Verified Master Artisan"
                >
                  <CheckCircle className="w-2.5 h-2.5 fill-emerald-600 text-white" />
                  <span>{translate('✓ VERIFIED ARTISAN')}</span>
                </span>
              )}
            </Link>

            <span className="text-[11px] text-stone-400 flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {product.artisanLocation ? product.artisanLocation.split(',')[0] : 'India'}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/marketplace/product/${product.id}`} className="block group-hover:text-amber-800">
            <h3 className="font-bold text-sm text-stone-900 line-clamp-2 leading-snug">
              {translate(product.name)}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-stone-800">{product.rating}</span>
            <span className="text-[11px] text-stone-400">({product.reviewCount || 24} reviews)</span>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-stone-400 font-medium">{translate('Fair Price')}:</span>
              <div className="text-lg font-extrabold text-stone-900 tracking-tight">
                ₹{product.publishedPrice.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {translate('100% to Artisans')}
            </span>
          </div>

          {/* Action Buttons: VIEW PRODUCT and ADD TO CART */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate(`/marketplace/product/${product.id}`)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{translate('View Details')}</span>
            </button>

            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{translate('Add to Cart')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
