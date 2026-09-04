import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/database';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin
} from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>(() => {
    return currentUser ? db.getOrdersByCustomer(currentUser.id) : db.getOrders();
  });

  useEffect(() => {
    const load = () => {
      if (currentUser) {
        setOrders(db.getOrdersByCustomer(currentUser.id));
      } else {
        setOrders(db.getOrders());
      }
    };
    load();
    const unsub = db.subscribe('orders', load);
    return unsub;
  }, [currentUser?.id]);

  const getStatusStepIndex = (status: OrderStatus) => {
    const steps: OrderStatus[] = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Live Order Tracking
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">My Orders</h1>
            <p className="text-xs text-stone-500">Track shipment progress and artisan dispatch status in real-time</p>
          </div>

          <Link
            to="/marketplace"
            className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-colors self-start"
          >
            Explore More Crafts
          </Link>
        </div>

        {/* Orders Feed */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-stone-200">
            <Package className="w-16 h-16 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-stone-900">No Orders Placed Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven't placed any orders yet. Visit the marketplace to purchase authentic handicrafts!
            </p>
            <Link
              to="/marketplace"
              className="inline-block px-6 py-2.5 rounded-xl bg-amber-700 text-white font-bold text-xs"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStepIdx = getStatusStepIndex(order.status);
              const steps: { key: OrderStatus; label: string }[] = [
                { key: 'placed', label: 'Placed' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'processing', label: 'Processing' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'delivered', label: 'Delivered' }
              ];

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-6"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-sm">#{order.id}</span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Tracking: <strong className="text-stone-800 font-mono">{order.trackingNumber}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block font-semibold uppercase">Total Paid:</span>
                        <span className="text-base font-extrabold text-stone-900">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Visual Status Progress Tracker */}
                  <div className="py-2">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-4">
                      Shipment Status Timeline:
                    </p>
                    <div className="grid grid-cols-5 gap-2 relative">
                      {steps.map((step, idx) => {
                        const isReached = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isCurrent
                                  ? 'bg-amber-700 text-white ring-4 ring-amber-100 shadow-sm'
                                  : isReached
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {isReached && !isCurrent ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[11px] mt-2 font-bold ${
                                isCurrent
                                  ? 'text-amber-800 font-extrabold'
                                  : isReached
                                  ? 'text-stone-900'
                                  : 'text-stone-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                      Items in Package:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70"
                        >
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                          />
                          <div className="min-w-0 flex-1 text-xs">
                            <p className="font-bold text-stone-900 truncate">{item.productName}</p>
                            <p className="text-stone-500 text-[11px] mt-0.5">
                              Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <Link
                            to={`/marketplace/product/${item.productId}`}
                            className="text-stone-400 hover:text-amber-800 p-1"
                            title="View Product"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address Summary */}
                  <div className="text-[11px] text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>Delivery to: {order.address}, {order.city}, {order.state} - {order.pincode}</span>
                    </div>
                    <span className="font-semibold text-stone-700">Method: {order.paymentMethod}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
