'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Product {
  id?: string;
  name: string;
  image: string;
  price: number;
  description: string;
  stock: number;
  inventoryId: string;
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

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (token) {
      fetchAll();
    }
  }, [token]);

  const fetchAll = async () => {
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
  };

  const tabConfig = {
    products: {
      title: 'Products',
      fields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'image', label: 'Image URL', type: 'text' },
        { key: 'price', label: 'Price', type: 'number' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'stock', label: 'Stock', type: 'number' },
        { key: 'inventoryId', label: 'Inventory ID', type: 'text' }
      ],
      displayFields: ['name', 'price', 'stock', 'inventoryId'],
      data: products,
      setData: setProducts
    },
    inventory: {
      title: 'Inventory',
      fields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' }
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
        { key: 'status', label: 'Status', type: 'text' },
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
      
      let response;
      if (editingItem?.id) {
        // Update existing
        response = await fetch(`${url}/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        setEditingItem(null);
        setShowForm(false);
        await fetchAll(); // Refresh data
      } else {
        console.error('Error saving data:', await response.text());
      }
    } catch (error) {
      console.error('Error saving data:', error);
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
        } else {
          console.error('Error deleting data:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting data:', error);
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

  const formatValue = (value: any, field: string) => {
    if (field === 'price' || field === 'total') {
      return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value);
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.id}
                      </td>
                      {currentConfig.displayFields.map(field => (
                        <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatValue(item[field], field)}
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
              <p className="text-gray-500 mt-2">Click "Add New" to create your first entry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Form Component
function EntityForm({ fields, initialData, onSave, onCancel }: {
  fields: any[];
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(() => {
    const initial: any = {};
    fields.forEach(field => {
      initial[field.key] = initialData?.[field.key] || '';
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {fields.map(field => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
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
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
}