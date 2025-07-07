import { useState } from 'react';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Customer, CustomerStats, CustomerExportOptions } from '../types';

interface CustomerBulkActionsProps {
  selectedCustomers: (Customer & { stats: CustomerStats })[];
  onBulkDelete: (customerIds: string[]) => Promise<void>;
  onExport: (options: CustomerExportOptions) => Promise<void>;
}

export default function CustomerBulkActions({
  selectedCustomers,
  onBulkDelete,
  onExport,
}: CustomerBulkActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDelete = async () => {
    if (!selectedCustomers.length) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedCustomers.length} customers? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onBulkDelete(selectedCustomers.map(c => c.id));
    } catch (error) {
      console.error('Error deleting customers:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async (includeOrders: boolean) => {
    if (!selectedCustomers.length) return;

    setIsExporting(true);
    try {
      await onExport({
        includeOrders,
        fields: [
          'id',
          'email',
          'firstName',
          'lastName',
          'createdAt',
          'status',
          'totalOrders',
          'totalSpent',
          'averageOrderValue',
          'lastOrderDate',
        ],
      });
    } catch (error) {
      console.error('Error exporting customers:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (selectedCustomers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-700">
        {selectedCustomers.length} selected
      </span>

      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Actions
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </Menu.Button>

        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleExport(false)}
                  disabled={isExporting}
                  className={`
                    ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                    block w-full px-4 py-2 text-left text-sm
                  `}
                >
                  {isExporting ? 'Exporting...' : 'Export Basic Info'}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleExport(true)}
                  disabled={isExporting}
                  className={`
                    ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                    block w-full px-4 py-2 text-left text-sm
                  `}
                >
                  {isExporting ? 'Exporting...' : 'Export with Orders'}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className={`
                    ${active ? 'bg-red-50 text-red-900' : 'text-red-700'}
                    block w-full px-4 py-2 text-left text-sm
                  `}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Selected'}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>
    </div>
  );
} 