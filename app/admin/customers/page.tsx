'use client';

import { useState, useEffect } from 'react';
import { Customer, CustomerStats, CreateCustomerDto, UpdateCustomerDto } from './types';
import CustomerForm from './components/CustomerForm';
import CustomerDetailsModal from './components/CustomerDetailsModal';
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/20/solid';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type SortField = 'firstName' | 'lastName' | 'email' | 'createdAt' | 'totalOrders' | 'totalSpent';
type SortOrder = 'asc' | 'desc';

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchCustomers = async () => {
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
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {deleteError && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
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
        <div className="mb-4 rounded-md bg-green-50 p-4">
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

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Back
            </button>
            <div>
              <h1 className="text-base font-semibold leading-6 text-gray-900">Customers</h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all customers including their name, email, and order statistics.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add Customer
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center">
          <div className="relative rounded-md shadow-sm max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Search customers"
            />
          </div>
        </div>

        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        <button
                          onClick={() => handleSort('firstName')}
                          className="group inline-flex items-center"
                        >
                          Name
                          <span className="ml-2 flex-none rounded text-gray-400">
                            <SortIcon field="firstName" />
                          </span>
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        <button
                          onClick={() => handleSort('email')}
                          className="group inline-flex items-center"
                        >
                          Email
                          <span className="ml-2 flex-none rounded text-gray-400">
                            <SortIcon field="email" />
                          </span>
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        <button
                          onClick={() => handleSort('totalOrders')}
                          className="group inline-flex items-center"
                        >
                          Total Orders
                          <span className="ml-2 flex-none rounded text-gray-400">
                            <SortIcon field="totalOrders" />
                          </span>
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        <button
                          onClick={() => handleSort('totalSpent')}
                          className="group inline-flex items-center"
                        >
                          Total Spent
                          <span className="ml-2 flex-none rounded text-gray-400">
                            <SortIcon field="totalSpent" />
                          </span>
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="group inline-flex items-center"
                        >
                          Member Since
                          <span className="ml-2 flex-none rounded text-gray-400">
                            <SortIcon field="createdAt" />
                          </span>
                        </button>
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : sortedCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          No customers found
                        </td>
                      </tr>
                    ) : (
                      sortedCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="hover:bg-gray-50"
                        >
                          <td 
                            className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 cursor-pointer"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            {customer.firstName} {customer.lastName}
                          </td>
                          <td 
                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 cursor-pointer"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            {customer.email}
                          </td>
                          <td 
                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 cursor-pointer"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            {customer.stats.totalOrders || 0}
                          </td>
                          <td 
                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 cursor-pointer"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            ${formatCurrency(Number(customer.stats.totalSpent) || 0)}
                          </td>
                          <td 
                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 cursor-pointer"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            {formatDate(customer.createdAt)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
                                  handleDeleteCustomer(customer.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
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