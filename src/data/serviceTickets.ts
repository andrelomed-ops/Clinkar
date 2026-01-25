export interface ServiceTicket {
    id: string;
    carId: string;
    workshopId: string;
    workshopName: string; // Denormalized for mock display
    scheduledDate: string; // ISO String
    status: 'PAID_PENDING_VISIT' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
    inspectionReportUrl?: string;
    payoutStatus: 'PENDING' | 'PAID_TO_PARTNER';
    payoutAmount: number;
}

export const MOCK_SERVICE_TICKETS: ServiceTicket[] = [
    {
        id: 'TKT-001',
        carId: 'suv-1', // Honda CR-V (Existing mock car)
        workshopId: 'PARTNER-MX-001',
        workshopName: 'Mecánica Tek Satélite',
        scheduledDate: '2026-02-15T10:00:00Z',
        status: 'COMPLETED',
        inspectionReportUrl: '/reports/inspection-suv-1.pdf',
        payoutStatus: 'PAID_TO_PARTNER',
        payoutAmount: 750.00
    },
    {
        id: 'TKT-002',
        carId: 'sedan-1', // Tesla Model 3
        workshopId: 'PARTNER-MX-002',
        workshopName: 'EV Specialists Condesa',
        scheduledDate: '2026-02-20T14:00:00Z',
        status: 'IN_PROGRESS',
        payoutStatus: 'PENDING',
        payoutAmount: 750.00
    },
    {
        id: 'TKT-003',
        carId: 'pickup-1', // Ford Lobo
        workshopId: 'PARTNER-MX-003',
        workshopName: 'Taller 4x4 Offroad',
        scheduledDate: '2026-02-22T09:00:00Z',
        status: 'PAID_PENDING_VISIT',
        payoutStatus: 'PENDING',
        payoutAmount: 750.00
    }
];

export const MOCK_FEE_CONFIG = {
    upfrontInspectionPrice: 900.00,
    mechanicPayoutAmount: 750.00,
    clinkarAdminFee: 150.00,
    successFeeDeferred: 600.00,
    penaltyFee: 2000.00
};
