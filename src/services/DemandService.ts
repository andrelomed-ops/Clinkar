import { createClient } from '@supabase/supabase-js';
import { Logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface DemandRequest {
    id?: string;
    user_id?: string;
    brand: string;
    model?: string;
    year_min?: number;
    year_max?: number;
    budget_min?: number;
    budget_max?: number;
    location?: string;
    notes?: string;
    status: 'pending' | 'notified' | 'matched' | 'fulfilled' | 'expired';
    match_found?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface SellerLead {
    id?: string;
    user_id?: string;
    current_brand: string;
    current_model: string;
    current_year: number;
    current_price_expected?: number;
    condition?: 'excellent' | 'good' | 'fair' | 'needs_work';
    looking_for?: string;
    contact_preference?: 'phone' | 'whatsapp' | 'email';
    status: 'new' | 'contacted' | 'matched' | 'sold' | 'expired';
    demand_match_id?: string;
    created_at?: string;
    updated_at?: string;
}

export class DemandService {
    static async createDemandRequest(data: Omit<DemandRequest, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: DemandRequest; error?: string }> {
        try {
            const { data: result, error } = await supabase
                .from('demand_registry')
                .insert({
                    ...data,
                    status: 'pending',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            Logger.info('[DemandService] Created demand request:', result.id);
            
            await this.notifyInterestedSellers(result);

            return { success: true, data: result };
        } catch (error) {
            Logger.error('[DemandService] Error creating demand:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    static async createSellerLead(data: Omit<SellerLead, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: SellerLead; match?: DemandRequest; error?: string }> {
        try {
            const { data: lead, error: leadError } = await supabase
                .from('seller_leads')
                .insert({
                    ...data,
                    status: 'new',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (leadError) throw leadError;

            const demandMatch = await this.findDemandMatch(lead.current_brand, lead.current_model, lead.current_year);

            if (demandMatch) {
                await supabase.from('demand_registry').update({ 
                    status: 'matched', 
                    match_found: true,
                    updated_at: new Date().toISOString()
                }).eq('id', demandMatch.id);

                await supabase.from('seller_leads').update({
                    status: 'matched',
                    demand_match_id: demandMatch.id,
                    updated_at: new Date().toISOString()
                }).eq('id', lead.id);

                return { success: true, data: lead, match: demandMatch };
            }

            return { success: true, data: lead };
        } catch (error) {
            Logger.error('[DemandService] Error creating seller lead:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    static async findDemandMatch(brand: string, model?: string, year?: number): Promise<DemandRequest | null> {
        try {
            let query = supabase
                .from('demand_registry')
                .select('*')
                .eq('status', 'pending')
                .ilike('brand', brand);

            if (model) {
                query = query.or(`model.ilike.%${model}%,model.is.null`);
            }

            const { data, error } = await query.single();

            if (error || !data) return null;

            if (year && data.year_min && data.year_max) {
                if (year < data.year_min || year > data.year_max) return null;
            }

            return data;
        } catch {
            return null;
        }
    }

    static async getDemandRequests(filters?: {
        brand?: string;
        status?: string;
        limit?: number;
    }): Promise<DemandRequest[]> {
        try {
            let query = supabase
                .from('demand_registry')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.brand) {
                query = query.ilike('brand', `%${filters.brand}%`);
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            Logger.error('[DemandService] Error fetching demands:', error);
            return [];
        }
    }

    static async getSellerLeads(filters?: {
        status?: string;
        limit?: number;
    }): Promise<SellerLead[]> {
        try {
            let query = supabase
                .from('seller_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            Logger.error('[DemandService] Error fetching seller leads:', error);
            return [];
        }
    }

    static async getDemandAnalytics(): Promise<{
        totalDemands: number;
        totalSellerLeads: number;
        topSearchedBrands: { brand: string; count: number }[];
        matchedPercentage: number;
        pendingPercentage: number;
    }> {
        try {
            const [demands, leads] = await Promise.all([
                supabase.from('demand_registry').select('brand, status', { count: 'exact' }),
                supabase.from('seller_leads').select('current_brand', { count: 'exact' })
            ]);

            const demandCount = demands.count || 0;
            const leadCount = leads.count || 0;
            const matchedDemands = demands.data?.filter(d => d.status === 'matched').length || 0;

            const brandCounts: Record<string, number> = {};
            demands.data?.forEach(d => {
                const brand = (d.brand || 'Unknown').toUpperCase();
                brandCounts[brand] = (brandCounts[brand] || 0) + 1;
            });

            const topBrands = Object.entries(brandCounts)
                .map(([brand, count]) => ({ brand, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            return {
                totalDemands: demandCount,
                totalSellerLeads: leadCount,
                topSearchedBrands: topBrands,
                matchedPercentage: demandCount > 0 ? Math.round((matchedDemands / demandCount) * 100) : 0,
                pendingPercentage: demandCount > 0 ? Math.round(((demandCount - matchedDemands) / demandCount) * 100) : 0
            };
        } catch (error) {
            Logger.error('[DemandService] Error getting analytics:', error);
            return {
                totalDemands: 0,
                totalSellerLeads: 0,
                topSearchedBrands: [],
                matchedPercentage: 0,
                pendingPercentage: 0
            };
        }
    }

    static async notifyInterestedSellers(demand: DemandRequest): Promise<void> {
        const potentialSellers = await supabase
            .from('seller_leads')
            .select('*')
            .eq('current_brand', demand.brand)
            .eq('status', 'new');

        if (potentialSellers.data && potentialSellers.data.length > 0) {
            Logger.info(`[DemandService] Found ${potentialSellers.data.length} potential sellers for ${demand.brand}`);
        }
    }
}

export const demandService = DemandService;