"use client";

import { useState, useEffect } from "react";
import { Bell, TrendingUp, Users, Car, DollarSign, ArrowUpRight, ArrowDownRight, Filter, RefreshCw, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demandService, DemandRequest, SellerLead } from "@/services/DemandService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DemandDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);
    const [demands, setDemands] = useState<DemandRequest[]>([]);
    const [sellerLeads, setSellerLeads] = useState<SellerLead[]>([]);
    const [filter, setFilter] = useState<'all' | 'demands' | 'leads'>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [analyticsData, demandsData, leadsData] = await Promise.all([
                demandService.getDemandAnalytics(),
                demandService.getDemandRequests({ limit: 50 }),
                demandService.getSellerLeads({ limit: 50 })
            ]);
            setAnalytics(analyticsData);
            setDemands(demandsData);
            setSellerLeads(leadsData);
        } catch (error) {
            console.error('Error loading demand data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
                    <p className="text-zinc-500">Cargando panel de demanda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-3">
                            <Bell className="h-8 w-8 text-indigo-600" />
                            Panel de Demanda
                        </h1>
                        <p className="text-zinc-500 mt-1">
                            Oportunidades de venta y peticiones de compradores
                        </p>
                    </div>
                    <Button onClick={loadData} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Actualizar
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500">Peticiones Activas</p>
                                    <p className="text-3xl font-black">{analytics?.totalDemands || 0}</p>
                                </div>
                                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                    <Search className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500">Autos en Venta</p>
                                    <p className="text-3xl font-black">{analytics?.totalSellerLeads || 0}</p>
                                </div>
                                <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                    <Car className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500">Tasa de Match</p>
                                    <p className="text-3xl font-black">{analytics?.matchedPercentage || 0}%</p>
                                </div>
                                <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500">Pendientes</p>
                                    <p className="text-3xl font-black">{analytics?.pendingPercentage || 0}%</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Marcas Más Buscadas
                        </CardTitle>
                        <CardDescription>Estas marcas tienen alta demanda - considera inverter en ellas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {analytics?.topSearchedBrands?.map((item: any, index: number) => (
                                <div key={item.brand} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full">
                                    <span className="font-bold text-sm">{item.brand}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {item.count} búsquedas
                                    </Badge>
                                </div>
                            )) || (
                                <p className="text-zinc-500 text-sm">No hay datos suficientes aún</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Oportunidades Recientes
                            </CardTitle>
                            <CardDescription>Peticiones de compradores y vendedores buscando match</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant={filter === 'all' ? 'default' : 'outline'} 
                                size="sm"
                                onClick={() => setFilter('all')}
                            >
                                Todo
                            </Button>
                            <Button 
                                variant={filter === 'demands' ? 'default' : 'outline'} 
                                size="sm"
                                onClick={() => setFilter('demands')}
                            >
                                Demandas
                            </Button>
                            <Button 
                                variant={filter === 'leads' ? 'default' : 'outline'} 
                                size="sm"
                                onClick={() => setFilter('leads')}
                            >
                                Vendedores
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(filter === 'all' ? [...demands.map(d => ({ type: 'demand', data: d })), ...sellerLeads.map(l => ({ type: 'lead', data: l }))] : 
                             filter === 'demands' ? demands.map(d => ({ type: 'demand', data: d })) :
                             sellerLeads.map(l => ({ type: 'lead', data: l }))
                            ).slice(0, 20).map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.type === 'demand' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                            {item.type === 'demand' ? (
                                                <Search className="h-5 w-5 text-indigo-600" />
                                            ) : (
                                                <Car className="h-5 w-5 text-emerald-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold">
                                                {item.type === 'demand' 
                                                    ? `Busca: ${item.data.brand} ${item.data.model || ''}`
                                                    : `Vende: ${item.data.current_brand} ${item.data.current_model} (${item.data.current_year})`
                                                }
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                {item.type === 'demand' && item.data.budget_max && (
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        Hasta ${Number(item.data.budget_max).toLocaleString()}
                                                    </span>
                                                )}
                                                {item.type === 'lead' && item.data.current_price_expected && (
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        ${Number(item.data.current_price_expected).toLocaleString()}
                                                    </span>
                                                )}
                                                {item.type === 'demand' && item.data.location && (
                                                    <span>• {item.data.location}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={item.data.status === 'matched' ? 'default' : 'secondary'}>
                                        {item.type === 'demand' 
                                            ? item.data.status === 'matched' ? '✓ Match' : 'Pendiente'
                                            : item.data.status === 'matched' ? '✓ Match' : 'Nuevo'
                                        }
                                    </Badge>
                                </div>
                            ))}
                            {demands.length === 0 && sellerLeads.length === 0 && (
                                <div className="text-center py-8 text-zinc-500">
                                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay oportunidades aún. ¡Comparte la plataforma!</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}