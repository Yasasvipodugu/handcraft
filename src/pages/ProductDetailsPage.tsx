import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../services/database';
import { Product, Artisan, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Star,
  CheckCircle,
  Heart,
  ShoppingBag,
  Share2,
  MapPin,
  Shield,
  Truck,
  RotateCcw,
  MessageSquare,
  ArrowRight,
  Send,
  X,
  Layers,
  Sparkles
} from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useNotifications();

  const [product, setProduct] = useState<Product | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [inquiryMessage, setInquiryMessage] = useState<string>('');

  useEffect(() => {
    if (id) {
      const prod = db.getProductById(id);
      if (prod) {
        setProduct(prod);
        db.incrementProductViews(id);
        const art = db.getArtisanById(prod.artisanId);
        setArtisan(art || null);
      }
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-stone-800">Product not found</h2>
        <p className="text-xs text-stone-500 mt-2">The craft item you requested could not be located.</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="mt-4 px-6 py-2.5 rounded-xl bg-amber-700 text-white font-bold text-xs"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    showToast(
      !isSaved ? 'Saved to Wishlist! ❤️' : 'Removed from Wishlist',
      !isSaved ? `"${product.name}" is now in your saved items.` : 'Item removed.',
      'info'
    );
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) return;

    if (artisan) {
      db.addNotification({
        userId: artisan.userId,
        role: 'artisan',
        title: 'Customer Inquiry Received 💬',
        message: `Inquiry for "${product.name}": "${inquiryMessage}"`,
        type: 'product',
        read: false,
        link: `/marketplace/product/${product.id}`
      });
    }

    showToast(
      'Inquiry Sent! 📬',
      `Your message has been forwarded to artisan ${product.artisanName}.`,
      'success'
    );
    setInquiryMessage('');
    setContactModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <Link to="/" className="hover:text-amber-800">Home</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-amber-800">Marketplace</Link>
          <span>/</span>
          <span className="text-stone-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Showcase Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Large Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.artisanVerified && (
                <div className="absolute top-4 left-4 bg-emerald-700/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                  <span>✓ VERIFIED ARTISAN CREATION</span>
                </div>
              )}
            </div>

            {/* Quality & GI Indicators */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <Shield className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                <span className="font-bold text-stone-800 block text-[11px]">GI Tagged</span>
                <span className="text-[10px] text-stone-400">Authentic Lineage</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <Truck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                <span className="font-bold text-stone-800 block text-[11px]">Safe Delivery</span>
                <span className="text-[10px] text-stone-400">Dispatched in 48h</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <RotateCcw className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                <span className="font-bold text-stone-800 block text-[11px]">Direct Support</span>
                <span className="text-[10px] text-stone-400">Zero Commission</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details, Pricing & 4 Working Action Buttons */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Category & Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                  {product.category}
                </span>
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-stone-100 text-stone-600 font-semibold px-2.5 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                {product.name}
              </h1>

              {/* Artisan Profile Card */}
              <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={artisan?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'}
                    alt={product.artisanName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-600/30"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/artisan/store/${product.artisanId}`}
                        className="font-bold text-sm text-stone-900 hover:text-amber-800 transition-colors"
                      >
                        {product.artisanName}
                      </Link>
                      {product.artisanVerified && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5 fill-emerald-600 text-white" />
                          <span>✓ Verified Artisan</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{product.artisanLocation}</span>
                    </p>
                  </div>
                </div>

                <Link
                  to={`/artisan/store/${product.artisanId}`}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 underline"
                >
                  Visit Store →
                </Link>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-900">{product.rating} / 5.0</span>
                <span className="text-xs text-stone-400">({product.reviewCount || 28} verified customer ratings)</span>
              </div>

              {/* Price Display */}
              <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium">Artisan Fair Price:</span>
                  <div className="text-3xl font-extrabold text-stone-950 tracking-tight mt-0.5">
                    ₹{product.publishedPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 block">
                    In Stock ({product.stock} units)
                  </span>
                  <span className="text-[10px] text-stone-400 mt-1 block">Taxes included</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-bold text-stone-700">Quantity:</span>
                <div className="inline-flex items-center border border-stone-300 rounded-xl bg-stone-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-stone-700 hover:bg-stone-200 rounded-l-xl font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-stone-700 hover:bg-stone-200 rounded-r-xl font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* FOUR WORKING ACTION BUTTONS */}
              <div className="space-y-2.5 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Button 1: ADD TO CART */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO CART</span>
                  </button>

                  {/* Button 2: BUY NOW */}
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>BUY NOW</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Button 3: CONTACT ARTISAN */}
                  <button
                    onClick={() => setContactModalOpen(true)}
                    className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-stone-600" />
                    <span>CONTACT ARTISAN</span>
                  </button>

                  {/* Button 4: SAVE PRODUCT */}
                  <button
                    onClick={handleSaveToggle}
                    className={`w-full py-3 rounded-2xl font-bold text-xs border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      isSaved
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{isSaved ? 'SAVED IN WISHLIST' : 'SAVE PRODUCT'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Deep Specifications & Craft Story */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
              Product Story & Generational Craft Heritage
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed mt-4">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-stone-100">
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Materials Used:</span>
              <p className="text-sm font-bold text-stone-900 mt-1">{product.material}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Craft Technique:</span>
              <p className="text-sm font-bold text-stone-900 mt-1">{product.craftType}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Dimensions / Size:</span>
              <p className="text-sm font-bold text-stone-900 mt-1">{product.dimensions}</p>
            </div>
          </div>
        </div>

      </div>

      {/* CONTACT ARTISAN MODAL */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-stone-900">
                  Message Artisan: {product.artisanName}
                </h3>
              </div>
              <button
                onClick={() => setContactModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Inquiry regarding: {product.name}
                </label>
                <textarea
                  rows={4}
                  required
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Ask the artisan about custom sizes, color variations, bulk orders, or craft technique..."
                  className="w-full rounded-2xl border border-stone-300 p-3 text-xs focus:outline-none focus:border-amber-700"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message to Artisan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
