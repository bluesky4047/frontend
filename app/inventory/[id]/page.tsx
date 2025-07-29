import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

interface InventoryProductsPageProps {
  params: {
    inventoryId: string;
  };
}

export default async function InventoryProductsPage({ params }: InventoryProductsPageProps) {
  const res = await fetch('https://api-mern-simpleecommerce.idkoding.com/api/products', {
    cache: 'no-store'
  });

  const json = await res.json();
  const products = json.data.filter((p: any) => p.inventoryId === params.inventoryId);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <nav className="text-sm text-gray-500">
          <span>Products</span>
          <span className="mx-2">/</span>
          <span>Inventory</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{params.inventoryId}</span>
        </nav>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Products from {params.inventoryId}</h1>
        </div>
        <p className="text-gray-600">{products.length} products found in this inventory</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">This inventory doesn&apos;t have any products yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ Tambahkan fungsi generateStaticParams
export async function generateStaticParams() {
  try {
    const res = await fetch('https://api-mern-simpleecommerce.idkoding.com/api/products');
    const json = await res.json();

    // Ambil semua inventoryId unik dari data produk
    const inventoryIds = new Set(json.data.map((product: any) => product.inventoryId));

    return Array.from(inventoryIds).map((id) => ({
      inventoryId: id,
    }));
  } catch (error) {
    console.error('Error fetching static params:', error);
    return [];
  }
}
