import { ShippingQuote } from '../LogisticsService';

export interface ILogisticsProvider {
    calculateQuote(origin: string, destination: string): Promise<ShippingQuote>;
    // trackOrder could be added here later
}
