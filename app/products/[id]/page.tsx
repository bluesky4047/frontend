import { mockProducts } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = mockProducts.find(p => p.id === params.id);
  
  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}