
"use client";

import React, { useMemo } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Activity, CarFront, Zap } from 'lucide-react';

export function AdminTrendsDashboard({ data }: { data: { tickets: any[], cars: any[] } }) {
    // Process Weekly Inspections
    const inspectionData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => ({
            name: new Date(date).toLocaleDateString('es-MX', { weekday: 'short' }),
            total: data.tickets.filter(t => t.created_at.startsWith(date)).length
        }));
    }, [data.tickets]);

    // Process Inventory Growth (Cumulative)
    const inventoryData = useMemo(() => {
        const last6Months = [...Array(6)].map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return d.toISOString().slice(0, 7); // YYYY-MM
        }).reverse();

        let cumulative = 0;
        return last6Months.map(month => {
            const added = data.cars.filter(c => c.created_at.startsWith(month)).length;
            cumulative += added;
            return {
                name: new Date(month).toLocaleDateString('es-MX', { month: 'short' }),
                count: cumulative,
                added: added
            };
        });
    }, [data.cars]);

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inspections Trend */}
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Inspecciones Técnicas</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Actividad de los últimos 7 días</p>
                        </div>
                        <div className="h-10 w-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500">
                            <Activity className="h-5 w-5" />
                        </div>
                    </div>
                    
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={inspectionData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#52525b" 
                                    fontSize={10} 
                                    fontWeight="bold" 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="#52525b" 
                                    fontSize={10} 
                                    fontWeight="bold" 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                                    itemStyle={{ color: '#6366f1', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="#6366f1" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorTotal)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Inventory Growth */}
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Crecimiento de Inventario</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Evolución semestral del catálogo</p>
                        </div>
                        <div className="h-10 w-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <CarFront className="h-5 w-5" />
                        </div>
                    </div>
                    
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inventoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#52525b" 
                                    fontSize={10} 
                                    fontWeight="bold" 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="#52525b" 
                                    fontSize={10} 
                                    fontWeight="bold" 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip 
                                    cursor={{fill: '#18181b'}}
                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {inventoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === inventoryData.length - 1 ? '#10b981' : '#3f3f46'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Ratio de Conversión</p>
                        <p className="text-2xl font-black italic text-white">84.2%</p>
                    </div>
                    <div className="text-emerald-500 flex items-center gap-1 text-[10px] font-black">
                        <TrendingUp className="h-3 w-3" /> +2.4%
                    </div>
                </div>
                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Promedio de Cierre</p>
                        <p className="text-2xl font-black italic text-white">12 Días</p>
                    </div>
                    <div className="text-indigo-500 flex items-center gap-1 text-[10px] font-black">
                        <Zap className="h-3 w-3" /> -3d
                    </div>
                </div>
                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Churn Inversionistas</p>
                        <p className="text-2xl font-black italic text-white">1.2%</p>
                    </div>
                    <div className="text-emerald-500 flex items-center gap-1 text-[10px] font-black">
                        <CheckCircle2 className="h-3 w-3" /> Stable
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckCircle2({ className }: { className?: string }) {
    return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
}
