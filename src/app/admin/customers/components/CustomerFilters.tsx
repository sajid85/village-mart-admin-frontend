import { useState } from 'react';
import { CustomerStatus, OrderStatus, CustomerFilters } from '../types';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CustomerFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: CustomerFilters) => void;
  currentFilters?: CustomerFilters;
}

export default function CustomerFilters({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: CustomerFiltersProps) {
  const [filters, setFilters] = useState<CustomerFilters>(
    currentFilters || {
      dateRange: undefined,
      orderStatus: undefined,
      spendingRange: undefined,
      orderCount: undefined,
      status: undefined,
    }
  );

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      dateRange: undefined,
      orderStatus: undefined,
      spendingRange: undefined,
      orderCount: undefined,
      status: undefined,
    });
    onApplyFilters({});
    onClose();
  };

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-10 overflow-y-auto"
      onClose={onClose}
      open={isOpen}
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
              Advanced Filters
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value,
                      },
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
                />
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        end: e.target.value,
                      },
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Order Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Order Status
              </label>
              <select
                value={filters.orderStatus || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    orderStatus: e.target.value as OrderStatus,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
              >
                <option value="">All</option>
                {Object.values(OrderStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Spending Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Spent Range
              </label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.spendingRange?.min || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      spendingRange: {
                        ...filters.spendingRange,
                        min: Number(e.target.value),
                      },
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.spendingRange?.max || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      spendingRange: {
                        ...filters.spendingRange,
                        max: Number(e.target.value),
                      },
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Order Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Order Count Range
              </label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.orderCount?.min || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      orderCount: {
                        ...filters.orderCount,
                        min: Number(e.target.value),
                      },
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.orderCount?.max || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      orderCount: {
                        ...filters.orderCount,
                        max: Number(e.target.value),
                      },
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Customer Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as CustomerStatus,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 sm:text-sm text-gray-900"
              >
                <option value="">All</option>
                {Object.values(CustomerStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
              onClick={handleApply}
            >
              Apply Filters
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
              onClick={handleClear}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 