import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../services/database';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Smartphone,
  Banknote,
  Building
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, deliveryCharge, total, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Customer Delivery Address State (pre-filled with demo data for easy testing)
  const [fullName, setFullName] = useState<string>(currentUser?.name || 'Priya Sharma');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '+91 98200 45678');
  const [address, setAddress] = useState<string>('Flat 402, Sea Green Apartments, Worli Sea Face');
  const [city, setCity] = useState<string>('Mumbai');
  const [state, setState] = useState<string>(currentUser?.state || 'Maharashtra');
  const [pincode, setPincode] = useState<string>('400018');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI (Google Pay)');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-stone-800">Your bag is empty</h2>
        <p className="text-xs text-stone-500 mt-2">Please add crafts to your bag before checking out.</p>
        <Link
          to="/marketplace"
          className="mt-4 px-6 py-2.5 rounded-xl bg-amber-700 text-white font-bold text-xs"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      showToast('Incomplete Address', 'Please fill in all shipping details.', 'warning');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Create real Order in KalaDatabase
      const orderItems = items.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        orderId: '',
        productId: item.productId,
        artisanId: item.product.artisanId,
        productName: item.product.name,
        productImage: item.product.image,
        unitPrice: item.product.publishedPrice,
        quantity: item.quantity,
        total: item.product.publishedPrice * item.quantity
      }));

      const newOrder = db.createOrder({
        customerId: currentUser?.id || 'user-customer-1',
        customerName: fullName,
        phone,
        address,
        city,
        state,
        pincode,
        items: orderItems,
        subtotal,
        deliveryCharge,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'cod' : 'paid'
      });

      // Clear Shopping Bag
      clearCart();

      // Fire confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });

      showToast(
        'Order Placed Successfully! 🎉',
        `Order #${newOrder.id} has been recorded. Tracking: ${newOrder.trackingNumber}`,
        'success'
      );

      setIsProcessing(false);
      navigate('/customer/orders');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="pb-4 border-b border-stone-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Secure Fair-Trade Checkout</h1>
          <p className="text-xs text-stone-500 mt-1">Direct Fair-Trade Artisan Escrow & Instant Payment Processing</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left 2 Cols: Shipping Details & Payment Selection */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Truck className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-sm text-stone-900">1. Delivery Address</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Mobile Number:
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Street Address:
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    City:
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    State:
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Pincode:
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>
            </div>

            {/* Demo Payment Selector */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <CreditCard className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-sm text-stone-900">2. Select Demo Payment Method</h3>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'UPI (Google Pay)',
                    label: 'UPI (Instant Demo: Google Pay / PhonePe / Paytm)',
                    desc: 'Instant verification without real currency debit.',
                    icon: <Smartphone className="w-4 h-4 text-emerald-600" />
                  },
                  {
                    id: 'RuPay / Credit Card',
                    label: 'RuPay / Indian Debit / Credit Card (Demo Gateway)',
                    desc: 'Pre-authorized mock test credentials enabled.',
                    icon: <CreditCard className="w-4 h-4 text-blue-600" />
                  },
                  {
                    id: 'NetBanking',
                    label: 'Indian NetBanking (SBI, HDFC, ICICI, BoB)',
                    desc: 'Simulated direct bank clearance.',
                    icon: <Building className="w-4 h-4 text-purple-600" />
                  },
                  {
                    id: 'Cash on Delivery',
                    label: 'Cash on Delivery (Pay at Doorstep)',
                    desc: 'Pay cash to the postal courier upon arrival.',
                    icon: <Banknote className="w-4 h-4 text-stone-600" />
                  }
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-1 accent-amber-700"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {method.icon}
                        <span className="text-xs font-bold text-stone-900">{method.label}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Right Col: Order Summary & Place Order */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-stone-900 pb-3 border-b border-stone-100">
              Order Items ({items.length})
            </h3>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-stone-900 truncate">{product.name}</p>
                    <p className="text-stone-500 text-[11px]">
                      Qty: {quantity} × ₹{product.publishedPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="font-bold text-stone-900">
                    ₹{(product.publishedPrice * quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs font-medium">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-stone-900">
                  {deliveryCharge === 0 ? <span className="text-emerald-700">FREE</span> : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex justify-between text-sm font-extrabold text-stone-900">
                <span>Total Payable</span>
                <span className="text-lg text-amber-900">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Confirming Demo Order...</span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-200" />
                  <span>PLACE ORDER (₹{total.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Secure Escrow • Direct Artisan Payout</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
