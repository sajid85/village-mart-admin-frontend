import { useState, useEffect } from 'react';
import { Product, CreateProductDto } from '../types';
import { Category } from '../../categories/types';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (productData: CreateProductDto) => Promise<void>;
}

export default function ProductModal({ product, categories, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState<CreateProductDto>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    imageUrl: product?.imageUrl || '',
    categoryId: product?.category?.id || '',
    sku: product?.sku || '',
    isActive: product?.isActive ?? true,
    brand: product?.brand || '',
    weight: product?.weight || 0,
    dimensions: product?.dimensions || '',
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setValidationError('Name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setValidationError('Description is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setValidationError('Price must be greater than 0');
      return false;
    }
    if (!formData.stock || formData.stock < 0) {
      setValidationError('Stock cannot be negative');
      return false;
    }
    if (!formData.categoryId) {
      setValidationError('Category is required');
      return false;
    }
    if (!formData.sku.trim()) {
      setValidationError('SKU is required');
      return false;
    }
    // Image URL is optional, no validation needed
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      // Ensure numeric values are properly converted
      const submissionData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        weight: formData.weight ? Number(formData.weight) : undefined,
        // Only include imageUrl if it exists and is not empty
        imageUrl: formData.imageUrl || undefined
      };
      await onSave(submissionData);
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setValidationError(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, field: keyof CreateProductDto) => {
    const value = e.target.value;
    if (value === '') {
      setFormData({ ...formData, [field]: 0 });
    } else {
      const numValue = field === 'price' || field === 'weight' ? parseFloat(value) : parseInt(value);
      if (!isNaN(numValue)) {
        setFormData({ ...formData, [field]: numValue });
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setValidationError('Please select a valid image file (jpg, jpeg, png, gif)');
      e.target.value = ''; // Reset file input
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setValidationError('File size should not exceed 5MB');
      e.target.value = ''; // Reset file input
      return;
    }

    try {
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the file
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:4000/products/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const result = await response.json();
      if (result.path) {
        setFormData(prev => ({
          ...prev,
          imageUrl: `http://localhost:4000${result.path}`
        }));
        setValidationError(null);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setValidationError(error.message || 'Failed to upload image. Please try again.');
      setImagePreview(null);
      e.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {product ? 'Edit Product' : 'Add Product'}
              </h3>
              
              {validationError && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {validationError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                      value={formData.price}
                      onChange={(e) => handleNumberInput(e, 'price')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                      value={formData.stock}
                      onChange={(e) => handleNumberInput(e, 'stock')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="text"
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Optional image URL"
                    />
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md text-sm">
                      Browse...
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Image Preview" className="max-h-32 object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                      value={formData.brand || ''}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                      value={formData.weight || ''}
                      onChange={(e) => handleNumberInput(e, 'weight')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                  <input
                    type="text"
                    placeholder="e.g., 10x20x30 cm"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                    value={formData.dimensions || ''}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  />
                </div>

                {/* SEO Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                    value={formData.metaTitle || ''}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                  <textarea
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                    value={formData.metaDescription || ''}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  />
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Product is active
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 