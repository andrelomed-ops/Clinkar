import { MetadataRoute } from 'next';
import { CarService } from '@/services/CarService';
import { createClient } from '@/lib/supabase/server';
import { ALL_CARS } from '@/data/cars';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://clinkar.com';

    // Base routes
    const routes = [
        '',
        '/buy',
        '/sell',
        '/faq',
        '/contact',
        '/help',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic vehicle routes
    const supabase = await createClient();
    const dbCars = await CarService.getAllCars(supabase);

    // Combine with mock cars if DB is empty or for full coverage during transition
    const vehicles = (dbCars.length > 0 ? dbCars : ALL_CARS).map((car) => ({
        url: `${baseUrl}/buy/${car.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...vehicles];
}
