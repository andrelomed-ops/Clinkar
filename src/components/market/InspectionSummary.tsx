"use client";

import React from 'react';
import {
    ShieldCheck,
    CheckCircle2,
    Zap,
    Shield,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';
import { ClinkarSeal } from './ClinkarSeal';

interface InspectionSummaryProps {
    carId: string;
    compact?: boolean;
}

export function InspectionSummary({ carId, compact = false }: InspectionSummaryProps) {
    const [report, setReport] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    React.useEffect(() => {
        const fetchReport = async () => {
            const { data, error } = await supabase
                .from("inspection_reports_150")
                .select("*")
                .eq("car_id", carId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data) setReport(data);
            setLoading(false);
        };

        fetchReport();
    }, [carId]);

    if (loading) {
        return (
            <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center animate-pulse">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!report) return null;

    // Calculate real scores from report data
    // Structure: { category: { pass: boolean, ... } }
    const reportData = report.data || report.report_data || {};

    const categories = [
        { label: 'Estructura y Chasis', key: 'EXTERIOR', icon: Shield },
        { label: 'Motor y Transmisión', key: 'MOTOR', icon: Zap },
        { label: 'Seguridad y Frenos', key: 'FRENOS', icon: ShieldCheck },
        { label: 'Electrónica', key: 'ELÉCTRICO', icon: Search }
    ].map(cat => {
        const items = Object.values(reportData).filter((item: any) => item.category === cat.key);
        const total = items.length;
        const passed = items.filter((item: any) => item.status === 'pass').length;
        const score = total > 0 ? Math.round((passed / total) * 100) : 100;
        return { ...cat, score };
    });

    const averageScore = Math.round(categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length);

    return (
        <div className={cn(
            "glass-card p-6 md:p-8 rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/[0.02] animate-reveal",
            compact ? "p-4 rounded-2xl" : ""
        )}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <ClinkarSeal variant="full" />
                </div>
                {!compact && (
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-3xl font-black text-indigo-600 tracking-tighter">{(averageScore / 10).toFixed(1)}/10</span>
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Estado Técnico</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {categories.map((cat, idx) => (
                    <div
                        key={cat.label}
                        className="bg-white/50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-center gap-4"
                    >
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                            <cat.icon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black uppercase tracking-tight">{cat.label}</span>
                                <span className="text-xs font-bold text-indigo-600">{cat.score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${cat.score}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                Ver Reporte de Inspección Completo
                <ChevronRight className="h-5 w-5" />
            </button>
            <p className="text-center mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Validado por mecánico certificado Clinkar
            </p>
        </div>
    );
}
