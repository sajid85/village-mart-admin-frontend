import { useState } from 'react';
import { Customer, CustomerStats, OrderStatus } from '../types';
import { formatDate } from '@/lib/utils';

interface CustomerDetailsModalProps {
  customer: Customer & { stats: CustomerStats };
  onClose: () => void;
  onUpdate: (customerId: string, data: { firstName: string; lastName: string; email: string }) => Promise<void>;
  onDelete: (customerId: string) => Promise<void>;
}

export default function CustomerDetailsModal({
  customer,
  onClose,
  onUpdate,
  onDelete,
}: CustomerDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
  });

  const handleUpdate = async () => {
    setError(null);
    setLoading(true);
    try {
      // Only send the fields that have changed
      const changedFields = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== customer[key as keyof typeof customer]) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      if (Object.keys(changedFields).length === 0) {
        setIsEditing(false);
        return;
      }

      await onUpdate(customer.id, changedFields);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating');
      console.error('Error updating customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onDelete(customer.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return Number(value).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Customer Details
                </h3>
                <button
                  onClick={onClose}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Back
                </button>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{customer.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{customer.lastName}</p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Statistics</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Orders</dt>
                      <dd className="mt-1 text-sm text-gray-900">{customer.stats.totalOrders || 0}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Spent</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        ${formatCurrency(Number(customer.stats.totalSpent) || 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Average Order Value</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        ${formatCurrency(Number(customer.stats.averageOrderValue) || 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Order</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.stats.lastOrderDate ? formatDate(customer.stats.lastOrderDate) : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {customer.orders && customer.orders.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Orders</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Order ID
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Date
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Status
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {customer.orders.map((order) => (
                            <tr key={order.id}>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900">
                                {order.id}
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900">
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm">
                                <span
                                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                    order.status === OrderStatus.COMPLETED
                                      ? 'bg-green-100 text-green-800'
                                      : order.status === OrderStatus.PENDING
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : order.status === OrderStatus.CANCELLED
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900">
                                ${formatCurrency(Number(order.total) || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={loading}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: customer.firstName,
                          lastName: customer.lastName,
                          email: customer.email,
                        });
                      }}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                    >
                      Edit Customer
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-red-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    >
                      Delete Customer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 