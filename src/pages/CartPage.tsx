import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, itemCount, subtotal, deliveryCharge, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900">Your Shopping Bag is Empty</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm leading-relaxed">
          Support rural master artisans by adding authentic handcrafted products to your cart.
        </p>
        <Link
          to="/marketplace"
          className="px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2"
        >
          <span>Explore Indian Crafts</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Shopping Bag</h1>
            <p className="text-xs text-stone-500 mt-1">You have {itemCount} unique handcrafted items</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
          >
            Clear Entire Bag
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-700" />
              {subtotal >= freeShippingThreshold ? (
                <span>🎉 You qualify for FREE Nationwide Delivery!</span>
              ) : (
                <span>Add ₹{(freeShippingThreshold - subtotal).toLocaleString('en-IN')} more for FREE Delivery!</span>
              )}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Cart Layout: Items Table + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                    <Link
                      to={`/marketplace/product/${product.id}`}
                      className="font-bold text-sm text-stone-900 hover:text-amber-800 line-clamp-1 mt-1 block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-stone-500 mt-0.5">By {product.artisanName}</p>
                    <p className="text-xs font-extrabold text-stone-900 mt-1">
                      ₹{product.publishedPrice.toLocaleString('en-IN')} each
                    </p>
                  </div>
                </div>

                {/* Stepper & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                  <div className="inline-flex items-center border border-stone-300 rounded-xl bg-stone-50">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1 text-stone-700 hover:bg-stone-200 rounded-l-xl font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-stone-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1 text-stone-700 hover:bg-stone-200 rounded-r-xl font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-xs font-bold text-stone-400 block text-[10px]">Total:</span>
                    <span className="text-sm font-extrabold text-stone-900">
                      ₹{(product.publishedPrice * quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-stone-900 pb-3 border-b border-stone-100">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Standard Delivery (India Post)</span>
                <span className="font-bold text-stone-900">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between text-sm font-extrabold text-stone-900">
                <span>Total Amount</span>
                <span className="text-lg text-amber-900">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-[11px] text-stone-500 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Secure Fair-Trade Checkout</span>
              </div>
              <p>Direct payments directly credited to verified master artisan bank accounts.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
