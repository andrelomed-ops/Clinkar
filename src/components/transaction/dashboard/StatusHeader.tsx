export type TransactionStep = 'NEGOTIATION' | 'OFFER_ACCEPTED' | 'INSPECTION' | 'PAYMENT' | 'DOCUMENTS' | 'HANDOVER' | 'COMPLETED';

export const StatusHeader = ({ step, trxId }: { step: TransactionStep; trxId: string | null }) => null;

export const NegotiationView = (props: any) => null;

export const ServicesOrchestrator = (props: any) => null;

export const SummarySidebar = (props: any) => null;