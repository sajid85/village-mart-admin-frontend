'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  PencilIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  CubeIcon,
  ShoppingBagIcon,
  ExclamationCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price?: number;
  category?: string;
  description?: string;
  imageUrl?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

type ViewMode = 'table' | 'cards';
type StockFilter = 'all' | 'low' | 'out' | 'in-stock';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchProducts = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      console.log('🔄 Fetching products from API...');
      
      const response = await fetch('http://localhost:4000/products', {
        headers: getAuthHeaders(),
      });
      
      console.log('📡 Products API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Products API Error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Product[]> = await response.json();
      console.log('✅ Products API Success:', result);
      console.log('📦 Number of products received:', result.data?.length || 0);
      
      if (result.data && result.data.length > 0) {
        console.log('🏷️ Sample product:', result.data[0]);
      }
      
      setProducts(result.data || []);
    } catch (err) {
      console.error('❌ Error fetching products for inventory:', err);
      setError((err instanceof Error) ? err.message : 'An error occurred while fetching inventory.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter and search functions
  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStockFilter = stockFilter === 'all' || 
      (stockFilter === 'out' && product.stock === 0) ||
      (stockFilter === 'low' && product.stock > 0 && product.stock <= 10) ||
      (stockFilter === 'in-stock' && product.stock > 10);
    
    return matchesSearch && matchesStockFilter;
  });

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    totalValue: products.reduce((sum, product) => {
      const price = parseFloat(String(product.price || 0));
      return sum + (isNaN(price) ? 0 : price * product.stock);
    }, 0),
    inStock: products.filter(p => p.stock > 10).length
  };

  const handleEditStock = (product: Product) => {
    setEditingProduct(product);
    setNewStock(product.stock);
  };

  const handleSaveStock = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`http://localhost:4000/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stock: newStock }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update stock for ${editingProduct.name}`);
      }

      // Update the product list with the new stock value
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...p, stock: newStock } : p
      ));

      setEditingProduct(null);
      setUpdateSuccess(`Stock updated successfully for ${editingProduct.name}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving stock:', err);
      setError((err instanceof Error) ? err.message : 'An error occurred while saving stock.');
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewStock(0);
  };

  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  const formatPrice = (price: number): string => {
    const numericPrice = parseFloat(price?.toString() || '0');
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-64"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded w-32"></div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
              ))}
            </div>
            
            {/* Content skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <ExclamationTriangleIcon className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Inventory</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts()}
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Success Alert */}
        {updateSuccess && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
              <div className="text-sm text-green-700">{updateSuccess}</div>
              <button
                onClick={() => setUpdateSuccess(null)}
                className="ml-auto text-green-400 hover:text-green-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Inventory Management
            </h1>
            <p className="text-gray-600">
              Monitor and manage product stock levels across your store
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => fetchProducts(true)}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <CubeIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <ExclamationCircleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${formatPrice(stats.totalValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>

                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'table' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'cards' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                </div>
                
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} of {products.length} products
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || stockFilter !== 'all' 
                  ? 'No products found' 
                  : 'No products yet'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || stockFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Products will appear here once you add them to your inventory.'
                }
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.imageUrl ? (
                                <div className="relative h-10 w-10 rounded-lg overflow-hidden">
                                  <Image 
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                                  <ShoppingBagIcon className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              {product.category && (
                                <div className="text-sm text-gray-500">
                                  {product.category}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingProduct?.id === product.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={newStock}
                                onChange={(e) => setNewStock(Number(e.target.value))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                min="0"
                                autoFocus
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={handleSaveStock}
                                  className="inline-flex items-center p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="inline-flex items-center p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="font-medium">{product.stock}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockBadgeColor(product.stock)}`}>
                            {getStockStatusText(product.stock)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.price ? `$${formatPrice(product.price)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingProduct?.id === product.id ? (
                            <span className="text-gray-400">Editing...</span>
                          ) : (
                            <button
                              onClick={() => handleEditStock(product)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Edit Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards View */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-emerald-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {product.imageUrl ? (
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                              <Image 
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                              <ShoppingBagIcon className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stock Level</span>
                        {editingProduct?.id === product.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={newStock}
                              onChange={(e) => setNewStock(Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              min="0"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={handleSaveStock}
                                className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                              >
                                <CheckCircleIcon className="w-3 h-3" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-lg font-semibold text-gray-900">{product.stock}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStockBadgeColor(product.stock)}`}>
                          {getStockStatusText(product.stock)}
                        </span>
                      </div>
                      
                      {product.price && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unit Price</span>
                          <span className="text-sm font-medium text-gray-900">
                            ${formatPrice(product.price)}
                          </span>
                        </div>
                      )}
                      
                      {product.price && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Value</span>
                          <span className="text-sm font-medium text-emerald-600">
                            ${formatPrice(product.price * product.stock)}
                          </span>
                        </div>
                      )}
                    </div>

                    {editingProduct?.id === product.id ? (
                      <div className="text-center text-xs text-gray-500">Editing stock level...</div>
                    ) : (
                      <button
                        onClick={() => handleEditStock(product)}
                        className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                      >
                        <PencilIcon className="w-4 h-4 inline mr-2" />
                        Edit Stock
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}