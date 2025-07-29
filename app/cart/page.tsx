'use client';

import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface UserData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
}

export default function CartPage() {
  const { items, total, clearCart } = useCart();
  const [user, setUser] = useState<UserData | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData) as UserData;
        setUser(parsedUser);
        setForm({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
        });
      } catch (error) {
        console.error('Gagal parsing user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      router.push('/auth/signin');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (!form.name || !form.email || !form.phone) {
      alert('Semua data wajib diisi.');
      return;
    }

    if (items.length === 0) {
      alert('Keranjang kosong!');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        date: new Date().toISOString().split('T')[0],
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const response = await api.post('/invoice/checkout', payload);
      alert('Checkout berhasil!');
      clearCart();
      router.push('/');
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert('Data tidak valid. ' + (error.response?.data?.message || 'Cek kembali input Anda.'));
      } else if (error.response?.status === 401) {
        alert('Session expired. Silakan login ulang.');
        localStorage.clear();
        router.push('/auth/signin');
      } else {
        alert('Checkout gagal. Silakan coba lagi.');
        console.error('Checkout error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang kosong</h2>
        <p className="text-gray-600 mb-6">Tambahkan produk terlebih dahulu</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali Belanja
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali Belanja
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Ringkasan + Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Total item: {items.length}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Form Checkout */}
              <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Nama lengkap"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email aktif"
                  value={form.email}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="No. Telepon"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="space-y-2 pt-2">
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? 'Memproses...' : 'Checkout Sekarang'}
                </Button>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Kosongkan Keranjang
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
