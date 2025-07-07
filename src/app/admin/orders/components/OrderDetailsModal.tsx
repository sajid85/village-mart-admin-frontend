import { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import StatusBadge from './StatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onUpdatePaymentStatus: (orderId: string, status: PaymentStatus) => Promise<void>;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
}: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [feedback, setFeedback] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number): string => {
    return Number(price).toFixed(2);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      setStatus(newStatus);
      await onUpdateStatus(order.id, newStatus);
      setFeedback('Order status updated!');
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback('Failed to update status.');
      setStatus(order.status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
    try {
      setIsUpdating(true);
      setPaymentStatus(newStatus);
      await onUpdatePaymentStatus(order.id, newStatus);
      setFeedback('Payment status updated!');
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback('Failed to update payment status.');
      setPaymentStatus(order.paymentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
            <span className="inline-block bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-semibold">Order</span>
            <span>#{order.id.slice(0, 8)}</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Close order details"
            className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="px-6 py-2 text-center text-sm text-white bg-green-500 rounded-b">
            {feedback}
          </div>
        )}

        {/* Main Content */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Info */}
            <section className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Order Information
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Created:</span> <span className="text-gray-900">{formatDate(order.createdAt)}</span></div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Status:</span>
                  <select
                    value={status}
                    onChange={e => handleStatusChange(e.target.value as OrderStatus)}
                    disabled={isUpdating}
                    className="border rounded px-2 py-1 text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    {Object.values(OrderStatus).map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <StatusBadge status={status} />
                  {isUpdating && (
                    <svg className="ml-2 h-5 w-5 animate-spin text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Payment Status:</span>
                  <select
                    value={paymentStatus}
                    onChange={e => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                    disabled={isUpdating}
                    className="border rounded px-2 py-1 text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    {Object.values(PaymentStatus).map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <PaymentStatusBadge status={paymentStatus} />
                  {isUpdating && (
                    <svg className="ml-2 h-5 w-5 animate-spin text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  )}
                </div>
              </div>
            </section>

            {/* Customer Info */}
            <section className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Name:</span> <span className="text-gray-900">{order.user?.firstName} {order.user?.lastName}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="text-gray-900">{order.user?.email}</span></div>
              </div>
            </section>

            {/* Shipping Info */}
            <section className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4M4 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" /></svg>
                Shipping Information
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Address:</span> <span className="text-gray-900">{order.shippingAddress}</span></div>
                {order.trackingNumber && (
                  <div><span className="text-gray-500">Tracking #:</span> <span className="text-gray-900">{order.trackingNumber}</span></div>
                )}
              </div>
            </section>

            {/* Order Summary */}
            <section className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 16v-4" /></svg>
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Subtotal:</span> <span className="text-gray-900">${formatPrice(order.subtotal)}</span></div>
                <div><span className="text-gray-500">Tax:</span> <span className="text-gray-900">${formatPrice(order.tax)}</span></div>
                <div><span className="text-gray-500">Shipping:</span> <span className="text-gray-900">${formatPrice(order.shipping)}</span></div>
                <div className="font-bold text-green-700"><span>Total:</span> <span>${formatPrice(order.total)}</span></div>
              </div>
            </section>
          </div>

          {/* Order Items Table */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
              Order Items
            </h3>
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Product</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Price</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Quantity</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-400">No items in this order.</td>
                    </tr>
                  ) : (
                    order.items.map((item) => (
                      <tr key={item.id} className="even:bg-gray-50 hover:bg-green-50 transition">
                        <td className="px-4 py-2 flex items-center gap-2">
                          {item.product?.imageUrl && (
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-8 h-8 rounded object-cover border" />
                          )}
                          <span>{item.product?.name}</span>
                        </td>
                        <td className="px-4 py-2">${formatPrice(item.price)}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">${formatPrice(item.subtotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-white border-t rounded-b-2xl px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 