
import { createClient } from "@/lib/supabase/server";
import { CarService } from "@/services/CarService";
import { FavoriteService } from "@/services/FavoriteService";
import { MarketClient } from "@/components/market/MarketClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Marketplace de Autos Certificados | StarterKar",
    description: "Explora nuestro inventario de autos inspeccionados de 150 puntos. Compra con seguridad y 0% comisión de comprador.",
};

export default async function BuyPage() {
    const supabase = await createClient();
    
    // Parallel fetching for performance
    const [carsData, favorites] = await Promise.all([
        CarService.getAllCars(supabase),
        FavoriteService.getFavorites(supabase)
    ]);

    // Fetch user profile if logged in
    const { data: { user } } = await supabase.auth.getUser();
    let userRole = null;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        userRole = profile?.role || 'buyer';
    }

    // Map database cars to the internal Vehicle format used by components
    const mappedCars = (carsData || []).map(dbCar => {
        const marketData = dbCar.market_data || {};
        return {
            ...dbCar,
            id: dbCar.id,
            make: dbCar.make || 'Marca',
            model: dbCar.model || 'Modelo',
            year: Number(dbCar.year) || 2024,
            images: Array.isArray(dbCar.images) ? dbCar.images : [],
            features: Array.isArray(dbCar.features) ? dbCar.features : [],
            distance: Number(dbCar.mileage) || 0,
            fuel: dbCar.fuel_type || 'Gasolina',
            transmission: dbCar.transmission || 'Automática',
            condition: dbCar.condition || 'Seminuevo',
            category: dbCar.category || 'Car',
            price: Number(dbCar.price) || 0,
            marketValue: Number(marketData.marketValue) || Number(dbCar.price) || 0,
            is_new: !!(marketData.is_new || dbCar.is_new),
            is_investor_only: !!(marketData.is_investor_only || dbCar.is_investor_only),
            is_imported: !!(marketData.is_imported || dbCar.is_imported),
            flashSale: !!(dbCar.flash_sale || marketData.flash_sale),
            has_starterkar_seal: !!(dbCar.has_clinkar_seal || marketData.certified)
        };
    });

    return (
        <MarketClient 
            initialCars={mappedCars} 
            initialFavorites={favorites} 
            initialUserRole={userRole} 
        />
    );
}
