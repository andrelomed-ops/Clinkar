
import { Metadata, ResolvingMetadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CarDetailClient } from '@/components/market/CarDetailClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: car } = await supabase
    .from('cars')
    .select('make, model, year, price, images, status')
    .eq('id', id)
    .single();

  if (!car) {
    return {
      title: 'Vehículo no encontrado | StarterKar',
    };
  }

  const title = `${car.make} ${car.model} ${car.year} | StarterKar`;
  const description = `Mira este ${car.make} ${car.model} por $${car.price.toLocaleString()} MXN en StarterKar. Bóveda Digital Segura y Certificación de 150 puntos.`;
  
  // Point to our new dynamic OG image generator
  const ogImageUrl = `https://clinkar.vercel.app/api/og/car/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${car.make} ${car.model}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();

  if (!car) {
    notFound();
  }

  return <CarDetailClient id={id} initialCar={car} />;
}
