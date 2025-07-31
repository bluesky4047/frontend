'use client';

import React, { useState, useEffect } from 'react';

interface Inventory {
  id: string;
  name: string;
}

export default function ProductForm() {
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    inventoryId: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token tidak ditemukan. Harap login terlebih dahulu.');
      return;
    }

    async function fetchInventory() {
      try {
        const res = await fetch('https://api-mern-simpleecommerce.idkoding.com/api/inventory', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message);
        setInventoryList(result.data || []);
      } catch (error) {
        console.error('Gagal ambil inventory:', error);
        alert('Gagal mengambil daftar inventory');
      }
    }

    fetchInventory();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Debug log untuk memastikan inventoryId yang dipilih
    if (name === 'inventoryId') {
      console.log('Selected Inventory ID:', value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      price: '',
      description: '',
      stock: '',
      inventoryId: '',
    });
    setImage(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token tidak ditemukan.');
      return;
    }

    // Validasi form
    if (!form.name.trim()) {
      alert('Nama produk harus diisi.');
      return;
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      alert('Harga harus berupa angka positif.');
      return;
    }

    if (!form.description.trim()) {
      alert('Deskripsi produk harus diisi.');
      return;
    }

    if (!form.stock || parseInt(form.stock) < 0) {
      alert('Stok harus berupa angka non-negatif.');
      return;
    }

    if (!form.inventoryId) {
      alert('Harap pilih inventory.');
      return;
    }

    if (!image) {
      alert('Harap unggah gambar produk.');
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar tidak boleh lebih dari 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('price', form.price);
    formData.append('description', form.description.trim());
    formData.append('stock', form.stock);
    formData.append('inventoryId', form.inventoryId); // Mengirim ID inventory, bukan nama
    formData.append('image', image);

    // Debug log untuk memastikan data yang dikirim
    console.log('=== Data yang akan dikirim ===');
    console.log('name:', form.name);
    console.log('price:', form.price);
    console.log('description:', form.description);
    console.log('stock:', form.stock);
    console.log('inventoryId:', form.inventoryId);
    console.log('image:', image?.name);
    console.log('==========================');

    setLoading(true);

    try {
      const res = await fetch('https://api-mern-simpleecommerce.idkoding.com/api/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menambahkan produk');
      }

      alert('Produk berhasil ditambahkan!');
      console.log('Response:', data);
      
      // Reset form setelah berhasil
      resetForm();
      
    } catch (err: any) {
      console.error('Error:', err);
      alert(`Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-8 p-4 border border-gray-300 rounded space-y-4"
    >
      <h2 className="text-xl font-bold text-center">Tambah Produk</h2>

      <input
        type="text"
        name="name"
        placeholder="Nama Produk"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <input
        type="number"
        name="price"
        placeholder="Harga"
        value={form.price}
        onChange={handleChange}
        min="0"
        step="0.01"
        required
        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <textarea
        name="description"
        placeholder="Deskripsi"
        value={form.description}
        onChange={handleChange}
        required
        rows={3}
        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <input
        type="number"
        name="stock"
        placeholder="Stok"
        value={form.stock}
        onChange={handleChange}
        min="0"
        required
        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <select
        name="inventoryId"
        value={form.inventoryId}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Pilih Inventory</option>
        {inventoryList.map((inv) => (
          <option key={inv.id} value={inv.id}>
            {inv.name}
          </option>
        ))}
      </select>

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          className="w-full"
        />
        {image && (
          <p className="text-sm text-gray-600 mt-1">
            File dipilih: {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Mengirim...' : 'Kirim Produk'}
      </button>
    </form>
  );
}