export interface CRMProvider {
    id: string;
    name: string;
    icon: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSync?: string;
}

export interface SyncLog {
    id: string;
    asset: string;
    event: string;
    time: string;
    status: 'success' | 'failed';
    crm: string;
}

// Simulador de envío a CRM
export async function syncLeadToCRM(assetData: any, provider: string): Promise<boolean> {
    console.log(`[CRM-ADAPTER] Syncing to ${provider}...`, assetData);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate 90% success rate
    return Math.random() > 0.1;
}

export const SUPPORTED_CRMS: CRMProvider[] = [
    { id: 'salesforce', name: 'Salesforce', icon: 'cloud', status: 'disconnected' },
    { id: 'hubspot', name: 'HubSpot', icon: 'hubspot', status: 'disconnected' },
    { id: 'webhook', name: 'Custom Webhook', icon: 'webhook', status: 'disconnected' }
];
