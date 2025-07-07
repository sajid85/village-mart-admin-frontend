'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CubeIcon,
  ChartBarIcon,
  BellIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// Types for inventory
interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  movements: StockMovement[];
}

interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  timestamp: string;
  userId: string;
  reference?: string;
}

interface StockAdjustment {
  productId: string;
  newQuantity: number;
  reason: string;
  type: 'increase' | 'decrease' | 'set';
}

// Sample inventory data
const sampleInventoryData: InventoryItem[] = [
  {
    id: '1',
    productId: 'prod-1',
    productName: 'Organic Apples',
    productSku: 'ORG-APP-001',
    category: 'Fruits',
    currentStock: 45,
    minStockLevel: 20,
    maxStockLevel: 200,
    reorderPoint: 30,
    unitCost: 2.50,
    totalValue: 112.50,
    supplier: 'Local Farm Co.',
    location: 'A1-B3',
    lastUpdated: '2024-06-28T10:30:00Z',
    status: 'in_stock',
    movements: [
      {
        id: 'mov-1',
        type: 'in',
        quantity: 50,
        reason: 'Stock replenishment',
        timestamp: '2024-06-27T14:00:00Z',
        userId: 'user-1',
        reference: 'PO-2024-001'
      },
      {
        id: 'mov-2',
        type: 'out',
        quantity: 5,
        reason: 'Customer sale',
        timestamp: '2024-06-28T09:15:00Z',
        userId: 'user-2'
      }
    ]
  },
  {
    id: '2',
    productId: 'prod-2',
    productName: 'Whole Grain Bread',
    productSku: 'WG-BREAD-001',
    category: 'Bakery',
    currentStock: 12,
    minStockLevel: 15,
    maxStockLevel: 100,
    reorderPoint: 20,
    unitCost: 1.75,
    totalValue: 21.00,
    supplier: 'Artisan Bakery',
    location: 'B2-C1',
    lastUpdated: '2024-06-28T08:45:00Z',
    status: 'low_stock',
    movements: [
      {
        id: 'mov-3',
        type: 'out',
        quantity: 8,
        reason: 'Customer sale',
        timestamp: '2024-06-28T08:45:00Z',
        userId: 'user-2'
      }
    ]
  },
  {
    id: '3',
    productId: 'prod-3',
    productName: 'Free Range Eggs',
    productSku: 'FR-EGGS-001',
    category: 'Dairy',
    currentStock: 0,
    minStockLevel: 10,
    maxStockLevel: 150,
    reorderPoint: 15,
    unitCost: 4.00,
    totalValue: 0.00,
    supplier: 'Happy Farms',
    location: 'C1-D2',
    lastUpdated: '2024-06-27T16:20:00Z',
    status: 'out_of_stock',
    movements: [
      {
        id: 'mov-4',
        type: 'out',
        quantity: 15,
        reason: 'Customer sale',
        timestamp: '2024-06-27T16:20:00Z',
        userId: 'user-2'
      }
    ]
  },
  {
    id: '4',
    productId: 'prod-4',
    productName: 'Organic Milk',
    productSku: 'ORG-MILK-001',
    category: 'Dairy',
    currentStock: 85,
    minStockLevel: 25,
    maxStockLevel: 80,
    reorderPoint: 35,
    unitCost: 3.25,
    totalValue: 276.25,
    supplier: 'Green Valley Dairy',
    location: 'C2-D1',
    lastUpdated: '2024-06-28T11:00:00Z',
    status: 'overstocked',
    movements: [
      {
        id: 'mov-5',
        type: 'in',
        quantity: 60,
        reason: 'Bulk purchase',
        timestamp: '2024-06-28T11:00:00Z',
        userId: 'user-1',
        reference: 'PO-2024-002'
      }
    ]
  },
  {
    id: '5',
    productId: 'prod-5',
    productName: 'Local Honey',
    productSku: 'LOC-HONEY-001',
    category: 'Pantry',
    currentStock: 35,
    minStockLevel: 10,
    maxStockLevel: 60,
    reorderPoint: 15,
    unitCost: 6.50,
    totalValue: 227.50,
    supplier: 'Bee Happy Farms',
    location: 'D1-E2',
    lastUpdated: '2024-06-26T14:30:00Z',
    status: 'in_stock',
    movements: [
      {
        id: 'mov-6',
        type: 'in',
        quantity: 25,
        reason: 'New shipment',
        timestamp: '2024-06-26T14:30:00Z',
        userId: 'user-1',
        reference: 'PO-2024-003'
      }
    ]
  }
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('productName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentData, setAdjustmentData] = useState<StockAdjustment>({
    productId: '',
    newQuantity: 0,
    reason: '',
    type: 'set'
  });

  useEffect(() => {
    fetchInventoryData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInventoryData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found, using sample data for development');
        setInventory(sampleInventoryData);
        setIsLoading(false);
        return;
      }

      console.log('🔍 Attempting to fetch inventory data from API...');

      // Try multiple possible endpoints for inventory data
      const endpoints = [
        'http://localhost:4000/inventory',
        'http://localhost:4000/products', // Fallback to products if inventory endpoint doesn't exist
        'http://localhost:4000/api/inventory',
        'http://localhost:4000/api/products'
      ];

      let successfulResponse = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          // Create AbortController for timeout handling
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Success! Got data from:', endpoint);
            console.log('📦 Response structure:', {
              hasData: !!result.data,
              isArray: Array.isArray(result.data || result),
              itemCount: (result.data || result || []).length
            });
            
            successfulResponse = result;
            break;
          } else {
            console.log(`❌ ${endpoint} responded with status: ${response.status}`);
            if (response.status === 401) {
              throw new Error('Authentication failed. Please login again.');
            }
          }
        } catch (error) {
          console.log(`❌ ${endpoint} failed:`, error instanceof Error ? error.message : 'Unknown error');
          lastError = error;
          continue;
        }
      }

      if (successfulResponse) {
        // Handle different response formats
        let inventoryData: InventoryItem[] = [];
        const rawData = successfulResponse.data || successfulResponse || [];
        
        if (Array.isArray(rawData)) {
          // Convert products data to inventory format if needed
          inventoryData = rawData.map((item: Record<string, unknown>, index: number): InventoryItem => {
            // If it's already in inventory format, use as is
            if (typeof item.currentStock === 'number') {
              return {
                ...item,
                status: getItemStatus(
                  item.currentStock as number, 
                  (item.minStockLevel as number) || 10, 
                  (item.maxStockLevel as number) || 100
                )
              } as InventoryItem;
            }
            
            // If it's product data, convert to inventory format
            const stock = (item.stock as number) || (item.quantity as number) || 0;
            const price = Number(item.price) || 0;
            const category = typeof item.category === 'object' && item.category !== null 
              ? (item.category as Record<string, unknown>).name as string
              : item.category as string;
            
            return {
              id: (item.id as string) || `inv-${index}`,
              productId: (item.id as string) || `prod-${index}`,
              productName: (item.name as string) || 'Unknown Product',
              productSku: (item.sku as string) || `SKU-${index}`,
              category: category || 'Uncategorized',
              currentStock: stock,
              minStockLevel: (item.minStock as number) || 10,
              maxStockLevel: (item.maxStock as number) || 100,
              reorderPoint: (item.reorderPoint as number) || 20,
              unitCost: price,
              totalValue: price * stock,
              supplier: (item.supplier as string) || 'Unknown Supplier',
              location: (item.location as string) || 'A1-B1',
              lastUpdated: (item.updatedAt as string) || (item.lastUpdated as string) || new Date().toISOString(),
              status: getItemStatus(stock, (item.minStock as number) || 10, (item.maxStock as number) || 100),
              movements: (item.movements as StockMovement[]) || []
            };
          });
        }

        console.log(`📊 Processed ${inventoryData.length} inventory items`);
        setInventory(inventoryData);
        setError(null);
      } else {
        throw lastError || new Error('All API endpoints failed');
      }
      
    } catch (error) {
      console.warn('Failed to fetch inventory from API, using sample data:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('🔌 API server not responding. Using sample data for development.');
        } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          setError('🔌 API server offline. Using sample data for development.');
        } else if (error.message.includes('Authentication failed')) {
          setError('🔐 Session expired. Please login again. Using sample data for now.');
        } else {
          setError('⚠️ ' + error.message + ' Using sample data for development.');
        }
      } else {
        setError('⚠️ Network error. Using sample data for development.');
      }

      setInventory(sampleInventoryData);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine item status
  const getItemStatus = (currentStock: number, minStock: number, maxStock: number): 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked' => {
    if (currentStock === 0) return 'out_of_stock';
    if (currentStock <= minStock) return 'low_stock';
    if (currentStock > maxStock) return 'overstocked';
    return 'in_stock';
  };

  const handleStockAdjustment = async (adjustment: StockAdjustment) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`http://localhost:4000/inventory/${adjustment.productId}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adjustment),
      });

      if (!response.ok) {
        throw new Error(`Failed to adjust stock: ${response.status}`);
      }

      // Update local state
      setInventory(prev => prev.map(item => {
        if (item.productId === adjustment.productId) {
          const newQuantity = adjustment.type === 'set' 
            ? adjustment.newQuantity
            : adjustment.type === 'increase'
            ? item.currentStock + adjustment.newQuantity
            : item.currentStock - adjustment.newQuantity;

          const newStatus = newQuantity === 0 
            ? 'out_of_stock'
            : newQuantity <= item.minStockLevel
            ? 'low_stock'
            : newQuantity > item.maxStockLevel
            ? 'overstocked'
            : 'in_stock';

          return {
            ...item,
            currentStock: Math.max(0, newQuantity),
            totalValue: Math.max(0, newQuantity) * item.unitCost,
            status: newStatus,
            lastUpdated: new Date().toISOString(),
            movements: [{
              id: `mov-${Date.now()}`,
              type: adjustment.type === 'increase' ? 'in' : 'out',
              quantity: adjustment.newQuantity,
              reason: adjustment.reason,
              timestamp: new Date().toISOString(),
              userId: 'current-user'
            }, ...item.movements]
          };
        }
        return item;
      }));

      setShowAdjustmentModal(false);
      setSelectedItem(null);
      alert('Stock adjusted successfully!');
    } catch (error) {
      console.error('Error adjusting stock:', error);
      if (error instanceof Error && error.message.includes('fetch')) {
        alert('Cannot connect to server. Stock adjustment is temporarily unavailable.');
      } else {
        alert('Failed to adjust stock. Please try again later.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100';
      case 'low_stock': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      case 'overstocked': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return CheckCircleIcon;
      case 'low_stock': return ExclamationTriangleIcon;
      case 'out_of_stock': return XCircleIcon;
      case 'overstocked': return ArrowUpTrayIcon;
      default: return CubeIcon;
    }
  };

  const categories = [...new Set(inventory.map(item => item.category))];
  const statuses = ['in_stock', 'low_stock', 'out_of_stock', 'overstocked'];

  const filteredInventory = inventory
    .filter(item => 
      (searchTerm === '' || 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (selectedCategory === '' || item.category === selectedCategory) &&
      (selectedStatus === '' || item.status === selectedStatus)
    )
    .sort((a, b) => {
      const aValue = a[sortBy as keyof InventoryItem];
      const bValue = b[sortBy as keyof InventoryItem];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  // Calculate summary statistics
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.status === 'low_stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'out_of_stock').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Inventory Management
            </h1>
            <p className="text-gray-600">
              Monitor stock levels, track movements, and manage inventory efficiently
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchInventoryData}
            className="mt-4 sm:mt-0 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Refresh Data
          </motion.button>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <BellIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Summary Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <CubeIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              </div>
              <XCircleIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, SKU, supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="productName-asc">Name A-Z</option>
              <option value="productName-desc">Name Z-A</option>
              <option value="currentStock-asc">Stock Low-High</option>
              <option value="currentStock-desc">Stock High-Low</option>
              <option value="totalValue-desc">Value High-Low</option>
              <option value="lastUpdated-desc">Recently Updated</option>
            </select>
          </div>
        </motion.div>

        {/* Inventory Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item, index) => {
                  const StatusIcon = getStatusIcon(item.status);
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-500">SKU: {item.productSku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.currentStock} units</div>
                        <div className="text-xs text-gray-500">
                          Min: {item.minStockLevel} | Max: {item.maxStockLevel}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${item.totalValue.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">${item.unitCost.toFixed(2)}/unit</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedItem(item);
                              setAdjustmentData({
                                productId: item.productId,
                                newQuantity: item.currentStock,
                                reason: '',
                                type: 'set'
                              });
                              setShowAdjustmentModal(true);
                            }}
                            className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
                            title="Adjust Stock"
                          >
                            <AdjustmentsHorizontalIcon className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No inventory items found matching your criteria.</p>
            </div>
          )}
        </motion.div>

        {/* Stock Adjustment Modal */}
        {showAdjustmentModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Adjust Stock - {selectedItem.productName}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stock: {selectedItem.currentStock} units
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustmentData.type}
                    onChange={(e) => setAdjustmentData({...adjustmentData, type: e.target.value as 'increase' | 'decrease' | 'set'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="set">Set to specific amount</option>
                    <option value="increase">Increase stock</option>
                    <option value="decrease">Decrease stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {adjustmentData.type === 'set' ? 'New Stock Level' : 'Quantity to ' + adjustmentData.type.charAt(0).toUpperCase() + adjustmentData.type.slice(1)}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={adjustmentData.newQuantity}
                    onChange={(e) => setAdjustmentData({...adjustmentData, newQuantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Adjustment
                  </label>
                  <input
                    type="text"
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                    placeholder="e.g., Damaged goods, Manual count correction"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStockAdjustment(adjustmentData)}
                    disabled={!adjustmentData.reason.trim()}
                    className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Adjustment
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAdjustmentModal(false);
                      setSelectedItem(null);
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
