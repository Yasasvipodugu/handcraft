import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  ShoppingBag,
  Package,
  CheckCircle,
  Truck,
  Clock,
  MapPin,
  Phone,
  Filter
} from 'lucide-react';

export const ArtisanOrdersPage: React.FC = () => {
  const { currentArtisan } = useAuth();
  const { showToast } = useNotifications();
  const [orders, setOrders] = useState<Order[]>(() => {
    return currentArtisan ? db.getOrdersByArtisan(currentArtisan.id) : db.getOrders();
  });

  const loadOrders = () => {
    if (currentArtisan) {
      setOrders(db.getOrdersByArtisan(currentArtisan.id));
    } else {
      setOrders(db.getOrders());
    }
  };

  useEffect(() => {
    loadOrders();
    const unsub = db.subscribe('orders', loadOrders);
    return unsub;
  }, [currentArtisan?.id]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = db.updateOrderStatus(orderId, newStatus);
    if (updated) {
      showToast(
        'Order Status Updated! 📦',
        `Order #${orderId} marked as ${newStatus.toUpperCase()}. Customer notified!`,
        'success'
      );
      loadOrders();
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="pb-4 border-b border-stone-200">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
            Artisan Workshop Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Orders Received</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage customer orders and update dispatch status in real-time. Changes instantly sync to the customer dashboard.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs text-stone-400 font-bold uppercase">Total Orders</span>
            <p className="text-2xl font-extrabold text-stone-900 mt-1">{orders.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs text-amber-700 font-bold uppercase">Pending Dispatch</span>
            <p className="text-2xl font-extrabold text-amber-800 mt-1">
              {orders.filter((o) => o.status !== 'delivered').length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs text-emerald-700 font-bold uppercase">Delivered</span>
            <p className="text-2xl font-extrabold text-emerald-800 mt-1">
              {orders.filter((o) => o.status === 'delivered').length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs text-stone-400 font-bold uppercase">Total Workshop Revenue</span>
            <p className="text-2xl font-extrabold text-stone-900 mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900">Received Order Dispatch Registry</h3>
            <span className="text-xs text-stone-500">{orders.length} orders total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-[11px] font-bold text-stone-700 uppercase border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Order ID & Date</th>
                  <th className="py-3.5 px-6">Customer Details</th>
                  <th className="py-3.5 px-6">Items Ordered</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-6 font-medium">
                      <span className="font-bold text-stone-900 block text-xs">#{order.id}</span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-stone-900">{order.customerName}</p>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {order.phone}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate max-w-xs mt-0.5">
                        {order.city}, {order.state} - {order.pincode}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <span className="font-semibold text-stone-800 line-clamp-1 max-w-xs">
                              {item.productName}
                            </span>
                            <span className="text-stone-400 text-[11px]">× {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-extrabold text-stone-900 text-sm">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-emerald-700 font-semibold">
                        {order.paymentStatus.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.status === 'shipped'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : order.status === 'processing'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : order.status === 'confirmed'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-stone-100 text-stone-800 border-stone-300'
                        }`}
                      >
                        <option value="placed">1. Placed</option>
                        <option value="confirmed">2. Confirmed</option>
                        <option value="processing">3. Processing</option>
                        <option value="shipped">4. Shipped</option>
                        <option value="delivered">5. Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
