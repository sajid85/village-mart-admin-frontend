import { useState } from 'react';
import { motion } from 'framer-motion';
import SafeImage from '../../../../components/SafeImage';
import { XMarkIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';
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
      setValidationError((error as Error).message || 'Failed to save product');
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
      setValidationError((error as Error).message || 'Failed to upload image. Please try again.');
      setImagePreview(null);
      e.target.value = ''; // Reset file input
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {product ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-emerald-100 mt-1">
                    {product ? 'Update product information' : 'Create a new product for your store'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-sm font-bold">!</span>
                    </div>
                    <span>{validationError}</span>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Product Name *</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter product name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                          <textarea
                            required
                            rows={4}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your product"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Price *</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                required
                                min="0"
                                className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                value={formData.price}
                                onChange={(e) => handleNumberInput(e, 'price')}
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Stock Quantity *</label>
                            <input
                              type="number"
                              required
                              min="0"
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                              value={formData.stock}
                              onChange={(e) => handleNumberInput(e, 'stock')}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                          <select
                            required
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
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
                          <label className="block text-sm font-medium text-slate-700 mb-2">SKU *</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 font-mono"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="SKU123456"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Image and Additional Info */}
                  <div className="space-y-6">
                    {/* Product Image */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Product Image</h4>
                      
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-white">
                          {imagePreview ? (
                            <div className="space-y-4">
                              <SafeImage 
                                src={imagePreview} 
                                alt="Preview" 
                                width={200}
                                height={200}
                                className="max-h-48 mx-auto rounded-xl object-contain" 
                                fallback={<PhotoIcon className="w-16 h-16 text-slate-400 mx-auto" />}
                              />
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => {
                                  setImagePreview(null);
                                  setFormData({ ...formData, imageUrl: '' });
                                }}
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Remove Image
                              </motion.button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <PhotoIcon className="w-16 h-16 text-slate-400 mx-auto" />
                              <div>
                                <label className="cursor-pointer">
                                  <span className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-all duration-200">
                                    <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                                    Upload Image
                                  </span>
                                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                                <p className="text-sm text-slate-500 mt-2">Or enter image URL below</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                          <input
                            type="url"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                            value={formData.imageUrl || ''}
                            onChange={(e) => {
                              setFormData({ ...formData, imageUrl: e.target.value });
                              setImagePreview(e.target.value);
                            }}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Additional Information</h4>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Brand</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                              value={formData.brand || ''}
                              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                              placeholder="Brand name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                              value={formData.weight || ''}
                              onChange={(e) => handleNumberInput(e, 'weight')}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Dimensions</label>
                          <input
                            type="text"
                            placeholder="e.g., 10x20x30 cm"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                            value={formData.dimensions || ''}
                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Meta Title</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                            value={formData.metaTitle || ''}
                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                            placeholder="SEO title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Meta Description</label>
                          <textarea
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 resize-none"
                            value={formData.metaDescription || ''}
                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                            placeholder="SEO description"
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isActive"
                            className="w-5 h-5 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          />
                          <label htmlFor="isActive" className="ml-3 text-sm font-medium text-slate-700">
                            Product is active and visible to customers
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
              <div className="flex items-center justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    product ? 'Update Product' : 'Create Product'
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
} 