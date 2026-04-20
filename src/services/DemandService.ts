import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { Logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type DemandRequest = Database['public']['Tables']['demand_registry']['Row'];
export type SellerLead = Database['public']['Tables']['seller_leads']['Row'];

export class DemandService {
    static async createDemandRequest(data: Database['public']['Tables']['demand_registry']['Insert']): Promise<{ success: boolean; data?: DemandRequest; error?: string }> {
        try {
            const { data: result, error } = await (supabase.from('demand_registry') as any)
                .insert({
                    ...data,
                    status: 'pending',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            if (!result) throw new Error("Failed to create demand request");

            Logger.info('[DemandService] Created demand request:', result.id);
            
            await this.notifyInterestedSellers(result);

            return { success: true, data: result };
        } catch (error) {
            Logger.error('[DemandService] Error creating demand:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    static async createSellerLead(data: Database['public']['Tables']['seller_leads']['Insert']): Promise<{ success: boolean; data?: SellerLead; match?: DemandRequest; error?: string }> {
        try {
            const { data: lead, error: leadError } = await (supabase.from('seller_leads') as any)
                .insert({
                    ...data,
                    status: 'new',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (leadError) throw leadError;
            if (!lead) throw new Error("Failed to create seller lead");

            const demandMatch = await this.findDemandMatch(lead.current_brand, lead.current_model || undefined, lead.current_year);

            if (demandMatch) {
                await (supabase.from('demand_registry') as any).update({ 
                    status: 'matched', 
                    match_found: true,
                    updated_at: new Date().toISOString()
                }).eq('id', demandMatch.id);

                await (supabase.from('seller_leads') as any).update({
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
            let query = (supabase.from('demand_registry') as any)
                .select('*')
                .eq('status', 'pending')
                .ilike('brand', brand);

            if (model) {
                query = query.or(`model.ilike.%${model}%,model.is.null`);
            }

            const { data, error } = await query.maybeSingle();

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

    static async getStats(supabase: any) {
        try {
            const { data: demandData } = await (supabase.from('demand_registry') as any).select('*');
            const { data: leadData } = await (supabase.from('seller_leads') as any).select('*');

            if (!demandData || !leadData) return null;

            const demandCount = demandData.length;
            const leadCount = leadData.length;
            const matchedDemands = (demandData as any[]).filter(d => d.status === 'matched').length;

            const brandCounts: Record<string, number> = {};
            (demandData as any[]).forEach(d => {
                const b = d.brand;
                brandCounts[b] = (brandCounts[b] || 0) + 1;
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
        const { data: potentialSellers } = await supabase
            .from('seller_leads')
            .select('*')
            .eq('current_brand', demand.brand)
            .eq('status', 'new');

        if (potentialSellers && potentialSellers.length > 0) {
            Logger.info(`[DemandService] Found ${potentialSellers.length} potential sellers for ${demand.brand}`);
        }
    }
}

export const demandService = DemandService;