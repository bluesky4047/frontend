import { mockInventories, mockProducts } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Calendar, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface InventoryDetailPageProps {
  params: {
    id: string;
  };
}

export default function InventoryDetailPage({ params }: InventoryDetailPageProps) {
  const inventory = mockInventories.find(inv => inv.id === params.id);
  
  if (!inventory) {
    notFound();
  }

  const inventoryProducts = mockProducts.filter(p => p.inventoryId === params.id);
  const totalValue = inventoryProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const lowStockProducts = inventoryProducts.filter(p => p.stock < 20);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Link>
        </Button>
        <nav className="text-sm text-gray-500">
          <span>Inventory</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{inventory.name}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-blue-600" />
                <span>{inventory.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{inventory.location}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Created: {formatDate(inventory.createdAt)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{inventoryProducts.length}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatPrice(totalValue)}</div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Stock Items:</span>
                <Badge variant={lowStockProducts.length > 0 ? "destructive" : "default"}>
                  {lowStockProducts.length}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categories:</span>
                <Badge variant="outline">
                  {new Set(inventoryProducts.map(p => p.category)).size}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Stock:</span>
                <Badge variant="secondary">
                  {inventoryProducts.reduce((sum, p) => sum + p.stock, 0)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" asChild>
            <Link href={`/products/inventory/${inventory.id}`}>
              <Package className="h-4 w-4 mr-2" />
              View All Products
            </Link>
          </Button>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-gray-600 ml-2">({product.id})</span>
                  </div>
                  <Badge variant="destructive">{product.stock} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}