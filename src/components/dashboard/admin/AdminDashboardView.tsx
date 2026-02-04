"use client";

import { AlertCircle, BarChart3, CheckCircle2, DollarSign, Package, Users, Wrench, ShieldAlert, ReceiptText, Sparkles } from "lucide-react";

interface AdminDashboardViewProps {
    stats: {
        gmv: number;
        vaultValue: number;
        totalTransactions: number;
        activeTransactions: number;
        lastUpdated: string;
        serviceRevenue: number;
        commissionRevenue: number;
    };
}

export function AdminDashboardView({ stats }: AdminDashboardViewProps) {
    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Centro de Mando Administrativo</h1>
                    <p className="text-muted-foreground italic">Visión global del ecosistema Clinkar en tiempo real.</p>
                </div>
                <div className="text-xs font-mono text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
                    Última actualización: {new Date(stats.lastUpdated).toLocaleTimeString()}
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                    title="GMV Total"
                    value={`$${stats.gmv.toLocaleString()}`}
                    subvalue="Ventas acumuladas"
                    icon={<DollarSign className="h-6 w-6 text-green-600" />}
                    trend="+12% vs mes anterior"
                />
                <MetricCard
                    title="En Bóveda (Escrow)"
                    value={`$${stats.vaultValue.toLocaleString()}`}
                    subvalue="Capital en tránsito"
                    icon={<Package className="h-6 w-6 text-blue-600" />}
                />
                <MetricCard
                    title="Ingresos p. Servicios"
                    value={`$${stats.serviceRevenue.toLocaleString()}`}
                    subvalue="Seguros, Logística, Garantías"
                    icon={<Wrench className="h-6 w-6 text-indigo-600" />}
                />
                <MetricCard
                    title="Comisiones Clinkar"
                    value={`$${stats.commissionRevenue.toLocaleString()}`}
                    subvalue="Buyer Fee + Seller Fee"
                    icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />}
                />
                <MetricCard
                    title="Operaciones Totales"
                    value={stats.totalTransactions.toString()}
                    subvalue="Histórico clinkar"
                    icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
                />
                <MetricCard
                    title="Transacciones Activas"
                    value={stats.activeTransactions.toString()}
                    subvalue="En curso actualmente"
                    icon={<AlertCircle className="h-6 w-6 text-amber-600" />}
                    alert={stats.activeTransactions > 50}
                />
                <MetricCard
                    title="Leads por Trade-in"
                    value={`84`}
                    subvalue="Interés en autos nuevos"
                    icon={<Sparkles className="h-6 w-6 text-indigo-500" />}
                    trend="+18% hoy"
                    highlight
                />
            </div>

            {/* Compliance & Fiscal Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-zinc-900 border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                            <ShieldAlert className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Monitor PLD (Anti-Lavado)</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Actividades Vulnerables Detectadas</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-2xl border border-dashed border-border group hover:border-red-500/50 transition-colors">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-1 shrink-0" />
                            <div>
                                <p className="text-sm font-bold">3 Transacciones sobre el Umbral</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">Requieren validación manual de origen de fondos y reporte a la UIF.</p>
                                <button className="mt-2 text-[10px] font-black uppercase text-red-600 hover:tracking-widest transition-all">Revisar Expedientes →</button>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic text-center px-8 leading-relaxed">
                            Corte de reporte mensual: Próximos 15 días. Asegúrese de que los contratos tengan el anexo de identificación legal.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                            <ReceiptText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Proyección Fiscal (SAT)</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Retenciones Plataformas Digitales</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary/50 rounded-2xl">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Retención ISR total</p>
                            <p className="text-xl font-black text-foreground">$12,450</p>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-2xl">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Retención IVA total</p>
                            <p className="text-xl font-black text-foreground">$98,340</p>
                        </div>
                    </div>
                    <p className="mt-4 text-[10px] text-muted-foreground leading-relaxed">
                        Cifras proyectadas para liquidación de Bóveda en curso. Los CFDI de retenciones se deben timbrar al liberar los fondos.
                    </p>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, subvalue, icon, trend, alert, highlight }: any) {
    return (
        <div className={`bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border transition-all hover:shadow-lg ${alert ? 'border-amber-200 bg-amber-50/10' : highlight ? 'border-indigo-200 bg-indigo-50/5' : 'border-border'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary/50 rounded-2xl">
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</h3>
                <div className="text-3xl font-black tracking-tighter">{value}</div>
                <p className="text-xs text-muted-foreground">{subvalue}</p>
            </div>
        </div>
    );
}
