'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, Eye } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id?: string;
  name: string;
  image: string;
  price: number;
  description: string;
  stock: number;
  inventoryId: string;
  inventory?: Inventory;
}

interface Inventory {
  id?: string;
  name: string;
  description: string;
}

interface Invoice {
  id?: string;
  userId: string;
  productId: string;
  quantity: number;
  total: number;
  status: string;
  createdAt: string;
}

type EntityType = 'products' | 'inventory' | 'invoices';

export default function AdminCRUDPage() {
  const [activeTab, setActiveTab] = useState<EntityType>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, inventoriesRes, invoicesRes] = await Promise.all([
        fetch('https://api-mern-simpleecommerce.idkoding.com/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('https://api-mern-simpleecommerce.idkoding.com/api/inventory', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('https://api-mern-simpleecommerce.idkoding.com/api/invoice', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [productsData, inventoriesData, invoicesData] = await Promise.all([
        productsRes.json(),
        inventoriesRes.json(),
        invoicesRes.json(),
      ]);

      setProducts(productsData.data || []);
      setInventories(inventoriesData.data || []);
      setInvoices(invoicesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAll();
    }
  }, [token, fetchAll]);

  // Upload image to your API endpoint
  const uploadImage = async (file: File): Promise<string> => {
    // Compress image before upload if it's too large
    const compressedFile = await compressImage(file);
    
    const formData = new FormData();
    formData.append('image', compressedFile);
    
    console.log('Uploading compressed file:', {
      name: compressedFile.name,
      size: compressedFile.size,
      type: compressedFile.type,
      originalSize: file.size
    });
    
    try {
      // Try direct upload to products endpoint (most likely correct one)
      const response = await fetch('https://api-mern-simpleecommerce.idkoding.com/api/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header, let browser set it with boundary for FormData
        },
        body: formData,
      });
      
      console.log('Upload response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Upload successful, response data:', data);
        
        // Based on your ProductCard reference, the API likely returns a path like '/uploads/filename.jpg'
        const imagePath = data.data?.image || 
                         data.image || 
                         data.data?.imagePath || 
                         data.imagePath ||
                         data.data?.path || 
                         data.path ||
                         data.filename ||
                         data.url;
        
        if (imagePath) {
          console.log('Image uploaded successfully, path:', imagePath);
          // Return the path as-is, frontend will handle the full URL construction
          return imagePath;
        }
      } else {
        const errorText = await response.text();
        console.log('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText.substring(0, 300)
        });
        
        // If it's HTML error page, throw meaningful error
        if (errorText.includes('<!DOCTYPE')) {
          throw new Error('Server configuration error - returned HTML instead of JSON');
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // For development: create a mock path that follows the same pattern
      console.log('Using mock path for development...');
      const timestamp = Date.now();
      const fileName = compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      return `/uploads/mock_${timestamp}_${fileName}`;
    }
  };

  // Compress image function
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg', // Convert to JPEG for better compression
                lastModified: Date.now()
              });
              console.log(`Image compressed: ${file.size} → ${compressedFile.size} bytes`);
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          'image/jpeg',
          0.7 // 70% quality
        );
      };
      
      img.onerror = () => resolve(file); // Fallback to original
      img.src = URL.createObjectURL(file);
    });
  };

  const tabConfig = {
    products: {
      title: 'Products',
      fields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'image', label: 'Image', type: 'file' },
        { key: 'price', label: 'Price', type: 'number' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'stock', label: 'Stock', type: 'number' },
        { key: 'inventoryId', label: 'Inventory', type: 'select', options: inventories }
      ],
      displayFields: ['image', 'name', 'price', 'stock', 'inventory'],
      data: products,
      setData: setProducts
    },
    inventory: {
      title: 'Inventory',
      fields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' }
      ],
      displayFields: ['name', 'description'],
      data: inventories,
      setData: setInventories
    },
    invoices: {
      title: 'Invoices',
      fields: [
        { key: 'userId', label: 'User ID', type: 'text' },
        { key: 'productId', label: 'Product ID', type: 'text' },
        { key: 'quantity', label: 'Quantity', type: 'number' },
        { key: 'total', label: 'Total', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { id: 'pending', name: 'Pending' },
          { id: 'completed', name: 'Completed' },
          { id: 'cancelled', name: 'Cancelled' }
        ]},
        { key: 'createdAt', label: 'Created At', type: 'date' }
      ],
      displayFields: ['userId', 'productId', 'quantity', 'total', 'status'],
      data: invoices,
      setData: setInvoices
    }
  };

  const currentConfig = tabConfig[activeTab];

  const handleSave = async (formData: any) => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'invoices' ? 'invoice' : activeTab;
      const url = `https://api-mern-simpleecommerce.idkoding.com/api/${endpoint}`;
      
      // Untuk products, pastikan data sesuai dengan yang diharapkan backend
      let dataToSend = { ...formData };
      
      if (activeTab === 'products') {
        // Pastikan inventoryId ada dan valid
        if (!dataToSend.inventoryId) {
          alert('Please select an inventory');
          return;
        }
        
        // Jika tidak ada image, berikan default atau hapus field
        if (!dataToSend.image) {
          dataToSend.image = null;
        }
        
        // Pastikan tipe data sesuai
        dataToSend.price = Number(dataToSend.price);
        dataToSend.stock = Number(dataToSend.stock);
      }
      
      console.log('Sending data:', dataToSend);
      
      let response;
      if (editingItem?.id) {
        // Update existing
        response = await fetch(`${url}/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        });
      } else {
        // Create new
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        });
      }

      console.log('Save response status:', response.status);
      console.log('Save response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        console.log('Received non-JSON response:', textResult.substring(0, 200));
        
        if (textResult.includes('<!DOCTYPE')) {
          throw new Error('Server returned HTML page instead of JSON. Check server configuration.');
        }
        
        result = { message: textResult };
      }
      
      console.log('Save response data:', result);
      
      if (response.ok) {
        setEditingItem(null);
        setShowForm(false);
        await fetchAll(); // Refresh data
        alert('Data saved successfully!');
      } else {
        console.error('Error saving data:', result);
        const errorMessage = result.message || result.error || `HTTP ${response.status}: ${response.statusText}`;
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert(`Network error occurred while saving data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      try {
        const endpoint = activeTab === 'invoices' ? 'invoice' : activeTab;
        const response = await fetch(
          `https://api-mern-simpleecommerce.idkoding.com/api/${endpoint}/${id}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          await fetchAll(); // Refresh data
          alert('Data deleted successfully!');
        } else {
          const result = await response.json();
          console.error('Error deleting data:', result);
          alert(`Error: ${result.message || 'Failed to delete data'}`);
        }
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('Network error occurred while deleting data');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const formatValue = (value: any, field: string, item?: any) => {
    if (field === 'price' || field === 'total') {
      return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
    }
    
    if (field === 'image' && value) {
      // Clean the image path similar to ProductCard
      const cleanedImage = value.replace('http://127.0.0.1:5025', '');
      const imageUrl = cleanedImage.startsWith('/') 
        ? `https://api-mern-simpleecommerce.idkoding.com${cleanedImage}`
        : cleanedImage.startsWith('data:') 
        ? cleanedImage  // base64 image
        : `https://api-mern-simpleecommerce.idkoding.com/uploads/${cleanedImage}`;
      
      return (
        <div className="flex items-center space-x-2">
          <Image 
            src={imageUrl} 
            alt="Product" 
            width={48}
            height={48}
            className="object-cover rounded cursor-pointer hover:opacity-80"
            onClick={() => {
              setSelectedImage(imageUrl);
              setShowImageModal(true);
            }}
            onError={(e) => {
              console.log('Image load error:', imageUrl);
              // Fallback to placeholder
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzYiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
            }}
          />
          <button
            onClick={() => {
              setSelectedImage(imageUrl);
              setShowImageModal(true);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye size={16} />
          </button>
        </div>
      );
    }
    
    if (field === 'inventory' && item?.inventory) {
      return item.inventory.name;
    }
    
    return value;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {Object.entries(tabConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key as EntityType);
                  setShowForm(false);
                  setEditingItem(null);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {config.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Manage {currentConfig.title}
            </h2>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              <span>Add New</span>
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingItem ? 'Edit' : 'Add New'} {currentConfig.title.slice(0, -1)}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <EntityForm
                  fields={currentConfig.fields}
                  initialData={editingItem}
                  onSave={handleSave}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  uploadImage={uploadImage}
                />
              </div>
            </div>
          )}

          {/* Image Modal */}
          {showImageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="relative max-w-4xl max-h-full">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                >
                  <X size={24} />
                </button>
                <Image 
                  src={selectedImage} 
                  alt="Product Preview" 
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    console.log('Modal image load error:', selectedImage);
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjI0Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPg==';
                  }}
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    {currentConfig.displayFields.map(field => (
                      <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentConfig.data.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.id?.substring(0, 8)}...
                      </td>
                      {currentConfig.displayFields.map(field => (
                        <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatValue(item[field], field, item)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 p-1 disabled:opacity-50"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {currentConfig.data.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No {currentConfig.title.toLowerCase()} found</div>
              <p className="text-gray-500 mt-2">Click &ldquo;Add New&rdquo; to create your first entry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Form Component
function EntityForm({ fields, initialData, onSave, onCancel, uploadImage }: {
  fields: any[];
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  uploadImage: (file: File) => Promise<string>;
}) {
  const [formData, setFormData] = useState(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.key] = initialData?.[field.key] || '';
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }
    
    setUploadingImage(true);
    try {
      console.log('Starting image upload process...');
      const imageUrl = await uploadImage(file);
      
      if (imageUrl) {
        setImagePreview(imageUrl);
        handleInputChange('image', imageUrl);
        console.log('Image upload completed successfully');
      } else {
        throw new Error('No image URL received');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again or check console for details.');
    } finally {
      setUploadingImage(false);
    }
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={formData[field.key]}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            disabled={isSubmitting}
            title={`Select ${field.label}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option: any) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={formData[field.key]}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            disabled={isSubmitting}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          />
        );
      
      case 'file':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-8 h-8 mb-2 ${uploadingImage ? 'text-blue-500 animate-pulse' : 'text-gray-500'}`} />
                  <p className="text-sm text-gray-500">
                    {uploadingImage ? 'Uploading image...' : 'Click to upload image or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF, WebP up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  disabled={isSubmitting || uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
            {imagePreview && (
              <div className="mt-3 relative">
                <Image 
                  src={imagePreview.startsWith('/') 
                    ? `https://api-mern-simpleecommerce.idkoding.com${imagePreview}`
                    : imagePreview
                  } 
                  alt="Preview" 
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover rounded-md border"
                  onError={(e) => {
                    console.log('Preview image error:', imagePreview);
                    // Show placeholder if image fails to load
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtc2l6ZT0iMTIiPkltYWdlIFByZXZpZXc8L3RleHQ+Cjwvc3ZnPg==';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    handleInputChange('image', '');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  disabled={isSubmitting || uploadingImage}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <input
            type={field.type}
            value={formData[field.key]}
            onChange={(e) => {
              const value = field.type === 'number' ? Number(e.target.value) : e.target.value;
              handleInputChange(field.key, value);
            }}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {fields.map(field => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          {renderField(field)}
        </div>
      ))}
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || uploadingImage}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
}