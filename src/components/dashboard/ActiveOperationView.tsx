import { useState } from "react";
import { VaultStatus } from "@/components/dashboard/VaultStatus";
import { UnifiedVehicleStatusView } from "@/components/dashboard/UnifiedVehicleStatusView";
import { LogisticsSelector } from "@/components/dashboard/LogisticsSelector";

interface ActiveOperationViewProps {
    transaction: any; // Using any for simplicity in prototype, should be typed
    role: string;
}

export function ActiveOperationView({ transaction, role }: ActiveOperationViewProps) {
    const [logisticsCost, setLogisticsCost] = useState(0);

    const totalOperationValue = transaction.price + logisticsCost;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 w-full overflow-hidden">
            {/* Header for the selected view */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">{transaction.carName} {transaction.year}</h2>
                    <p className="text-slate-500">Gestión de operación #{transaction.id}</p>
                </div>
                <div className="text-right bg-white/50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total a Pagar</p>
                    <div className="flex items-baseline justify-end gap-2">
                        <p className="text-3xl font-black text-slate-900">${totalOperationValue.toLocaleString()}</p>
                        <span className="text-xs font-bold text-slate-400">MXN</span>
                    </div>
                    {logisticsCost > 0 && (
                        <p className="text-[10px] font-bold text-blue-600 flex items-center justify-end gap-1 mt-1">
                            + ${logisticsCost.toLocaleString()} Envío & Seguro
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-1">
                <VaultStatus
                    carPrice={transaction.price}
                    carYear={transaction.year}
                    status={transaction.status}
                    legalStatus={transaction.legalStatus}
                    mechanicalStatus={transaction.mechanicalStatus}
                    contractStatus={transaction.contractStatus}
                    currency="MXN"
                />
            </div>

            {/* Unified Status Section */}
            <div className="pt-2 grid grid-cols-1 gap-8">
                <UnifiedVehicleStatusView carId={transaction.id} role={role} location={transaction.location || "CDMX"} />

                {/* Logistics Selector - Only for Buyers and if status allows (e.g., not yet delivered) */}
                {role === 'buyer' && transaction.status !== 'RELEASED' && (
                    <LogisticsSelector
                        carValue={transaction.price}
                        origin={transaction.location || "CDMX"}
                        destination="Mi Ubicación"
                        onSelectOption={(option, cost) => setLogisticsCost(cost)}
                    />
                )}
            </div>
        </div>
    );
}
