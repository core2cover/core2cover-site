import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductInfo from "@/components/customer/Product_Info";
import prisma from "@/lib/prisma"; 

// Define the interface for the props to fix the 'any' type error
interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const id = Number(params.id);

  if (!id || isNaN(id)) return { title: "Product Details | Core2Cover" };

  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, description: true, images: true }
  });

  if (!product) return { title: "Product Not Found" };

  const title = `${product.name} | Core2Cover`;
  const description = product.description?.substring(0, 160) || "Check out this product on Core2Cover!";
  const imageUrl = product.images?.[0] || "https://coretocover.com/default-share.jpg";

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://coretocover.com/productinfo?id=${id}`, 
      siteName: 'Core2Cover',
      images: [
        {
          url: imageUrl, // This shows the product image in the link preview
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
    },
  };
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProductInfo />
    </Suspense>
  );
}