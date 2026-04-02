import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, Clock, UserCheck } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function DemandBoardPage() {
    const supabase = await createClient();

    // Fetch demands ordering by newest
    const { data: demands, error } = await supabase
        .from('demand_registry')
        .select(`
            id,
            brand,
            model,
            year_min,
            year_max,
            budget_max,
            notes,
            status,
            created_at,
            user:profiles!user_id(full_name, role)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    return (
        <div className="container max-w-6xl py-12 space-y-8 animate-in fade-in duration-500 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500">
                        Autos Solicitados
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                        Nuestra comunidad de compradores está buscando estos vehículos ahora mismo. Si tienes uno de estos autos, la venta está prácticamente garantizada a través de nuestra Bóveda Digital.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/sell">
                        <Button variant="default" className="shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            Vender mi auto
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6">
                {demands && demands.length > 0 ? (
                    demands.map((demand: any) => (
                        <Card key={demand.id} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 bg-card/50 backdrop-blur-sm border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="w-24 h-24 text-primary rotate-12" />
                            </div>
                            
                            <CardHeader className="pb-3 z-10 relative">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary uppercase font-bold tracking-wider text-[10px] items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                        Comprador Activo
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(demand.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <CardTitle className="text-xl mt-3 font-bold group-hover:text-primary transition-colors">
                                    Busca: {demand.brand} {demand.model || ''}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <UserCheck className="w-3.5 h-3.5" />
                                    {demand.user?.full_name ? demand.user.full_name.split(' ')[0] : 'Usuario StarterKar'} 
                                    {demand.user?.role === 'partner' && <Badge variant="outline" className="text-[9px] px-1 h-4">Agencia / Partner</Badge>}
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="space-y-4 z-10 relative">
                                <div className="grid grid-cols-2 gap-4 text-sm bg-background/50 rounded-lg p-3 border border-border/50">
                                    <div>
                                        <div className="text-muted-foreground text-xs uppercase font-semibold mb-1">Año Esperado</div>
                                        <div className="font-medium text-foreground">
                                            {demand.year_min && demand.year_max ? `${demand.year_min} - ${demand.year_max}` : demand.year_min || demand.year_max || 'No especificado'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground text-xs uppercase font-semibold mb-1">Presupuesto Max</div>
                                        <div className="font-medium text-green-500 dark:text-green-400">
                                            {demand.budget_max ? `$${demand.budget_max.toLocaleString('es-MX')}` : 'A negociar'}
                                        </div>
                                    </div>
                                </div>

                                {demand.notes && (
                                    <div className="text-sm text-foreground bg-accent/30 rounded-lg p-3 italic border-l-2 border-primary">
                                        "{demand.notes}"
                                    </div>
                                )}
                            </CardContent>
                            
                            <CardFooter className="pt-2 z-10 relative">
                                <Link href={`/seller-lead?match_demand=${demand.id}`} className="w-full">
                                    <Button className="w-full font-semibold group-hover:bg-primary" variant="secondary">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Tengo este auto
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-border rounded-xl bg-card">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Zap className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No hay peticiones activas por el momento</h3>
                            <p className="text-muted-foreground max-w-md">
                                Cuando los usuarios usen nuestro buscador inteligente o platiquen con nuestro asistente IA buscando un auto específico, aparecerá aquí.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
