
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { NotificationService } from "@/services/NotificationService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Calendar, MapPin, CheckCircle2, Warehouse, Clock, ChevronDown, MessageSquare, Cpu, ArrowRight, Zap, Loader2 } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { VEHICLE_CATEGORIES } from "@/lib/vehicle-intake-config";
import { SellAuthModal } from "@/components/sell/SellAuthModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Partner {
    id: string;
    name: string;
    address: string;
    city: string;
}

export default function SellOnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createBrowserClient();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [selectedPartner, setSelectedPartner] = useState<any | null>(null);

    const categoryId = searchParams.get('category') || "";
    const year = searchParams.get('year') || "";
    const make = searchParams.get('make') || "";
    const model = searchParams.get('model') || "";
    const km = searchParams.get('km') || "0";
    const isAdmin = searchParams.get('admin') === 'true';
    const mktCat = searchParams.get('mkt_cat') || 'REGULAR';
    const agencyName = searchParams.get('agency') || '';
    const bonusText = searchParams.get('bonus') || '';
    
    const [selectedPlan, setSelectedPlan] = useState<'GO' | 'VIP'>('GO');
    const [phone, setPhone] = useState("");
    const [needsPhone, setNeedsPhone] = useState(false);

    // Luxury Brand Detection
    const PREMIUM_BRANDS = ['BMW', 'AUDI', 'MERCEDES-BENZ', 'MERCEDES BENZ', 'PORSCHE', 'LAND ROVER', 'JAGUAR', 'VOLVO', 'MINI', 'TESLA', 'LEXUS'];
    const isPremium = PREMIUM_BRANDS.includes(make.toUpperCase());

    const totalCost = isPremium 
        ? (selectedPlan === 'VIP' ? 3500 : 2500)
        : (selectedPlan === 'VIP' ? 1500 : 800);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const [isAuthChecking, setIsAuthChecking] = useState(false);

    const [partners, setPartners] = useState<any[]>([
        {
            id: 'fallback-1',
            name: 'Taller Aliado CDMX Central',
            address: 'Av. Insurgentes Sur, CDMX',
            city: 'Ciudad de México'
        }
    ]);

    useEffect(() => {
        const fetchPartners = async () => {
            const { data } = await supabase.from('partners').select('*');
            if (data && data.length > 0) {
                setPartners(data);
                // Auto-select if only one
                if (data.length === 1 && !selectedPartner) {
                    setSelectedPartner(data[0]);
                }
            } else if (partners.length === 1 && !selectedPartner) {
                // Auto-select fallback
                setSelectedPartner(partners[0]);
            }
        };
        fetchPartners();
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(false); // Explicit reset
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const user = session.user;
                    setCurrentUser(user);

                    // --- SEGURIDAD DE NAVEGACIÓN ---
                    // Si no hay datos de auto en la URL ni en el estado local, volver al dashboard
                    const hasCarData = make && model;
                    const hasSavedState = typeof window !== 'undefined' && localStorage.getItem('starterkar_onboarding_temp');
                    
                    if (!hasCarData && !hasSavedState && !isAdmin) {
                        router.push('/dashboard');
                        return;
                    }
                    // -------------------------------

                    const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
                    if (!profile?.phone || profile.phone.trim() === "") setNeedsPhone(true);
                }
            } catch (e) {
                console.error("Auth init error:", e);
            } finally {
                setLoading(false);
            }
        };
        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const user = session.user;
                setCurrentUser(user);
                const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
                if (!profile?.phone || profile.phone.trim() === "") setNeedsPhone(true);

                const params = new URLSearchParams(window.location.search);
                if (!params.get('make')) {
                    const tempStateStr = localStorage.getItem('starterkar_onboarding_temp');
                    if (tempStateStr) {
                        const state = JSON.parse(tempStateStr);
                        if (state.selectedPlan) setSelectedPlan(state.selectedPlan);
                        if (state.partnerId) (window as any).starterkar_recovered_partnerId = state.partnerId;
                        const newUrl = new URL(window.location.href);
                        Object.entries(state).forEach(([k, v]) => { if(v && k!=='timestamp') newUrl.searchParams.set(k, v as string); });
                        window.history.replaceState({}, '', newUrl.toString());
                    }
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    // Handle recovered partnerId once partners are loaded
    useEffect(() => {
        const recoveredId = (window as any).starterkar_recovered_partnerId;
        if (recoveredId && partners.length > 0) {
            const p = partners.find(p => p.id === recoveredId);
            if (p) {
                setSelectedPartner(p);
                delete (window as any).starterkar_recovered_partnerId;
            }
        }
    }, [partners]);

    // Keep global variables in sync for the Auth Modal to capture
    useEffect(() => {
        (window as any).starterkar_temp_selectedPlan = selectedPlan;
        (window as any).starterkar_temp_partnerId = selectedPartner?.id;
    }, [selectedPlan, selectedPartner]);

    // StarterKar Administration WhatsApp
    const ADMIN_PHONE = "525522120249"; 

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            toast.error("Por favor ingresa un número de WhatsApp válido");
            return;
        }
        
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase.from('profiles').update({ 
                    phone: phone.trim(),
                    updated_at: new Date().toISOString()
                }).eq('id', user.id);
                
                if (error) throw error;

                setNeedsPhone(false);
                toast.success("WhatsApp validado correctamente.");
                // We don't call handleSubmit() automatically to let the user see the change
            }
        } catch (err: any) {
            console.error("Error saving phone:", err);
            toast.error("Error al guardar tu teléfono. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!selectedPartner && selectedPlan === 'GO') {
            toast.error("Por favor selecciona un Taller Aliado para la revisión.");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user && !isAdmin) {
                setLoading(false);
                setShowAuthModal(true);
                return;
            }

            const activeUser = user || currentUser;
            const finalAddress = selectedPlan === 'VIP' ? 'Servicio Concierge a Domicilio' : `${selectedPartner?.name} - ${selectedPartner?.address}, ${selectedPartner?.city}`;

            const { data: carData, error: carError } = await supabase.from('cars').insert({
                seller_id: activeUser?.id || '00000000-0000-0000-0000-000000000000',
                make,
                model,
                year: parseInt(year) || new Date().getFullYear(),
                price: parseInt(searchParams.get('price') || '0'),
                status: 'pending_inspection',
                mileage: parseInt(km),
                has_clinkar_seal: mktCat === 'CERTIFIED',
                market_data: {
                    flashSale: mktCat === 'FLASH_SALE',
                    isBorder: mktCat === 'BORDER',
                    investorOnly: mktCat === 'INVESTOR',
                    isNew: mktCat === 'NEW_CAR',
                    agency: agencyName,
                    bonus: bonusText,
                    original_category: categoryId
                },
                description: `Registro vía Wizard. Mercado: ${mktCat}. Ubicación: ${finalAddress}`
            }).select('id').single();

            if (carError || !carData) throw new Error("Error creando pre-registro del auto.");

            const { error: ticketError } = await supabase.from('service_tickets').insert({
                car_id: carData.id,
                type: '150_point_inspection',
                status: 'SCHEDULED', // Fallback to SCHEDULED to satisfy DB check constraint
                scheduled_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // Default 24h
                partner_id: selectedPlan === 'GO' ? selectedPartner?.id : null
            });

            if (ticketError) throw new Error("Error agendando inspección.");

            await NotificationService.notifyAdmin(supabase, {
                action: "INSPECTION_SCHEDULED",
                entityType: "SERVICE_TICKETS",
                entityId: carData.id,
                metadata: { 
                    car: `${make} ${model} ${year}`,
                    address: finalAddress, 
                    type: 'workshop',
                    vehicleCategory: categoryId,
                    make, model, year, 
                    isAdminAction: isAdmin,
                    total_to_pay: totalCost,
                    plan: selectedPlan,
                    isPremium
                }
            });

            setSuccess(true);
            toast.success("¡Inspección agendada con éxito!");

        } catch (err: any) {
            console.error("Error:", err);
            toast.error(err.message || "Error al agendar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-indigo-500/30">
            <Navbar variant="sell" />
            
            <main className="pt-40 pb-24 px-6 max-w-2xl mx-auto">
                {success ? (
                    <div className="bg-white dark:bg-zinc-900/50 p-16 rounded-[3rem] text-center space-y-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-700">
                        <div className="mx-auto w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-zinc-950 dark:text-white uppercase italic tracking-tighter">¡Paso Final!</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                                Tu solicitud está lista. Contáctanos por WhatsApp para coordinar tu cita, realizar el pago y **conocer tu pool de 11+ beneficios exclusivos**.
                            </p>
                        </div>
                        
                        {(() => {
                            const message = `¡Hola! Acabo de registrar la solicitud de certificación física para mi ${make} ${model} ${year} bajo el plan ${selectedPlan === 'VIP' ? 'StarterKar VIP (Servicio Concierge)' : 'StarterKar GO (Yo lo llevo)'}. Quisiera recibir el link de Mercado Pago por $${totalCost} para confirmar mi cita.`;
                            const encodedMessage = encodeURIComponent(message);

                            return (
                                <div className="pt-8 flex flex-col gap-5">
                                    <a 
                                        href={`https://wa.me/${ADMIN_PHONE}?text=${encodedMessage}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-3 px-10 py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl shadow-emerald-600/30 active:scale-95 group"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                        Completar Pago por WhatsApp
                                    </a>
                                    
                                    <button 
                                        onClick={() => window.location.href = '/dashboard'}
                                        className="text-zinc-400 font-black text-[9px] uppercase tracking-[0.3em] hover:text-zinc-600 dark:hover:text-zinc-200 transition-all underline underline-offset-8"
                                    >
                                        Ir a mi panel de control
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {/* Header Sophistication */}
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em]">
                                <ShieldCheck className="h-3 w-3" /> Certificación Profesional
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter text-zinc-950 dark:text-white uppercase italic leading-[0.9]">
                                Agenda de <br />
                                <span className="text-indigo-600 dark:text-indigo-500">Inspección.</span>
                            </h1>
                            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] max-w-xs mx-auto opacity-70">
                                {isPremium 
                                    ? `Certificación Especializada para tu ${make} ${model}`
                                    : `Selecciona el punto de certificación física para tu ${make} ${model}`
                                }
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] space-y-12">
                            
                            <div className="space-y-10">
                                {/* Plan Selector */}
                                <div className="space-y-4">
                                    <Label className="px-1 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Plan de Certificación
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Plan GO */}
                                        <div 
                                            onClick={() => setSelectedPlan('GO')}
                                            className={`relative p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${
                                                selectedPlan === 'GO' 
                                                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-xl shadow-indigo-500/10 scale-[1.02]' 
                                                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-zinc-950 dark:text-white">StarterKar GO</h3>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Tú llevas el auto</p>
                                                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-tighter border border-emerald-500/20">
                                                        100% Reembolsable al vender
                                                    </div>
                                                </div>
                                                <div className="h-6 w-6 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                                                    {selectedPlan === 'GO' && <div className="h-3 w-3 rounded-full bg-indigo-500" />}
                                                </div>
                                            </div>
                                            <ul className="space-y-3 mt-6">
                                                <li className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Inspección en nuestro Hub Central
                                                </li>
                                                <li className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cédula de Certeza Digital
                                                </li>
                                                {selectedPartner && (
                                                    <li className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                                        <MapPin className="h-4 w-4 text-indigo-400" /> {selectedPartner.city}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Plan VIP */}
                                        <div 
                                            onClick={() => setSelectedPlan('VIP')}
                                            className={`relative p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${
                                                selectedPlan === 'VIP' 
                                                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-xl shadow-indigo-500/10 scale-[1.02]' 
                                                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-zinc-950 dark:text-white">StarterKar VIP</h3>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Servicio Concierge</p>
                                                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-tighter border border-emerald-500/20">
                                                        100% Reembolsable al vender
                                                    </div>
                                                </div>
                                                <div className="h-6 w-6 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                                                    {selectedPlan === 'VIP' && <div className="h-3 w-3 rounded-full bg-indigo-500" />}
                                                </div>
                                            </div>
                                            <ul className="space-y-3 mt-6">
                                                <li className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Recolección a domicilio
                                                </li>
                                                <li className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Chofer con identidad validada
                                                </li>
                                                <li className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                                    <ShieldCheck className="h-4 w-4 text-indigo-400" /> Seguro Flotante de Traslado
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <p className="px-1 text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed pt-2">
                                        * Horario coordinado vía WhatsApp (pago previo 24h). <br/>
                                        * Costo de inspección 100% reembolsable al vender. <br/>
                                        * Tu registro desbloquea el **Pool de 11+ Beneficios Exclusivos**.
                                    </p>
                                </div>

                                {/* Workshop Selection - ONLY for GO Plan */}
                                {selectedPlan === 'GO' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <Label className="px-1 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-2">
                                            <MapPin className="h-3 w-3" /> Selecciona un Taller Aliado
                                        </Label>
                                        <div className="space-y-3">
                                            {partners.map((partner) => (
                                                <div 
                                                    key={partner.id}
                                                    onClick={() => setSelectedPartner(partner)}
                                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                                                        selectedPartner?.id === partner.id 
                                                        ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10' 
                                                        : 'border-zinc-100 dark:border-zinc-800 hover:border-indigo-200'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="space-y-1">
                                                            <p className="font-black text-sm uppercase italic tracking-tight text-zinc-950 dark:text-white">
                                                                {partner.name}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase truncate">
                                                                {partner.address}, {partner.city}
                                                            </p>
                                                        </div>
                                                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                                            selectedPartner?.id === partner.id ? 'border-indigo-500' : 'border-zinc-200 dark:border-zinc-800'
                                                        }`}>
                                                            {selectedPartner?.id === partner.id && <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Premium Invoice-style Cost Summary */}
                                <div className="p-10 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[2.5rem] space-y-6 shadow-2xl">
                                    <div className="flex justify-between items-end border-b border-white/10 dark:border-zinc-200 pb-6">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60">
                                                {isPremium ? 'Certificación High-End' : 'Certificación Elite'}
                                            </span>
                                            <h4 className="text-xl font-black italic uppercase tracking-tighter">
                                                {isPremium ? 'Diagnóstico Avanzado de Marca' : '150 Puntos de Control'}
                                            </h4>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Inversión Total</span>
                                            <span className="text-[8px] font-bold text-indigo-400 dark:text-indigo-600 uppercase tracking-widest mt-1 italic">
                                                * Inversión estratégica para garantizar el 100% del valor de mercado en tu venta.
                                            </span>
                                        </div>
                                            <span className="text-3xl font-black tracking-tighter text-white dark:text-zinc-950">
                                                ${totalCost.toLocaleString()}
                                            </span>
                                    </div>
                                </div>
                            </div>

                                <div className="pt-6">
                                    <Button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-24 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-[0.6em] transition-all active:scale-[0.98] shadow-2xl shadow-indigo-600/20 group"
                                    >
                                        {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : (
                                            <span className="flex items-center gap-4">
                                                Confirmar Agenda <ArrowRight className="h-6 w-6 group-hover:translate-x-3 transition-transform duration-500" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                        </form>
                    </div>
                )}
            </main>

            <SellAuthModal 
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={(user) => {
                    setCurrentUser(user);
                    setShowAuthModal(false);
                    setTimeout(() => handleSubmit(), 500);
                }}
            />

            {/* Post-Google WhatsApp Capture - Redesigned as Elite Step */}
            {needsPhone && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-zinc-950/95 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[3rem] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.8)] p-14 border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center text-center space-y-6 mb-12">
                            <div className="h-20 w-20 rounded-[2rem] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-2xl">
                                <MessageSquare className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-zinc-950 dark:text-white leading-none">Paso de Seguridad.</h2>
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.4em]">
                                    Validación de contacto obligatoria
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handlePhoneSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <Label className="px-2 text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400">Canal de Seguimiento (WhatsApp)</Label>
                                <div className="flex gap-3">
                                    <div className="flex items-center justify-center px-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-black text-zinc-500">
                                        +52
                                    </div>
                                    <input 
                                        required
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="10 DÍGITOS"
                                        className="h-20 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-8 font-black text-sm focus:ring-4 focus:ring-indigo-500/10 flex-1 outline-none transition-all placeholder:text-zinc-300"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-24 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl group"
                            >
                                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : "Validar y Finalizar"}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
