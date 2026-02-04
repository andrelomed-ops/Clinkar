
import { SupabaseClient } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY = 'clinkar_favorites';

export class FavoriteService {
    /**
     * Obtiene los favoritos, fusionando local y servidor si hay sesión.
     */
    static async getFavorites(supabase: SupabaseClient): Promise<string[]> {
        // 1. Obtener favoritos locales
        const localFavorites = this.getLocalFavorites();

        // 2. Verificar sesión
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return localFavorites;
        }

        // 3. Si hay usuario, obtener favoritos de DB
        const { data: dbData, error } = await supabase
            .from('user_favorites')
            .select('car_id')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching favorites from DB:', error);
            return localFavorites;
        }

        const dbFavorites = dbData.map(f => f.car_id);

        // 4. Sincronización Perezosa (Lazy Sync): Si hay locales que no están en DB, subirlos.
        const missingInDb = localFavorites.filter(fid => !dbFavorites.includes(fid));

        if (missingInDb.length > 0) {
            await this.syncFavoritesToDb(supabase, user.id, missingInDb);
            // Limpiar localStorage después de sincronizar para evitar duplicados futuros o dejarlo como caché?
            // Mejor dejarlo como caché y fusionar.
            return [...new Set([...dbFavorites, ...missingInDb])];
        }

        return dbFavorites;
    }

    /**
     * Alterna un favorito (Toggle).
     */
    static async toggleFavorite(supabase: SupabaseClient, carId: string): Promise<string[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Modo Invitado: Solo Local
            return this.toggleLocalFavorite(carId);
        }

        // Modo Usuario: DB
        // Primero verificamos si ya existe
        const { data: existing } = await supabase
            .from('user_favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('car_id', carId)
            .single();

        if (existing) {
            // Eliminar
            await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('car_id', carId);
        } else {
            // Agregar
            await supabase
                .from('user_favorites')
                .insert({ user_id: user.id, car_id: carId });
        }

        // Devolver lista actualizada (optimista o fetch real)
        return this.getFavorites(supabase);
    }

    // --- Private Helpers ---

    private static getLocalFavorites(): string[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    private static toggleLocalFavorite(carId: string): string[] {
        const current = this.getLocalFavorites();
        const updated = current.includes(carId)
            ? current.filter(id => id !== carId)
            : [...current, carId];

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    }

    private static async syncFavoritesToDb(supabase: SupabaseClient, userId: string, carIds: string[]) {
        if (carIds.length === 0) return;

        const payload = carIds.map(carId => ({
            user_id: userId,
            car_id: carId
        }));

        const { error } = await supabase
            .from('user_favorites')
            .upsert(payload, { onConflict: 'user_id,car_id' }); // Ignorar duplicados

        if (error) console.error('Error syncing favorites:', error);
    }
}
