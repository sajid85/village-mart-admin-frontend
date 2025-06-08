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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
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

  const handleStatusChange = async (status: OrderStatus) => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(order.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (status: PaymentStatus) => {
    try {
      setIsUpdating(true);
      await onUpdatePaymentStatus(order.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">
                Order Details #{order.id.slice(0, 8)}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {/* Order Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Order Information</h4>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Created: </span>
                    <span className="text-sm text-gray-900">{formatDate(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status: </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                      disabled={isUpdating}
                      className="ml-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 text-gray-900"
                    >
                      {Object.values(OrderStatus).map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Payment Status: </span>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                      disabled={isUpdating}
                      className="ml-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 text-gray-900"
                    >
                      {Object.values(PaymentStatus).map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Customer Information</h4>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Name: </span>
                    <span className="text-sm text-gray-900">
                      {order.user.firstName} {order.user.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email: </span>
                    <span className="text-sm text-gray-900">{order.user.email}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Shipping Information</h4>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Address: </span>
                    <span className="text-sm text-gray-900">{order.shippingAddress}</span>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <span className="text-sm text-gray-500">Tracking Number: </span>
                      <span className="text-sm text-gray-900">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Order Summary</h4>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Subtotal: </span>
                    <span className="text-sm text-gray-900">${formatPrice(order.subtotal)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tax: </span>
                    <span className="text-sm text-gray-900">${formatPrice(order.tax)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Shipping: </span>
                    <span className="text-sm text-gray-900">${formatPrice(order.shipping)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Total: </span>
                    <span className="text-sm font-medium text-gray-900">${formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Order Items</h4>
              <div className="mt-2">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={item.product.imageUrl || '/placeholder-product.png'}
                                alt={item.product.name}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-product.png';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.product.name}
                              </div>
                              <div className="text-sm text-gray-500">SKU: {item.product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${formatPrice(item.price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${formatPrice(item.subtotal)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 