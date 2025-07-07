'use client';

import { useState, useEffect, useCallback } from 'react';
import { Customer, CustomerStats, CreateCustomerDto, UpdateCustomerDto } from './types';
import CustomerForm from './components/CustomerForm';
import CustomerDetailsModal from './components/CustomerDetailsModal';
import { 
  MagnifyingGlassIcon, 
  TrashIcon, 
  UserGroupIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  TableCellsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type SortField = 'firstName' | 'lastName' | 'email' | 'createdAt' | 'totalOrders' | 'totalSpent';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'cards';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<(Customer & { stats: CustomerStats })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer & { stats: CustomerStats } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/customers', {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch customers');
      }
      
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreateCustomer = async (data: CreateCustomerDto) => {
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create customer');
      }

      await fetchCustomers();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  };

  const handleUpdateCustomer = async (customerId: string, data: UpdateCustomerDto) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update customer');
      }

      await fetchCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    setDeleteError(null);
    setDeleteSuccess(null);
    
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete customer');
      }

      await fetchCustomers();
      setDeleteSuccess(data.message || 'Customer deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting customer:', err);
      setDeleteError(err instanceof Error ? err.message : 'An error occurred while deleting the customer');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setDeleteError(null);
      }, 3000);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(searchLower) ||
      customer.lastName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (value: number): string => {
    return Number(value).toFixed(2);
  };

  // Calculate customer stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => (c.stats.totalOrders || 0) > 0).length;
  const totalRevenue = customers.reduce((sum, customer) => {
    const spent = parseFloat(String(customer.stats.totalSpent || 0));
    return sum + (isNaN(spent) ? 0 : spent);
  }, 0);
  const avgOrderValue = customers.length > 0 
    ? customers.reduce((sum, customer) => {
        const orders = customer.stats.totalOrders || 0;
        const spent = parseFloat(String(customer.stats.totalSpent || 0));
        if (orders > 0 && !isNaN(spent)) {
          return sum + (spent / orders);
        }
        return sum;
      }, 0) / customers.filter(c => (c.stats.totalOrders || 0) > 0).length
    : 0;

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'totalOrders') {
      comparison = (a.stats.totalOrders || 0) - (b.stats.totalOrders || 0);
    } else if (sortField === 'totalSpent') {
      comparison = (Number(a.stats.totalSpent) || 0) - (Number(b.stats.totalSpent) || 0);
    } else {
      comparison = String(a[sortField]).localeCompare(String(b[sortField]));
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return sortOrder === 'asc' ? (
      <ChevronUpIcon className="h-5 w-5" />
    ) : (
      <ChevronDownIcon className="h-5 w-5" />
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alerts */}
        {deleteError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{deleteError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteSuccess && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{deleteSuccess}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage customer accounts and view their order statistics
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <UserGroupIcon className="h-4 w-4 mr-2" />
                Add Customer
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCartIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Customers</h3>
                <p className="text-2xl font-bold text-gray-900">{activeCustomers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-bold text-gray-900">
                  ${isNaN(totalRevenue) ? '0.00' : totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
                <p className="text-2xl font-bold text-gray-900">
                  ${isNaN(avgOrderValue) ? '0.00' : avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search customers by name or email..."
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TableCellsIcon className="h-4 w-4 inline mr-1" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4 inline mr-1" />
                  Cards
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>
              Showing {sortedCustomers.length} of {customers.length} customers
            </span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading customers...</p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => handleSort('firstName')}
                        className="group inline-flex items-center hover:text-gray-700"
                      >
                        Customer
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-700">
                          <SortIcon field="firstName" />
                        </span>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => handleSort('email')}
                        className="group inline-flex items-center hover:text-gray-700"
                      >
                        Email
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-700">
                          <SortIcon field="email" />
                        </span>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => handleSort('totalOrders')}
                        className="group inline-flex items-center hover:text-gray-700"
                      >
                        Orders
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-700">
                          <SortIcon field="totalOrders" />
                        </span>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => handleSort('totalSpent')}
                        className="group inline-flex items-center hover:text-gray-700"
                      >
                        Total Spent
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-700">
                          <SortIcon field="totalSpent" />
                        </span>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="group inline-flex items-center hover:text-gray-700"
                      >
                        Member Since
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-700">
                          <SortIcon field="createdAt" />
                        </span>
                      </button>
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-900 font-medium">No customers found</p>
                        <p>Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  ) : (
                    sortedCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-700">
                                {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {customer.stats.totalOrders || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          ${formatCurrency(Number(customer.stats.totalSpent) || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(customer.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
                                handleDeleteCustomer(customer.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCustomers.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-900 font-medium">No customers found</p>
                  <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                </div>
              </div>
            ) : (
              sortedCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-blue-700">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
                          handleDeleteCustomer(customer.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Orders</dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">
                        {customer.stats.totalOrders || 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Spent</dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">
                        ${formatCurrency(Number(customer.stats.totalSpent) || 0)}
                      </dd>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Member since {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CustomerForm
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCustomer}
        />
      )}

      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdate={handleUpdateCustomer}
          onDelete={handleDeleteCustomer}
        />
      )}
    </div>
  );
} 