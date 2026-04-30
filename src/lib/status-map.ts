export const STATUS_MAP: Record<string, { label: string, color: string }> = {
    'published': { label: 'PUBLICADO', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    'certified': { label: 'CERTIFICADO', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    'reserved': { label: 'RESERVADO', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    'sold': { label: 'VENDIDO', color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' },
    'archived': { label: 'ARCHIVADO', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    'draft': { label: 'BORRADOR', color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' },
    'legal_review': { label: 'REVISIÓN LEGAL', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    'inspection_scheduled': { label: 'INSPECCIÓN PROG.', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    'pending_inspection': { label: 'EN REVISIÓN', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    'PENDING': { label: 'PENDIENTE', color: 'text-amber-500' },
    'P2P_WAITING_PROOF': { label: 'ESPERANDO PAGO', color: 'text-amber-500' },
    'P2P_VALIDATED': { label: 'PAGO VALIDADO', color: 'text-emerald-500' },
    'HANDOVER_SCHEDULED': { label: 'ENTREGA PROG.', color: 'text-emerald-500' },
    'RELEASED': { label: 'FINALIZADO', color: 'text-zinc-400' },
    'CANCELLED': { label: 'CANCELADO', color: 'text-red-500' },
    'DISPUTED': { label: 'DISPUTA', color: 'text-red-500' }
};
