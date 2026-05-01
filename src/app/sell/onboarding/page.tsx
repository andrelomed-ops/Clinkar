
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
    
    const [date, setDate] = useState("");
    const [phone, setPhone] = useState("");
    const [needsPhone, setNeedsPhone] = useState(false);

    const INSPECTION_BASE_COST = 1500;
    const totalCost = INSPECTION_BASE_COST;

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
                        if (state.date) setDate(state.date);
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
        (window as any).starterkar_temp_date = date;
        (window as any).starterkar_temp_partnerId = selectedPartner?.id;
    }, [date, selectedPartner]);

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
        
        if (!selectedPartner) {
            toast.error("Por favor selecciona un Taller Aliado para la revisión.");
            return;
        }

        if (!date) {
            toast.error("Por favor selecciona una fecha y hora.");
            return;
        }

        const selectedDate = new Date(date);
        const hours = selectedDate.getHours();
        
        if (hours < 10 || hours >= 17) {
            toast.warning("El horario de inspección es de 10:00 a 17:00 hrs.");
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
            const finalAddress = `${selectedPartner?.name} - ${selectedPartner?.address}, ${selectedPartner?.city}`;

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
                status: 'SCHEDULED',
                scheduled_at: new Date(date).toISOString(),
                partner_id: selectedPartner?.id
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
                    total_to_pay: totalCost
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
                            <h2 className="text-4xl font-black text-zinc-950 dark:text-white uppercase italic tracking-tighter">¡Agenda Confirmada!</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                                Tu certificación física de 150 puntos ha sido programada en <span className="text-zinc-950 dark:text-white font-black">{selectedPartner?.name}</span>.
                            </p>
                        </div>
                        
                        {(() => {
                            const appointmentDate = new Date(date);
                            const dateStr = appointmentDate.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                            const timeStr = appointmentDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                            const message = `¡Hola! Acabo de agendar la certificación física para mi ${make} ${model} ${year} en ${selectedPartner?.name} para el día ${dateStr} a las ${timeStr} hrs. Quisiera confirmar mi asistencia.`;
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
                                        Confirmar por WhatsApp
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
                                Selecciona el punto de certificación física para tu {make} {model}.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] space-y-12">
                            
                            <div className="space-y-10">
                                {/* Workshop Selector */}
                                <div className="space-y-4">
                                    <Label className="px-1 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Taller de Certificación
                                    </Label>
                                    <div className="relative group">
                                        <select
                                            required
                                            onChange={(e) => {
                                                const partner = partners.find(p => p.id === e.target.value);
                                                if (partner) setSelectedPartner(partner);
                                            }}
                                            className="w-full h-18 appearance-none bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-8 font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all cursor-pointer"
                                        >
                                            <option value="">Selecciona Ubicación...</option>
                                            {partners.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    {selectedPartner && (
                                        <div className="px-8 py-5 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-4">
                                            <MapPin className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                                            <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-wider">
                                                {selectedPartner.address}, {selectedPartner.city}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Date Selector */}
                                <div className="space-y-4">
                                    <Label className="px-1 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Fecha y Hora
                                    </Label>
                                    <div className="relative group">
                                        <input 
                                            type="datetime-local" 
                                            required
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full h-18 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-8 font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                        />
                                        <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <p className="px-1 text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                                        * Atención Lunes a Sábado: 10:00 AM - 05:00 PM
                                    </p>
                                </div>

                                {/* Premium Invoice-style Cost Summary */}
                                <div className="p-10 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[2.5rem] space-y-6 shadow-2xl">
                                    <div className="flex justify-between items-end border-b border-white/10 dark:border-zinc-200 pb-6">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60">Certificación Elite</span>
                                            <h4 className="text-xl font-black italic uppercase tracking-tighter">150 Puntos de Control</h4>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Total de la Inversión</span>
                                            <span className="text-[8px] font-bold text-indigo-400 dark:text-indigo-600 uppercase tracking-widest mt-1 italic">* Inversión estratégica para maximizar el valor de tu activo</span>
                                        </div>
                                            <span className="text-3xl font-black tracking-tighter text-white dark:text-zinc-950">
                                                ${totalCost.toLocaleString()}
                                            </span>
                                    </div>
                                    <p className="mt-6 text-[10px] text-indigo-600 dark:text-indigo-400 leading-tight font-black uppercase tracking-widest italic">
                                        * Esta no es un gasto, es tu inversión para garantizar el 100% del valor de mercado en tu venta.
                                    </p>
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
