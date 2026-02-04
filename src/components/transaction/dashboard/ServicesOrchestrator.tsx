"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InsuranceSelector } from "../../dashboard/InsuranceSelector";
import { LogisticsSelector } from "../../dashboard/LogisticsSelector";
import { TowingServiceCard } from "@/components/checkout/TowingServiceCard";
import { WarrantySelector } from "@/components/checkout/WarrantySelector";
import { TradeInCalculator } from "@/components/checkout/TradeInCalculator";

interface ServicesOrchestratorProps {
    car: any;
    finalPrice: number;
    userProfile: any;
    syncing: boolean;
    savingServices: boolean;
    insuranceSelection: { provider: string; cost: number };
    setInsuranceSelection: (val: any) => void;
    logisticsSelection: { provider: string; cost: number };
    setLogisticsSelection: (val: any) => void;
    warrantySelection: any;
    setWarrantySelection: (val: any) => void;
    setTradeInCredit: (val: number) => void;
    handleSaveServices: () => void;
    totalToPay: number;
}

export const ServicesOrchestrator = ({
    car,
    finalPrice,
    userProfile,
    syncing,
    savingServices,
    insuranceSelection,
    setInsuranceSelection,
    logisticsSelection,
    setLogisticsSelection,
    warrantySelection,
    setWarrantySelection,
    setTradeInCredit,
    handleSaveServices,
    totalToPay
}: ServicesOrchestratorProps) => {
    if (syncing) {
        return (
            <div className="space-y-12">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-64 rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-[2rem]" />)}
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-64 rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
            <InsuranceSelector
                carValue={finalPrice}
                onSelectOption={(p, c) => setInsuranceSelection({ provider: p, cost: c })}
            />

            <LogisticsSelector
                origin={car.location}
                onSelectOption={(p, c) => setLogisticsSelection({ provider: p, cost: c })}
            />

            <div className="mt-8 border-t border-border pt-12">
                <TowingServiceCard
                    carLocation={car.location}
                    carName={`${car.make} ${car.model}`}
                    isBusinessProfile={userProfile?.role === 'Business'}
                />
            </div>

            <div className="mt-12 pt-12 border-t border-border">
                <WarrantySelector
                    carPrice={finalPrice}
                    onSelect={(w) => setWarrantySelection(w)}
                />
            </div>

            <div className="mt-12 pt-12 border-t border-border">
                <TradeInCalculator onAppraisalComplete={(val) => setTradeInCredit(val)} />
            </div>

            <div className="sticky bottom-8 z-30">
                <Button
                    size="lg"
                    onClick={handleSaveServices}
                    disabled={savingServices}
                    className="w-full h-20 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 font-extrabold text-xl rounded-[2rem] shadow-2xl active:scale-[0.98] transition-all hover:shadow-indigo-500/20 group"
                >
                    {savingServices ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Guardando Configuración...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span>Confirmar y Continuar al Pago</span>
                            <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-black tabular-nums">
                                ${totalToPay.toLocaleString()}
                            </span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
};
