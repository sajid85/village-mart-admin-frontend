'use client';

import { useState, useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Assuming the products endpoint includes stock information
      const response = await fetch('http://localhost:4000/products', {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Product[]> = await response.json();
      // Filter products to include only necessary fields for inventory view
      const inventoryProducts = result.data.map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
      }));
      setProducts(inventoryProducts);
    } catch (err) {
      console.error('Error fetching products for inventory:', err);
      setError((err instanceof Error) ? err.message : 'An error occurred while fetching inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
    } catch (err) {
      console.error('Error saving stock:', err);
      setError((err instanceof Error) ? err.message : 'An error occurred while saving stock.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Inventory Management</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingProduct?.id === product.id ? (
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      className="border border-gray-300 rounded-md shadow-sm p-1 text-sm w-20 text-gray-900"
                      min="0"
                    />
                  ) : (
                    product.stock
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingProduct?.id === product.id ? (
                    <button
                      onClick={handleSaveStock}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditStock(product)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 