"use client";

import { useEffect, useState } from "react";
import { FileCheck, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ClinkarSeal } from "./ClinkarSeal";

interface InspectionWidgetProps {
    carId: string;
}

export function InspectionWidget({ carId }: InspectionWidgetProps) {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            const { data, error } = await supabase
                .from("inspection_reports_150")
                .select("*")
                .eq("car_id", carId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setReport(data);
            }
            setLoading(false);
        };

        fetchReport();
    }, [carId]);

    if (loading) return <div className="animate-pulse h-32 bg-zinc-100 dark:bg-zinc-900 rounded-3xl" />;

    // If no report found, don't render anything (or render fallback)
    if (!report) return null;

    // Calculate Score based on JSON data
    // Assuming data structure: { "item_key": { "pass": true/false, ... } }
    const items = Object.values(report.data || {});
    const totalItems = items.length;
    const passedItems = items.filter((item: any) => item.pass).length;
    const score = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0;

    const isPerfect = score === 100;
    const isGood = score >= 90;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm overflow-hidden relative group">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ClinkarSeal variant="compact" />
                    </div>

                    <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mb-4">
                        Este vehículo ha superado nuestra estricta inspección mecánica y legal adaptada por categoría.
                    </p>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.alert("Aquí se abriría el PDF generado anteriormente.")}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            <FileCheck className="h-4 w-4" />
                            Ver Reporte PDF
                        </button>
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                            Vigente por 60 días
                        </span>
                    </div>
                </div>

                {/* Score Circle */}
                <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                                className="text-zinc-100 dark:text-zinc-800"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="48"
                                cy="48"
                            />
                            <circle
                                className={isGood ? "text-emerald-500" : "text-amber-500"}
                                strokeWidth="8"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (251.2 * score) / 100}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="48"
                                cy="48"
                            />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-2xl font-black text-zinc-900 dark:text-white block leading-none">
                                {score}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Puntos</span>
                        </div>
                    </div>
                    <div className="mt-2 text-xs font-bold text-zinc-500">
                        {isPerfect ? "Impecable" : "Excelente"}
                    </div>
                </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-[10px] text-zinc-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Inspección realizada por <strong>Clinkar Expert Mechanics</strong></span>
            </div>
        </div>
    );
}
