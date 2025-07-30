'use client';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Ambil data inventory
  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const res = await api.get('/inventory');
        setInventories(res.data.data);
      } catch (err) {
        console.error('Gagal mengambil inventory:', err);
      }
    };
    fetchInventories();
  }, []);

  // Ambil semua produk lalu simpan sebagai allProducts
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      const data = res.data.data;
      setAllProducts(data);
    } catch (err) {
      console.error('Gagal mengambil produk:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load awal
  useEffect(() => {
    fetchProducts();
  }, []);

  // Lakukan filter dan search di frontend
  useEffect(() => {
    let filtered = [...allProducts];

    if (selectedInventory !== 'all') {
      filtered = filtered.filter(
        (item: any) => item.inventory_id === selectedInventory
      );
    }

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (item: any) =>
          item.nama_produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.deskripsi_barang?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setProducts(filtered);
  }, [allProducts, selectedInventory, searchTerm]);

  const handleInventoryChange = (value: string) => {
    setSelectedInventory(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to E-Commerce</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing products with our modern e-commerce platform
        </p>
      </div>

      {/* FILTER */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedInventory} onValueChange={handleInventoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Inventory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Inventories</SelectItem>
              {inventories.map((inv: any) => (
                <SelectItem key={inv.id} value={inv.id}>
                  {inv.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PRODUK */}
      {loading ? (
        <div className="text-center text-gray-500">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length > 0 ? (
            products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="text-center col-span-full text-gray-400">
              Produk tidak ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}
