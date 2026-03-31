import { createClient } from '@supabase/supabase-js';

const CLINKCARGO_SUPABASE_URL = 'https://dyaebyyhlscujqpnjeuf.supabase.co';
const CLINKCARGO_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YWVieXlobHNjdWpxcG5qZXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDk0NDUsImV4cCI6MjA5MDQ4NTQ0NX0.9xS9M6J6pQvjZymbIvmQv-daMgZaVweWCdqqvnAYlD8';
const STARTERKAR_API_KEY = 'pk_live_starterkar_692f6d556099c081d863255d4037d6c6683a8ebaf498335039e35e05bc90b876';

export type VehicleTransportType = 'flatbed' | 'tow_truck' | 'crane';

export interface VehicleTransportQuote {
    vehicleType: VehicleTransportType;
    vehicleName: string;
    distance: number;
    price: number;
    breakdown: {
        basePrice: number;
        distancePrice: number;
        subtotal: number;
        iva: number;
        total: number;
    };
    estimatedTimeMinutes: number;
}

export interface CreateVehicleTransportOrderParams {
    transactionId: string;
    pickupAddress: string;
    dropoffAddress: string;
    pickupCoordinates?: { lat: number; lng: number };
    dropoffCoordinates?: { lat: number; lng: number };
    vehicleType: VehicleTransportType;
    vehicleToTransport?: {
        brand: string;
        model: string;
        year: number;
        licensePlate?: string;
    };
    customerPhone?: string;
    customerName?: string;
    notes?: string;
}

export interface VehicleTransportOrderResponse {
    success: boolean;
    orderId?: string;
    status?: string;
    price?: number;
    error?: string;
}

const VEHICLE_TRANSPORT_VEHICLES: Record<VehicleTransportType, { name: string; nameEs: string; basePrice: number; pricePerKm: number; maxWeightKg: number }> = {
    flatbed: { name: 'Flatbed', nameEs: 'Plataforma / Madrina', basePrice: 300, pricePerKm: 30, maxWeightKg: 5000 },
    tow_truck: { name: 'Tow Truck', nameEs: 'Grúa de Rescate', basePrice: 180, pricePerKm: 20, maxWeightKg: 3000 },
    crane: { name: 'Crane', nameEs: 'Grúa / Plataforma', basePrice: 200, pricePerKm: 25, maxWeightKg: 2000 },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

const clinkcargoClient = createClient(CLINKCARGO_SUPABASE_URL, CLINKCARGO_ANON_KEY, {
    global: {
        headers: {
            'x-api-key': STARTERKAR_API_KEY,
        },
    },
});

export class ClinkargoTransportService {
    static async getQuote(
        pickupCoordinates?: { lat: number; lng: number },
        dropoffCoordinates?: { lat: number; lng: number }
    ): Promise<VehicleTransportQuote[]> {
        try {
            const { data, error } = await clinkcargoClient.functions.invoke('get-clinckargo-quotes', {
                body: {
                    pickup_coordinates: pickupCoordinates,
                    dropoff_coordinates: dropoffCoordinates,
                    service_type: 'vehiculos'
                }
            });

            if (error || !data?.quotes) {
                console.error('Quote error:', error);
                return [];
            }

            return data.quotes.map((q: any) => ({
                vehicleType: q.vehicleType as VehicleTransportType,
                vehicleName: q.vehicleName,
                distance: q.distance,
                price: q.price,
                breakdown: q.breakdown,
                estimatedTimeMinutes: q.estimatedTimeMinutes
            }));
        } catch (err) {
            console.error('Quote error:', err);
            return [];
        }
    }

    static async createOrder(params: CreateVehicleTransportOrderParams): Promise<VehicleTransportOrderResponse> {
        try {
            const vehicle = VEHICLE_TRANSPORT_VEHICLES[params.vehicleType];
            
            const distance = (params.pickupCoordinates && params.dropoffCoordinates)
                ? calculateDistance(
                    params.pickupCoordinates.lat, params.pickupCoordinates.lng,
                    params.dropoffCoordinates.lat, params.dropoffCoordinates.lng
                )
                : 10;

            const estimatedPrice = vehicle.basePrice + (distance * vehicle.pricePerKm);

            const orderData = {
                status: 'searching',
                service_type: 'vehiculos',
                partner_order_id: params.transactionId,
                pickup_address: params.pickupAddress,
                dropoff_address: params.dropoffAddress,
                pickup_coordinates: params.pickupCoordinates ? JSON.stringify(params.pickupCoordinates) : null,
                dropoff_coordinates: params.dropoffCoordinates ? JSON.stringify(params.dropoffCoordinates) : null,
                vehicle_type_needed: params.vehicleType,
                price: Math.round(estimatedPrice * 116) / 100,
                distance,
                requires_cold_chain: false,
                waypoints: [
                    { address: params.pickupAddress, coordinates: params.pickupCoordinates, type: 'pickup' },
                    { address: params.dropoffAddress, coordinates: params.dropoffCoordinates, type: 'dropoff' }
                ],
                customer_phone: params.customerPhone,
                customer_name: params.customerName,
                notes: params.notes ? `${params.notes}\nVehículo a transportar: ${params.vehicleToTransport?.brand} ${params.vehicleToTransport?.model} ${params.vehicleToTransport?.year}` : `Vehículo a transportar: ${params.vehicleToTransport?.brand} ${params.vehicleToTransport?.model} ${params.vehicleToTransport?.year}`,
                payment_status: 'pending'
            };

            const { data, error } = await clinkcargoClient.functions.invoke('create-clinckargo-order', {
                body: orderData
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return {
                success: true,
                orderId: data?.order?.id || data?.orderId,
                status: data?.order?.status || 'searching',
                price: data?.order?.price
            };
        } catch (err) {
            console.error('ClinkargoTransport error:', err);
            return { success: false, error: 'Failed to create transport order' };
        }
    }

    static async getOrderStatus(orderId: string): Promise<{
        status: string;
        eta?: number;
        vehicleType?: string;
        driver?: { name: string; phone?: string; vehiclePlate?: string };
    } | null> {
        try {
            const { data, error } = await clinkcargoClient
                .from('orders')
                .select('status, eta, vehicle_type_assigned, driver_name, driver_phone, driver_plate')
                .eq('id', orderId)
                .single() as { data: Record<string, unknown> | null; error: unknown };

            if (error || !data) return null;

            return {
                status: data.status as string,
                eta: data.eta as number | undefined,
                vehicleType: data.vehicle_type_assigned as string | undefined,
                driver: data.driver_name ? {
                    name: data.driver_name as string,
                    phone: data.driver_phone as string | undefined,
                    vehiclePlate: data.driver_plate as string | undefined
                } : undefined
            };
        } catch {
            return null;
        }
    }

    static subscribeToOrderUpdates(
        orderId: string,
        callback: (status: string) => void
    ): () => void {
        const channel = clinkcargoClient
            .channel(`starterkar-transport-${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`
                },
                (payload) => {
                    callback(payload.new.status as string);
                }
            )
            .subscribe();

        return () => {
            clinkcargoClient.removeChannel(channel);
        };
    }

    static getAvailableVehicleTypes(): VehicleTransportType[] {
        return Object.keys(VEHICLE_TRANSPORT_VEHICLES) as VehicleTransportType[];
    }

    static getVehicleInfo(type: VehicleTransportType) {
        return VEHICLE_TRANSPORT_VEHICLES[type];
    }
}

export const TRANSPORT_STATUS_LABELS: Record<string, string> = {
    'processing_payment': 'Procesando pago',
    'searching': 'Buscando conductor',
    'driver_assigned': 'Conductor asignado',
    'pickup_route': 'En camino a recolección',
    'delivery_route': 'En camino a entrega',
    'completed': 'Entregado',
    'cancelled': 'Cancelado',
    'failed': 'Fallido'
};
