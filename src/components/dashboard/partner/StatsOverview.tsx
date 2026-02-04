"use client";

import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, DollarSign, Activity } from "lucide-react";

const STATS = [
    {
        label: "Total Inspecciones",
        value: "142",
        change: "+12% vs mes ant.",
        icon: Activity,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        label: "Tasa de Aprobación",
        value: "88%",
        change: "+5% calidad",
        icon: ShieldCheck,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    },
    {
        label: "Valor Protegido",
        value: "$2.4M",
        change: "+18% Escrow",
        icon: DollarSign,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    },
    {
        label: "Satisfacción Cliente",
        value: "4.9/5",
        change: "Métrica Clinkar",
        icon: TrendingUp,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10"
    }
];

export function StatsOverview() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {STATS.map((stat, idx) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-[2rem] bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                    <div className="relative z-10">
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black tracking-tighter">{stat.value}</span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{stat.change}</span>
                        </div>
                    </div>
                    {/* Subtle decorative background circle */}
                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.bg} opacity-50 blur-2xl group-hover:scale-150 transition-transform`} />
                </motion.div>
            ))}
        </div>
    );
}
