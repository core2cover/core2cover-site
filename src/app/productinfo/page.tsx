import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductInfo from "@/components/customer/Product_Info";
import prisma from "@/lib/prisma"; 

// Define the type to fix the 'implicitly has an any type' error
interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const id = Number(Array.isArray(params.id) ? params.id[0] : params.id);

  if (!id || isNaN(id)) return { title: "Product Details | Core2Cover" };

  // Fetch product data on the server specifically for the social media crawler
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, description: true, images: true }
  });

  if (!product) return { title: "Product Not Found" };

  const title = `${product.name} | Core2Cover`;
  const description = product.description?.substring(0, 150) || "Check out this product on Core2Cover!";
  
  // Use the first image from your gallery for the preview
  const imageUrl = product.images?.[0] || "https://core2cover.in/default-share.jpg";

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://core2cover.in/productinfo?id=${id}`, 
      siteName: 'Core2Cover',
      images: [
        {
          url: imageUrl, // This is what shows the image on WhatsApp
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
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