'use client';

import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    // Tambahkan ke cart lokal (frontend)
    addToCart(product);

    // Kirim ke backend jika pakai sistem server-side cart
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://api-mern-simpleecommerce.idkoding.com/api/carts',
        { productId: product.id, quantity: 1 },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Cart updated in backend:', response.data);
    } catch (error: any) {
      console.error('Gagal update cart backend:', error.response?.data || error.message);
      alert(`Gagal tambah ke cart: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  const cleanedImage = product.image.replace('http://127.0.0.1:5025', '');

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={`https://api-mern-simpleecommerce.idkoding.com${cleanedImage}`}
            alt={product.name}
            width={400}
            height={250}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
              {product.stock > 0 ? `${product.stock} stock` : 'Out of stock'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </CardTitle>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
          <Badge variant="outline">{product.category}</Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/products/${product.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </Button>
        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
