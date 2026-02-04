"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { calculateFiscalImpact, UserFiscalRegime, calculatePlatformFee, BUSINESS_RULES } from "@/lib/fiscal-utils";
import { AlertCircle, Info, ShieldCheck, Zap } from "lucide-react";

interface SummarySidebarProps {
    car: any;
    finalPrice: number;
    operationFee: number;
    operationFeeIva: number;
    insuranceSelection: { provider: string; cost: number };
    logisticsSelection: { provider: string; cost: number };
    serviceCost: number;
    serviceCostIva: number;
    longDistanceCost: number;
    gestoriaActive: boolean;
    warrantySelection: any;
    tradeInCredit: number;
    totalToPay: number;
    sellerFiscalRegime?: UserFiscalRegime;
}

export const SummarySidebar = ({
    car,
    finalPrice,
    insuranceSelection,
    logisticsSelection,
    serviceCost,
    serviceCostIva,
    longDistanceCost,
    gestoriaActive,
    warrantySelection,
    tradeInCredit,
    totalToPay,
    sellerFiscalRegime = 'PFF'
}: SummarySidebarProps) => {
    const fiscalImpact = calculateFiscalImpact(
        finalPrice,
        sellerFiscalRegime,
        car.category || 'Car',
        true // Por defecto asumimos activos usados en Clinkar P2P
    );

    const hasWithholdings = fiscalImpact.isrWithholding > 0 || fiscalImpact.ivaWithholding > 0;
    const platformFee = calculatePlatformFee(finalPrice);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 sticky top-24">
            <div className="relative overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] divide-y divide-border/50 transition-all hover:bg-white/50 dark:hover:bg-zinc-900/50">

                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none -translate-y-10 translate-x-10" />

                <h3 className="relative z-10 font-black text-xl mb-6 tracking-tight bg-gradient-to-br from-indigo-900 to-indigo-600 dark:from-white dark:to-white/70 bg-clip-text text-transparent flex items-center gap-2">
                    Tu Configuración
                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                </h3>

                <div className="pb-6 space-y-4 relative z-10">
                    <div className="flex gap-5 items-center bg-white/50 dark:bg-black/20 p-3 rounded-3xl border border-white/20 shadow-sm backdrop-blur-sm">
                        <div className="h-20 w-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl overflow-hidden shrink-0 shadow-inner relative group cursor-pointer">
                            <Image
                                src={car.images[0]}
                                alt={`${car.make} ${car.model}`}
                                fill
                                className="object-cover transition-transform group-hover:scale-110 duration-700"
                            />
                        </div>
                        <div className="space-y-1 py-1 min-w-0">
                            <div className="font-black text-sm uppercase tracking-tighter leading-tight truncate pr-2">{car.make} {car.model}</div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{car.year} • {car.location}</div>
                            <div className="pt-2">
                                <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                                    ${finalPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-6 space-y-4 relative z-10">
                    <SummaryLine label="Precio Acordado" value={finalPrice} />
                    <SummaryLine label="Protección Comprador (IVA incluido)" value={0} highlight />

                    <div className="relative group/fee p-2 -mx-2 rounded-xl hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <SummaryLine label="Gestión Vendedor (IVA incluido)" value={platformFee} />
                        {finalPrice < BUSINESS_RULES.INCENTIVE_THRESHOLD && (
                            <div className="flex items-center gap-1.5 mt-2 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30 w-fit">
                                <Zap className="h-3 w-3 text-amber-500 fill-amber-500 animate-pulse" />
                                <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter">
                                    Bonificación Aplicada (-${BUSINESS_RULES.INSPECTION_TOTAL})
                                </span>
                            </div>
                        )}
                    </div>
                    {insuranceSelection.cost > 0 && (
                        <SummaryLine label={`Seguro (${insuranceSelection.provider})`} value={insuranceSelection.cost} highlight />
                    )}
                    {logisticsSelection.cost > 0 && (
                        <SummaryLine label={`Envío (${logisticsSelection.provider})`} value={logisticsSelection.cost} highlight />
                    )}
                    {serviceCost > 0 && (
                        <SummaryLine label="Reparaciones Certificadas" value={serviceCost + serviceCostIva} />
                    )}
                    {longDistanceCost > 0 && (
                        <SummaryLine label="Traslado interestatal" value={longDistanceCost} highlight />
                    )}
                    {gestoriaActive && (
                        <SummaryLine label="Gestoría Legal" value={1250} highlight />
                    )}
                    {warrantySelection.price > 0 && (
                        <SummaryLine label={`Garantía: ${warrantySelection.name}`} value={warrantySelection.price} highlight />
                    )}
                    {tradeInCredit > 0 && (
                        <SummaryLine label="Crédito Bridge (Trade-in)" value={-tradeInCredit} highlight variant="success" />
                    )}

                    {hasWithholdings ? (
                        <div className="pt-6 mt-6 border-t border-dashed border-indigo-500/20 space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2 opacity-70">
                                <Info className="h-3 w-3" /> Retenciones SAT
                            </div>
                            <SummaryLine label="Retención ISR (1%)" value={-fiscalImpact.isrWithholding} variant="danger" />
                            <SummaryLine label="Retención IVA (8%)" value={-fiscalImpact.ivaWithholding} variant="danger" />

                            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-2xl mt-4 border border-indigo-500/10 backdrop-blur-md shadow-sm">
                                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Neto Liquidación</span>
                                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">${fiscalImpact.netToSeller.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-6 mt-6 border-t border-dashed border-emerald-500/20 space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">
                                <ShieldCheck className="h-3.5 w-3.5" /> Exención Fiscal
                            </div>
                            <div className="relative p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl overflow-hidden group hover:bg-emerald-500/10 transition-colors">
                                <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                                    Operación exenta de IVA e ISR para bienes muebles usados (Art. 9 LIVA).
                                </p>
                            </div>
                        </div>
                    )}


                    {/* PLD / Anti-Lavado Alerts */}
                    {(fiscalImpact.pldAlerts?.identification || fiscalImpact.pldAlerts?.notice) && (
                        <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-bottom-2">
                            {/* Identification Alert (Yellow/Orange) */}
                            {fiscalImpact.pldAlerts.identification && !fiscalImpact.pldAlerts.notice && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                                    <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-amber-700">Umbral de Identificación</p>
                                        <p className="text-[10px] leading-tight text-amber-800/80 mt-1">
                                            Por Ley Antilavado ({'>'}3,210 UMA), se debe integrar expediente completo del comprador.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Notice Alert (Red) - Overrides or complements Identification */}
                            {fiscalImpact.pldAlerts.notice && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-red-700">Umbral de Aviso al SAT</p>
                                        <p className="text-[10px] leading-tight text-red-800/80 mt-1">
                                            Operación reportable ({'>'}6,420 UMA). Clinkar generará el pre-llenado del aviso para el portal PLD.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-2 px-2">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total a Pagar</span>
                    <span className="text-4xl font-black tracking-tighter text-foreground bg-clip-text">${totalToPay.toLocaleString()}</span>
                </div>
                <div className="flex items-start gap-3 bg-zinc-950 dark:bg-black p-4 rounded-2xl border border-zinc-800 shadow-xl">
                    <div className="h-5 w-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="h-3 w-3 text-zinc-400" />
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                        El pago de inspección técnica ($1,500.00 MXN) se acredita automáticamente a la comisión en vehículos menores a $120k.
                    </p>
                </div>
            </div>
        </div>
    );
};

function SummaryLine({ label, value, highlight, variant }: { label: string, value: number, highlight?: boolean, variant?: 'success' | 'danger' }) {
    const textColor = variant === 'success' ? 'text-emerald-600' : variant === 'danger' ? 'text-rose-500' : highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground';

    return (
        <div className="flex justify-between items-center group">
            <span className={cn("text-xs font-medium text-muted-foreground transition-colors", highlight && "text-foreground font-bold")}>
                {label}
            </span>
            <span className={cn("text-xs font-bold font-mono transition-colors", textColor)}>
                {value < 0 ? '-' : ''}${Math.abs(value).toLocaleString()}
            </span>
        </div>
    );
}
