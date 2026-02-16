import { VehicleCheckResult } from '../VehicleCheckService';

export interface IVehicleCheckProvider {
    checkTheftStatus(vin: string): Promise<VehicleCheckResult>;
}
