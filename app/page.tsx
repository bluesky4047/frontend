'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, inventoryRes] = await Promise.all([
          api.get('/products'),
          api.get('/inventory'),
        ]);

        setProducts(productRes.data.data);
        setInventories(inventoryRes.data.data);
      } catch (err: any) {
        console.error(err);
        setError('Gagal memuat data produk atau inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered product
  const filteredProducts = products.filter((item: any) => {
    const matchesInventory =
      selectedInventory === 'all' || item.inventoryId === selectedInventory;

    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesInventory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to E-Commerce</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing products with our modern e-commerce platform
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari produk..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-[180px]">
          <Select value={selectedInventory} onValueChange={setSelectedInventory}>
            <SelectTrigger>
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

      {/* HASIL */}
      {loading ? (
        <div className="text-center text-gray-500">Loading products...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-12">
          <Search className="h-10 w-10 mx-auto mb-4" />
          <p className="text-lg font-semibold">Produk tidak ditemukan</p>
          <p className="text-sm text-gray-500">Coba gunakan kata kunci lain atau ubah filter inventory.</p>
        </div>
      )}
    </div>
  );
}
