"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const TREND_DATA = [
    { name: 'Ene', inspecciones: 45, aprobadas: 38 },
    { name: 'Feb', inspecciones: 52, aprobadas: 42 },
    { name: 'Mar', inspecciones: 48, aprobadas: 40 },
    { name: 'Abr', inspecciones: 61, aprobadas: 55 },
    { name: 'May', inspecciones: 55, aprobadas: 48 },
    { name: 'Jun', inspecciones: 75, aprobadas: 68 },
];

const CATEGORY_DATA = [
    { name: 'Autos', value: 85, color: '#4f46e5' },
    { name: 'Yates', value: 32, color: '#0ea5e9' },
    { name: 'Aviones', value: 12, color: '#8b5cf6' },
    { name: 'Industrial', value: 13, color: '#f59e0b' },
];

export function PerformanceCharts() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Trend Chart */}
            <div className="lg:col-span-2 p-6 md:p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-sm relative overflow-hidden">
                <div className="mb-8">
                    <h3 className="text-lg font-black tracking-tight">Tendencia de Certificación</h3>
                    <p className="text-sm text-muted-foreground">Volumen mensual de inspecciones y Sellos Clinkar otorgados.</p>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={TREND_DATA}>
                            <defs>
                                <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fontWeight: 500 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '1.5rem',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="inspecciones"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorInspections)"
                            />
                            <Area
                                type="monotone"
                                dataKey="aprobadas"
                                stroke="#10b981"
                                strokeWidth={3}
                                fill="transparent"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Mix Bar Chart */}
            <div className="p-6 md:p-8 rounded-[2.5rem] bg-zinc-950 text-white shadow-2xl relative overflow-hidden">
                <div className="mb-8 relative z-10">
                    <h3 className="text-lg font-black tracking-tight text-white">Mix de Activos</h3>
                    <p className="text-sm text-zinc-400">Distribución por categoría de inventario.</p>
                </div>

                <div className="h-[250px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ left: -20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 700 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff' }}
                            />
                            <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={20}>
                                {CATEGORY_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Decorative background logo or pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <div className="w-32 h-32 border-8 border-white rounded-full translate-x-12 -translate-y-12" />
                </div>
            </div>
        </div>
    );
}
