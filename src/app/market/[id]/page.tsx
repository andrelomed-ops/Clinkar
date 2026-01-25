import { createClient } from "@/lib/supabase/server";
import { Shield, CheckCircle2, Info, MapPin, Calendar, Gauge, ArrowRight, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { SensoryHealthCard } from '@/components/market/visionary/SensoryHealthCard';
import { DigitalPassport } from '@/components/market/visionary/DigitalPassport';
import { OfferModal } from "@/components/market/OfferModal";
import { ALL_CARS } from "@/data/cars";

export default async function CarDetailsPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { id } = await params;

    const { data: carData } = await supabase
        .from("cars")
        .select("*, profiles(full_name)")
        .eq("id", id)
        .single();

    const { data: report } = await supabase
        .from("inspection_reports_150")
        .select("*")
        .eq("car_id", id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    const { data: quotation } = await supabase
        .from("repair_quotations")
        .select("*")
        .eq("car_id", id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    const car = carData || ALL_CARS.find(c => c.id === id);

    if (!car) {
        notFound();
    }

    // Anonymize seller name
    const sellerDisplayName = "Vendedor Verificado Clinkar";
    const repairTotal = quotation?.total_amount || 0;

    // Performance metrics for summary
    const inspectionPoints = report?.data?.checklist || {};
    const passCount = Object.values(inspectionPoints).filter((v: any) => v.pass && !v.na).length;
    const naCount = Object.values(inspectionPoints).filter((v: any) => v.na).length;
    const score = Math.round((passCount / (150 - naCount)) * 100) || 0;

    return (
        <div className="min-h-screen bg-background">
            <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/market" className="flex items-center gap-2 group">
                        <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-semibold text-sm">Volver al mercado</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold tracking-tight">Clinkar</span>
                    </div>
                    <div className="w-24" />
                </div>
            </nav>

            <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Photos */}
                    <section className="space-y-4">
                        <div className="aspect-video rounded-[3rem] overflow-hidden bg-secondary shadow-2xl">
                            {car.images?.[0] ? (
                                <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sin foto</div>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {car.images?.slice(1).map((img: string, i: number) => (
                                <div key={i} className="aspect-video rounded-2xl overflow-hidden bg-secondary border border-border">
                                    <img src={img} alt="Detail" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                        {/* Executive Summary for Buyer */}
                        {car.has_clinkar_seal && (
                            <div className="mt-8 bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black italic">Informe Ejecutivo</h3>
                                    <div className="px-4 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase italic">Certificación 150 Puntos</div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dictamen Técnico</span>
                                        <div className="text-2xl font-black text-primary">{score}% Calidad</div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reparaciones Valoradas</span>
                                        <div className="text-2xl font-black text-red-500">${repairTotal.toLocaleString()} MXN</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dictamen Legal</span>
                                        <div className="text-2xl font-black text-green-600 flex items-center gap-2">
                                            Aprobado
                                            <Shield className="h-5 w-5 fill-current" />
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Antecedentes</span>
                                        <div className="text-lg font-bold text-foreground">Sin Reporte de Robo</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/50 rounded-2xl border border-border text-xs font-bold leading-relaxed flex gap-3">
                                    <Info className="h-4 w-4 shrink-0 text-primary" />
                                    Transparencia total: se han detectado daños técnicos valorados en ${repairTotal.toLocaleString()} MXN. Este monto ha sido descontado automáticamente del piso de negociación para proteger tu inversión.
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Info & Buy */}
                    <section className="space-y-8">
                        <header className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Bóveda Disponible
                                </div>
                                {car.has_clinkar_seal && (
                                    <div className="flex items-center gap-1.5 bg-primary px-3 py-1 rounded-full text-white animate-bounce-subtle">
                                        <Shield className="h-4 w-4 fill-current" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Sello Clinkar</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-5xl font-black">{car.make} {car.model}</h1>
                            <div className="flex flex-wrap gap-6 text-muted-foreground font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {car.year}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {car.location}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Gauge className="h-4 w-4" />
                                    VIN: {car.vin ? car.vin.slice(0, 8) : 'N/A'}...
                                </div>
                            </div>
                        </header>

                        <div className="flex gap-2 mb-6">
                            {car.tags.map((tag: string) => (
                                <span key={tag} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-slate-100 text-slate-800">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* 🧠 VISIONARY MODULES */}
                        {car.sensory && (
                            <SensoryHealthCard data={car.sensory} />
                        )}

                        {car.digitalPassport && (
                            <DigitalPassport data={car.digitalPassport} />
                        )}

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-lg font-semibold mb-2">Descripción del Vehículo</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {car.description}
                            </p>
                        </div>

                        <div className="text-4xl font-extrabold text-primary">
                            ${Number(car.price).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">MXN</span>
                        </div>

                        <div className="bg-secondary/50 rounded-3xl p-8 space-y-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Descripción del Vendedor
                            </h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {car.description}
                            </p>
                            <div className="pt-4 border-t border-border/50 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                    {sellerDisplayName.charAt(0)}
                                </div>
                                <span className="text-sm font-semibold">{sellerDisplayName}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <OfferModal
                                id={car.id}
                                carPrice={Number(car.price)}
                                repairCost={repairTotal}
                                carName={`${car.make} ${car.model}`}
                                hasSeal={!!car.has_clinkar_seal}
                            />
                            <p className="text-center text-xs text-muted-foreground px-8 font-medium">
                                Toda comunicación con el vendedor está anonimizada por Clinkar. Tu privacidad y documentos legales sensibles están protegidos.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
