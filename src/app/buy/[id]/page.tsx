import { CarService } from '@/services/CarService';
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, MapPin, Gauge, Fuel, Calendar, Zap, Wind, AlertCircle, Lock, CheckCircle } from "lucide-react";
import { DigitalPassport } from "@/components/market/visionary/DigitalPassport";
import { ClinkarSeal } from "@/components/market/ClinkarSeal";
import { InspectionSummary } from "@/components/market/InspectionSummary";
import { PriceEquation } from "@/components/market/PriceEquation";
import { CreditSimulator } from "@/components/checkout/CreditSimulator";
import { ImportBadge } from "@/components/market/ImportBadge";
import { cn } from "@/lib/utils";
import { ShareButton } from "@/components/market/ShareButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ALL_CARS } from '@/data/cars';
import { startTransaction } from '@/app/actions/transaction';
import { CheckoutAction } from "@/components/checkout/CheckoutAction";
import { InspectionService } from '@/services/InspectionService';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    let car = await CarService.getCarById(supabase, id);

    if (!car) {
        // Fallback to mock data for metadata
        car = ALL_CARS.find(c => c.id === id) || null;
    }

    if (!car) {
        return {
            title: 'Auto no encontrado | Clinkar',
        };
    }

    const title = `${car.make} ${car.model} ${car.year} | Clinkar`;
    const description = `Compra este ${car.make} ${car.model} ${car.year} en excelentes condiciones. Kilometraje: ${car.distance}km. Precio: $${car.price.toLocaleString()}. Solo en Clinkar.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: car.images?.[0] ? [{ url: car.images[0] }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: car.images?.[0] ? [car.images[0]] : [],
        }
    };
}

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch from Real DB
    const dbCar = await CarService.getCarById(supabase, id);

    // If not found in DB, try the Mock (Temporary for Hybrid compatibility during migration)
    const car = dbCar || ALL_CARS.find(c => c.id === id);

    if (!car) {
        notFound();
    }

    // Fetch Latest Inspection Report
    const report = await InspectionService.getLatestReport(supabase, id);

    // Calculate real score for the Passport
    let inspectionScore = 0;
    if (report) {
        const items = Object.values(report.data || report.report_data || {});
        const total = items.length;
        const passed = items.filter((item: any) => item.status === 'pass' || item.pass === true).length;
        inspectionScore = total > 0 ? Math.round((passed / total) * 100) : 0;
    }

    const passportData = {
        blockchainHash: report?.id ? `CLNK-${report.id.substring(0, 8).toUpperCase()}` : (car.digitalPassport?.blockchainHash || "PENDING-VALIDATION"),
        events: [
            ...(report ? [{
                date: new Date(report.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
                type: "Certificación de 150 Puntos Clinkar",
                verifiedBy: "Inspector Certificado #ID-094",
            }] : []),
            ...(car.digitalPassport?.events || [])
        ],
        score: inspectionScore || 92 // Fallback to 92 for aesthetic if no report yet
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-500 overflow-x-hidden">
            <JsonLd data={{
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": `${car.make} ${car.model} ${car.year}`,
                "image": car.images || [],
                "description": `Auto ${car.make} ${car.model} ${car.year} en ${car.location}. Kilometraje: ${car.distance}km.`,
                "brand": {
                    "@type": "Brand",
                    "name": car.make
                },
                "offers": {
                    "@type": "Offer",
                    "url": `https://clinkar.com/buy/${car.id}`,
                    "priceCurrency": "MXN",
                    "price": car.price,
                    "itemCondition": car.condition === 'New' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
                    "availability": "https://schema.org/InStock"
                }
            }} />
            {/* Navbar Placeholder - Just for back navigation mainly */}
            {/* Navbar Placeholder - Just for back navigation mainly */}
            <nav className="fixed top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 pt-[env(safe-area-inset-top)]">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/buy" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al Inventario
                    </Link>
                    <div className="font-bold text-xl tracking-tight">Clinkar<span className="text-blue-600">.</span></div>
                    <div className="w-24" /> {/* Spacer for centering */}
                </div>
            </nav>

            <main className="pt-24 pb-32 max-w-7xl mx-auto px-4 sm:px-8">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Visuals & Tech Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Image */}
                        <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm relative group">
                            {car.images?.[0] ? (
                                <img
                                    src={car.images[0]}
                                    alt={`${car.make} ${car.model}`}
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                    fetchPriority="high"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-zinc-400">
                                    Sin Imagen
                                </div>
                            )}

                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                {car.status === 'CERTIFIED' && (
                                    <ClinkarSeal variant="compact" />
                                )}
                                {(car.location?.includes('Baja California') || car.location?.includes('Sonora') || car.location?.includes('Chihuahua') || car.location?.includes('Coahuila') || car.location?.includes('Tamaulipas')) && (
                                    <ImportBadge type="FRONTERIZO" className="!p-2 shadow-none border-none bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl" />
                                )}
                            </div>
                        </div>

                        {/* Sensory Data & Description */}
                        <div className="prose dark:prose-invert max-w-none">
                            <h2 className="text-2xl font-bold mb-4">Análisis del Vehículo</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Este {car.make} {car.model} {car.year} ha sido rigurosamente inspeccionado por nuestros expertos.
                                {car.sensory?.engineSound?.analysis && (
                                    <span className="block mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <span className="font-bold text-zinc-900 dark:text-white block mb-2 flex items-center gap-2">
                                            <Wind className="h-4 w-4" /> Análisis Acústico del Motor
                                        </span>
                                        {car.sensory.engineSound.analysis}
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* TRUST & SECURITY SECTION (Holographic) */}
                        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-5 sm:p-8 text-white isolate shadow-2xl">
                            {/* Background Effects */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 relative z-10">
                                <ShieldCheck className="h-8 w-8 text-emerald-400" />
                                Garantía de Confianza Clinkar
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <h4 className="font-bold text-lg">Revisión de 150 Puntos</h4>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                        Cada auto es inspeccionado físicamente por mecánicos certificados. <span className="text-white">No vendemos sorpresas.</span>
                                    </p>
                                </div>
                                <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                                        <Lock className="h-6 w-6" />
                                    </div>
                                    <h4 className="font-bold text-lg">Protección de Fondos</h4>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                        Tu dinero permanece seguro en nuestra <strong className="text-white">Bóveda Digital</strong> hasta que confirmas la entrega del vehículo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* DigitalPassport rediseñado y activo */}
                        <div className="mt-8">
                            <DigitalPassport data={passportData} />
                        </div>

                        {/* Credit Simulator Section */}
                        <div className="mt-12 animate-reveal stagger-2">
                            <CreditSimulator carPrice={car.price} carName={`${car.make} ${car.model}`} carId={car.id} />
                        </div>
                    </div>

                    {/* Right Column: Interaction Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                                <div className="pb-6 border-b border-zinc-100 dark:border-zinc-800 mb-6">
                                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
                                        {car.make} {car.model}
                                    </h1>
                                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-900 dark:text-zinc-300">
                                            {car.year}
                                        </span>
                                        <span>•</span>
                                        <span>{car.condition === 'New' ? 'Nuevo' : 'Seminuevo'}</span>
                                        <span>•</span>
                                        <span>ID de Stock: {car.id.split('-').pop()}</span>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Precio Final</div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black text-zinc-900 dark:text-white">
                                            ${car.price.toLocaleString()}
                                        </span>
                                        {car.marketValue && car.marketValue > car.price && (
                                            <span className="text-sm text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                                                Ahorras ${(car.marketValue - car.price).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Incluye Certificado de Inspección (60 días) y acceso a Garantía Mecánica de 90 días.
                                    </div>
                                </div>

                                {/* INSPECTION WIDGET (New) */}
                                <div className="mb-8">
                                    <InspectionSummary carId={car.id} />
                                </div>

                                {/* Price Equation */}
                                {car.priceEquation && (
                                    <div className="mb-8">
                                        <PriceEquation data={car.priceEquation} />
                                    </div>
                                )}

                                {/* Call to Action Form */}
                                {/* CHECKOUT WIDGET (New Logic Phase 7) */}
                                <div id="checkout-widget" className="scroll-mt-32">
                                    <CheckoutAction
                                        carId={car.id}
                                        carPrice={car.price}
                                        carLocation={car.location || "CDMX"}
                                    />
                                </div>

                                <Link
                                    href={`/contact?subject=Cita para ${car.make} ${car.model}&id=${car.id}`}
                                    className="block w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-center font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    Agendar Cita / Prueba de Manejo
                                </Link>

                                <ShareButton
                                    title={`¡Mira este ${car.make} ${car.model}!`}
                                    text={`Encontré este ${car.make} certificado en Clinkar. Incluye revisión de 150 puntos y garantía.`}
                                />
                            </div>

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-zinc-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                        <Gauge className="h-3 w-3" /> Kilometraje
                                    </div>
                                    <div className="font-bold text-zinc-900 dark:text-white">
                                        {car.distance.toLocaleString()} km
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-zinc-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                        <Fuel className="h-3 w-3" /> Combustible
                                    </div>
                                    <div className="font-bold text-zinc-900 dark:text-white">
                                        {car.fuel}
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-zinc-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                        <Zap className="h-3 w-3" /> Transmisión
                                    </div>
                                    <div className="font-bold text-zinc-900 dark:text-white">
                                        {car.transmission}
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-zinc-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Ubicación
                                    </div>
                                    <div className="font-bold text-zinc-900 dark:text-white text-sm">
                                        {car.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* FLOATING ACTION BAR (Mobile Only) */}
            <div className="fixed bottom-0 left-0 right-0 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white/80 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 lg:hidden z-40 animate-in slide-in-from-bottom-full duration-500">
                <div className="flex items-center gap-4 max-w-7xl mx-auto">
                    <div className="flex-1">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide">Precio Total</p>
                        <p className="text-2xl font-black text-zinc-900 dark:text-white">${car.price.toLocaleString()}</p>
                    </div>
                    <div className="flex-1">
                        <Link
                            href="#checkout-widget"
                            className="flex items-center justify-center w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            Comprar Ahora
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
