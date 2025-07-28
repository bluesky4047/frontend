import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Fetch detail product by ID
export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const res = await fetch(`https://api-mern-simpleecommerce.idkoding.com/api/products/${params.id}`, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error();

    const json = await res.json();

    return <ProductDetail product={json.data} />;
  } catch (error) {
    return notFound();
  }
}

// Generate static paths
export async function generateStaticParams() {
  const res = await fetch('https://api-mern-simpleecommerce.idkoding.com/api/products');
  const json = await res.json();

  return json.data.map((product: any) => ({
    id: product.id,
  }));
}
