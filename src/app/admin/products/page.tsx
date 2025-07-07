'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeImage from '../../../components/SafeImage';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShoppingBagIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Product, CreateProductDto } from './types';
import { Category } from '../categories/types';
import ProductModal from './components/ProductModal';

// Sample data for development/testing when API is down
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Apples',
    description: 'Fresh organic apples from local farms',
    price: 4.99,
    stock: 150,
    category: { id: 'cat-1', name: 'Fruits', slug: 'fruits' },
    sku: 'ORG-APP-001',
    isActive: true,
    imageUrl: '',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Whole Grain Bread',
    description: 'Freshly baked whole grain bread',
    price: 3.49,
    stock: 75,
    category: { id: 'cat-2', name: 'Bakery', slug: 'bakery' },
    sku: 'WG-BREAD-001',
    isActive: true,
    imageUrl: '',
    createdAt: '2024-01-16T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z'
  },
  {
    id: '3',
    name: 'Free Range Eggs',
    description: 'Farm fresh free range eggs (dozen)',
    price: 5.99,
    stock: 200,
    category: { id: 'cat-3', name: 'Dairy', slug: 'dairy' },
    sku: 'FR-EGGS-001',
    isActive: true,
    imageUrl: '',
    createdAt: '2024-01-17T00:00:00Z',
    updatedAt: '2024-01-17T00:00:00Z'
  },
  {
    id: '4',
    name: 'Organic Milk',
    description: 'Fresh organic milk (1 gallon)',
    price: 6.49,
    stock: 50,
    category: { id: 'cat-3', name: 'Dairy', slug: 'dairy' },
    sku: 'ORG-MILK-001',
    isActive: true,
    imageUrl: '',
    createdAt: '2024-01-18T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: '5',
    name: 'Local Honey',
    description: 'Pure local wildflower honey',
    price: 8.99,
    stock: 25,
    category: { id: 'cat-4', name: 'Pantry', slug: 'pantry' },
    sku: 'LOC-HONEY-001',
    isActive: true,
    imageUrl: '',
    createdAt: '2024-01-19T00:00:00Z',
    updatedAt: '2024-01-19T00:00:00Z'
  }
];

const sampleCategories: Category[] = [
  { 
    id: 'cat-1', 
    name: 'Fruits', 
    slug: 'fruits',
    level: 0,
    order: 0,
    isActive: true,
    createdAt: new Date('2024-01-15T00:00:00Z'),
    updatedAt: new Date('2024-01-15T00:00:00Z')
  },
  { 
    id: 'cat-2', 
    name: 'Bakery', 
    slug: 'bakery',
    level: 0,
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-16T00:00:00Z'),
    updatedAt: new Date('2024-01-16T00:00:00Z')
  },
  { 
    id: 'cat-3', 
    name: 'Dairy', 
    slug: 'dairy',
    level: 0,
    order: 2,
    isActive: true,
    createdAt: new Date('2024-01-17T00:00:00Z'),
    updatedAt: new Date('2024-01-17T00:00:00Z')
  },
  { 
    id: 'cat-4', 
    name: 'Pantry', 
    slug: 'pantry',
    level: 0,
    order: 3,
    isActive: true,
    createdAt: new Date('2024-01-18T00:00:00Z'),
    updatedAt: new Date('2024-01-18T00:00:00Z')
  }
];

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we have a token first
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found, using sample data for development');
        setProducts(sampleProducts);
        setIsLoading(false);
        return;
      }
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('http://localhost:4000/products', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You don\'t have permission to view products.');
        } else if (response.status === 404) {
          throw new Error('Products API endpoint not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Product[]> = await response.json();
      
      // Handle different response formats
      let productsData: Product[] = [];
      if (result.data && Array.isArray(result.data)) {
        productsData = result.data;
      } else if (Array.isArray(result)) {
        productsData = result;
      } else {
        console.warn('Unexpected response format:', result);
        productsData = [];
      }
      
      // Ensure price is converted to number
      const productsWithFormattedData = productsData.map(product => ({
        ...product,
        price: Number(product.price)
      }));
      setProducts(productsWithFormattedData);
      
      // Clear any previous errors if successful
      setError(null);
    } catch (error) {
      console.warn('Failed to fetch products from API, using sample data:', error);
      
      // Use more user-friendly error messages
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
      
      // Always use sample data as fallback to ensure the page works
      setProducts(sampleProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found, using sample categories for development');
        setCategories(sampleCategories);
        return;
      }
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('http://localhost:4000/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Category[]> = await response.json();
      setCategories(result.data || []);
    } catch (error) {
      console.warn('Failed to fetch categories from API, using sample data:', error);
      // Use sample categories as fallback
      setCategories(sampleCategories);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authentication required. Please login again.');
          return;
        }

        const response = await fetch(`http://localhost:4000/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete product: ${response.status}`);
        }

        // Update local state
        setProducts(products.filter(product => product.id !== id));
        
        // Show success message if there's no error state
        if (!error) {
          alert('Product deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        if (error instanceof Error && error.message.includes('fetch')) {
          alert('Cannot connect to server. Product deletion is temporarily unavailable.');
        } else {
          alert('Failed to delete product. Please try again later.');
        }
      }
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`http://localhost:4000/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the product in state
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, isActive: !p.isActive } : p
      ));
    } catch (error) {
      console.error('Error toggling product status:', error);
      if (error instanceof Error && error.message.includes('fetch')) {
        alert('Cannot connect to server. Product status update is temporarily unavailable.');
      } else {
        alert('Failed to update product status. Please try again later.');
      }
    }
  };

  const handleSaveProduct = async (productData: CreateProductDto) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const url = selectedProduct
        ? `http://localhost:4000/products/${selectedProduct.id}`
        : 'http://localhost:4000/products';
      
      const method = selectedProduct ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const newProduct = {
        ...result.data,
        price: Number(result.data.price)
      };
      
      if (selectedProduct) {
        setProducts(products.map(p => 
          p.id === selectedProduct.id ? newProduct : p
        ));
      } else {
        setProducts([...products, newProduct]);
      }
      
      setIsModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Product save is temporarily unavailable.');
      }
      throw error;
    }
  };

  const formatPrice = (price: number): string => {
    return Number(price).toFixed(2);
  };

  const filteredProducts = products
    .filter(product => 
      (searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (selectedCategory === '' || product.category.id === selectedCategory)
    )
    .sort((a, b) => {
      const aValue = a[sortBy as keyof Product];
      const bValue = b[sortBy as keyof Product];
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

  // Show error message briefly, but still render the page with sample data
  if (error && products.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4"
        >
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <ExclamationTriangleIcon className="w-8 h-8" />
            <h2 className="text-xl font-semibold">Error Loading Products</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchProducts}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
            >
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setError(null);
                setProducts(sampleProducts);
                setCategories(sampleCategories);
              }}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
            >
              Continue with Sample Data
            </motion.button>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Tip: Make sure your backend server is running on localhost:4000
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-8 p-6">
        {/* Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Products Management
              </h1>
              <p className="text-slate-600 mt-2">Manage your product catalog and inventory</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedProduct(null);
                setIsModalOpen(true);
              }}
              className="flex items-center px-6 py-3 text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add New Product
            </motion.button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Products</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <ShoppingBagIcon className="w-12 h-12 text-blue-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Active Products</p>
                  <p className="text-3xl font-bold">{products.filter(p => p.isActive).length}</p>
                </div>
                <CheckCircleIcon className="w-12 h-12 text-emerald-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Low Stock</p>
                  <p className="text-3xl font-bold">{products.filter(p => p.stock < 10).length}</p>
                </div>
                <ExclamationTriangleIcon className="w-12 h-12 text-amber-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Categories</p>
                  <p className="text-3xl font-bold">{categories.length}</p>
                </div>
                <CubeIcon className="w-12 h-12 text-purple-200" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name, description, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 placeholder-slate-500"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center space-x-4">
              <select
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock">Sort by Stock</option>
                <option value="createdAt">Sort by Date</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200"
              >
                {sortOrder === 'asc' ? (
                  <ArrowUpIcon className="w-5 h-5 mr-2" />
                ) : (
                  <ArrowDownIcon className="w-5 h-5 mr-2" />
                )}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
        >
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBagIcon className="w-24 h-24 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600 mb-2">No products found</h3>
              <p className="text-slate-500">Try adjusting your search criteria or add a new product.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 transition-all duration-200"
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                              <SafeImage
                                src={product.imageUrl || ''}
                                alt={product.name}
                                fill
                                sizes="64px"
                                className="object-cover rounded-2xl"
                                fallback={<ShoppingBagIcon className="w-8 h-8 text-slate-400" />}
                              />
                            </div>
                          </div>
                          <div className="ml-6">
                            <div className="text-lg font-semibold text-slate-900">{product.name}</div>
                            <div className="text-sm text-slate-500 mt-1 max-w-xs truncate">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {product.category.name}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-lg font-semibold text-slate-900">${formatPrice(product.price)}</div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className={`text-lg font-medium ${
                          product.stock < 10 
                            ? 'text-red-600' 
                            : product.stock < 50 
                              ? 'text-amber-600' 
                              : 'text-emerald-600'
                        }`}>
                          {product.stock}
                          {product.stock < 10 && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg inline-block">
                          {product.sku}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          product.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            product.isActive ? 'bg-emerald-400' : 'bg-red-400'
                          }`}></span>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleActive(product)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              product.isActive
                                ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={product.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {product.isActive ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(product)}
                            className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                            title="Edit Product"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                            title="Delete Product"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Product Modal */}
        {isModalOpen && (
          <ProductModal
            product={selectedProduct}
            categories={categories}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedProduct(null);
            }}
            onSave={handleSaveProduct}
          />
        )}
      </div>
    </div>
  );
} 