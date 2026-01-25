"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { INSPECTION_SECTIONS } from "@/lib/inspection-data";
import { cn } from "@/lib/utils";
import { PhotoEvidence } from "@/components/dashboard/PhotoEvidence";
import { RepairQuotationTable } from "@/components/dashboard/RepairQuotationTable";
import { TrustSeal } from "@/components/dashboard/TrustSeal";
import {
    Shield,
    CheckCircle,
    XCircle,
    ChevronRight,
    ChevronDown,
    Save,
    Loader2,
    AlertCircle,
    Camera,
    FileText,
    Printer,
    MessageCircle
} from "lucide-react";

export default function Inspection150Form() {
    const { carId } = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState("motor");
    const [inspectionData, setInspectionData] = useState<Record<string, { pass: boolean, note: string, cost?: number, na?: boolean }>>({});
    const [isFinalized, setIsFinalized] = useState(false);
    const [carDetails, setCarDetails] = useState<any>(null);
    const [photos, setPhotos] = useState<Record<string, string[]>>({});
    const [userRole, setUserRole] = useState<string | null>("inspector");

    // Fetch user role on load
    useEffect(() => {
        const fetchRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();
                if (profile) {
                    setUserRole(profile.role);
                    // Set default section based on role
                    if (profile.role === 'legal') {
                        setActiveSection("legal");
                    } else {
                        setActiveSection("motor");
                    }
                }
            } else {
                // For demo/development if no auth, check cookie first
                const cookieRole = document.cookie.match(/clinkar_role=([^;]+)/)?.[1];
                const finalRole = (cookieRole || "inspector").trim();
                setUserRole(finalRole);
                if (finalRole === 'legal') {
                    setActiveSection("legal");
                }
            }
        };
        fetchRole();
    }, [supabase]);

    const filteredSections = INSPECTION_SECTIONS.filter(section => {
        if (userRole === 'legal') return section.id === 'legal';
        if (userRole === 'inspector') return section.id !== 'legal';
        return true; // Admin or others see all
    });

    const folio = `CLINK-${carId?.toString().substring(0, 5).toUpperCase()}-${new Date().getFullYear()}`;
    const today = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

    const totalPoints = 150;
    const completedPoints = Object.keys(inspectionData).length;
    const naCount = Object.values(inspectionData).filter(v => v.na).length;
    const passCount = Object.values(inspectionData).reduce((acc, current) => acc + (current.pass && !current.na ? 1 : 0), 0);
    const progressPercentage = (completedPoints / totalPoints) * 100;
    const adjustedTotalForScore = totalPoints - naCount;
    const finalScore = Math.round((passCount / (adjustedTotalForScore > 0 ? adjustedTotalForScore : 1)) * 100);

    const failedItems = Object.entries(inspectionData)
        .filter(([_, data]) => !data.pass && !data.na)
        .map(([id, data]) => {
            const itemLabel = INSPECTION_SECTIONS.flatMap(s => s.items).find(i => i.id === id)?.label || "Punto Desconocido";
            return { id, label: itemLabel, cost: data.cost || 0, note: data.note };
        });

    const handleSetPass = (itemId: string, pass: boolean) => {
        setInspectionData(prev => ({
            ...prev,
            [itemId]: {
                pass,
                na: false,
                note: prev[itemId]?.note || "",
                cost: pass ? 0 : prev[itemId]?.cost || 0
            }
        }));
    };

    const handleSetNA = (itemId: string) => {
        setInspectionData(prev => ({
            ...prev,
            [itemId]: {
                pass: false,
                na: true,
                note: prev[itemId]?.note || "No aplica para este vehículo",
                cost: 0
            }
        }));
    };

    const handleNoteChange = (itemId: string, note: string) => {
        setInspectionData(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                pass: prev[itemId]?.pass || false,
                note
            }
        }));
    };

    const handleCostChange = (itemId: string, cost: string) => {
        const numCost = parseFloat(cost) || 0;
        setInspectionData(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                cost: numCost
            }
        }));
    };

    const handleSubmit = async (result: "APROBADO" | "CON_REPARACIONES") => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Ensure user has permission for this final action
        if (userRole === 'legal' && result === "CON_REPARACIONES") {
            alert("El perfil Legal solo puede validar documentación, no generar cotizaciones técnicas.");
            setLoading(false);
            return;
        }

        // 1. Save Report
        const { data: report, error: reportError } = await supabase
            .from("inspection_reports_150")
            .insert({
                car_id: carId,
                inspector_id: user.id,
                data: {
                    checklist: inspectionData,
                    photos: photos
                },
                overall_result: result === "APROBADO" ? "APROBADO" : "RECHAZADO",
            })
            .select()
            .single();

        if (reportError) {
            alert("Error al guardar reporte: " + reportError.message);
            setLoading(false);
            return;
        }

        const { data: car } = await supabase
            .from("cars")
            .select("make, model, seller_id")
            .eq("id", carId)
            .single();

        if (car) {
            setCarDetails(car);
            await supabase.from("notifications").insert({
                user_id: car.seller_id,
                title: result === "APROBADO" ? "✅ Inspección Aprobada" : "🛠️ Cotización de Reparación Generada",
                message: result === "APROBADO"
                    ? `La revisión de 150 puntos de tu ${car.make} ${car.model} ha sido aprobada con Sello Clinkar.`
                    : `Se han detectado detalles en tu ${car.make} ${car.model}. Se ha generado una cotización de reparación para el comprador.`,
                type: result === "APROBADO" ? "SUCCESS" : "INFO",
                link: "/dashboard"
            });
        }

        // 3. Create Quotation if failed items exist
        if (result === "CON_REPARACIONES" && report) {
            const totalCost = failedItems.reduce((acc, item) => acc + item.cost, 0);
            await supabase.from("repair_quotations").insert({
                car_id: carId,
                inspector_id: user.id,
                inspection_report_id: report.id,
                items: failedItems,
                total_amount: totalCost,
                status: 'PENDING_BUYER'
            });
        }

        // 4. Update Car Status
        await supabase
            .from("cars")
            .update({
                has_clinkar_seal: result === "APROBADO",
                status: 'inspected'
            })
            .eq("id", carId);

        setIsFinalized(true);
        setLoading(false);
        setActiveSection("summary");
    };

    const handlePrint = () => window.print();

    const handleWhatsAppShare = () => {
        if (!carDetails) return;
        const score = finalScore;
        const text = `Hola, comparto el Certificado de Inspección y Sello de Confianza del vehículo ${carDetails.make} ${carDetails.model}. Puntaje: ${score}%. Reporte: ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-secondary/20 font-sans">
            <style jsx global>{`
                @media print {
                    @page { margin: 15mm; size: A4; }
                    body { background: white !important; }
                    .print-break-before { page-break-before: always; }
                    .print-break-inside-avoid { page-break-inside: avoid; }
                    nav, footer, aside, button, .no-print { display: none !important; }
                    main { padding-top: 0 !important; height: auto !important; overflow: visible !important; display: block !important; }
                    .overflow-y-auto { overflow: visible !important; height: auto !important; }
                    .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
                    .flex-1 { flex: none !important; width: 100% !important; }
                    .grid { display: block !important; }
                    .rounded-[2.5rem], .rounded-[3rem], .rounded-3xl { border-radius: 12px !important; }
                    .shadow-xl, .shadow-2xl, .shadow-sm { shadow: none !important; border: 1px solid #e2e8f0 !important; }
                }
            `}</style>
            <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md px-6 h-16 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="font-bold tracking-tight">Inspección Profesional 150</span>
                    </div>
                </div>
                <div className="flex-1 max-w-md mx-8">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Progreso de Revisión</span>
                        <span className="text-[10px] font-black text-primary">{completedPoints} / {totalPoints} Puntos</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-700 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-blue-500/10 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Rol: {userRole || "Cargando..."}
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {passCount} Aprobados
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto flex gap-8 h-[calc(100vh-64px)] overflow-hidden print:h-auto print:overflow-visible print:p-0 print:block">
                <aside className="w-72 space-y-2 shrink-0 hidden lg:block overflow-y-auto pr-2 pb-10 print:hidden">
                    <div className="mb-4 px-4 py-2">
                        <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Categorías</h3>
                    </div>
                    {filteredSections.map((section) => {
                        const sectionItems = section.items.map(i => i.id);
                        const sectionCompleted = sectionItems.filter(id => inspectionData[id]).length;
                        const sectionTotal = sectionItems.length;

                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "w-full text-left px-5 py-4 rounded-2xl flex items-center justify-between transition-all group",
                                    activeSection === section.id
                                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                                        : "bg-background hover:bg-secondary/50 text-muted-foreground"
                                )}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-sm tracking-tight">{section.label}</span>
                                    <span className={cn(
                                        "text-[9px] font-bold uppercase tracking-widest opacity-60",
                                        activeSection === section.id ? "text-white" : "text-primary"
                                    )}>
                                        {sectionCompleted} / {sectionTotal} Puntos
                                    </span>
                                </div>
                                <ChevronRight className={cn("h-4 w-4 transition-transform duration-300", activeSection === section.id ? "rotate-90" : "group-hover:translate-x-1")} />
                            </button>
                        );
                    })}

                    <div className="pt-6 mt-6 border-t border-border/50 space-y-2">
                        <button
                            onClick={() => setActiveSection("photos")}
                            className={cn(
                                "w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3 transition-all",
                                activeSection === "photos" ? "bg-primary text-white" : "bg-background text-muted-foreground"
                            )}
                        >
                            <Camera className="h-4 w-4" />
                            <span className="font-bold text-sm">Evidencia Foto</span>
                        </button>
                        <button
                            onClick={() => setActiveSection("summary")}
                            className={cn(
                                "w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3 transition-all",
                                activeSection === "summary" ? "bg-primary text-white" : "bg-background text-muted-foreground"
                            )}
                        >
                            <FileText className="h-4 w-4" />
                            <span className="font-bold text-sm">Resumen Final</span>
                        </button>
                    </div>
                </aside>

                <div className="flex-1 overflow-y-auto pb-20 pr-4 custom-scrollbar print:overflow-visible print:pr-0">
                    {!["photos", "summary"].includes(activeSection) && INSPECTION_SECTIONS.filter(s => s.id === activeSection).map((section) => (
                        <div key={section.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 print:block">
                            <header className="mb-8">
                                <h2 className="text-4xl font-black tracking-tight">{section.label}</h2>
                                <p className="text-muted-foreground mt-2 font-medium">Revisa cuidadosamente cada punto de control.</p>
                            </header>
                            <div className="grid gap-4">
                                {section.items.map((item) => (
                                    <div key={item.id} className={cn("bg-background rounded-3xl p-6 border-2 transition-all transition-all duration-300", inspectionData[item.id] ? "border-primary/20 shadow-lg shadow-primary/5" : "border-transparent shadow-sm")}>
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="space-y-1 flex-1">
                                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-tighter"> Punto {item.id} </span>
                                                <p className="font-bold text-lg tracking-tight">{item.label}</p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="flex flex-col items-center gap-1">
                                                    <button type="button" onClick={() => handleSetPass(item.id, true)} className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all", inspectionData[item.id]?.pass && !inspectionData[item.id]?.na ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20" : "bg-background border-secondary text-muted-foreground hover:border-green-500/50 hover:text-green-500")}><CheckCircle className="h-6 w-6" /></button>
                                                    <span className={cn("text-[8px] font-bold uppercase tracking-widest", inspectionData[item.id]?.pass && !inspectionData[item.id]?.na ? "text-green-600" : "text-muted-foreground/40")}>Pasa</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <button type="button" onClick={() => handleSetPass(item.id, false)} className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all", !inspectionData[item.id]?.pass && inspectionData[item.id] !== undefined && !inspectionData[item.id]?.na ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20" : "bg-background border-secondary text-muted-foreground hover:border-red-500/50 hover:text-red-500")}><XCircle className="h-6 w-6" /></button>
                                                    <span className={cn("text-[8px] font-bold uppercase tracking-widest", !inspectionData[item.id]?.pass && inspectionData[item.id] !== undefined && !inspectionData[item.id]?.na ? "text-red-600" : "text-muted-foreground/40")}>Falla</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <button type="button" onClick={() => handleSetNA(item.id)} className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all", inspectionData[item.id]?.na ? "bg-slate-500 border-slate-500 text-white shadow-lg shadow-slate-500/20" : "bg-background border-secondary text-muted-foreground hover:border-slate-500/50 hover:text-slate-500")}><AlertCircle className="h-6 w-6" /></button>
                                                    <span className={cn("text-[8px] font-bold uppercase tracking-widest", inspectionData[item.id]?.na ? "text-slate-600" : "text-muted-foreground/40")}>N/A</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-4">
                                            <input placeholder="Notas técnicas adicionales..." className="flex-1 text-sm bg-secondary/30 border-none rounded-xl px-5 py-3 font-medium focus:ring-2 focus:ring-primary/20 transition-all" value={inspectionData[item.id]?.note || ""} onChange={(e) => handleNoteChange(item.id, e.target.value)} />
                                            {!inspectionData[item.id]?.pass && inspectionData[item.id] !== undefined && !inspectionData[item.id]?.na && (
                                                <div className="w-48 relative animate-in zoom-in duration-300">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">$</span>
                                                    <input type="number" placeholder="Costo Rep." className="w-full text-sm bg-primary/5 border-2 border-primary/20 rounded-xl pl-8 pr-4 py-3 font-bold text-primary focus:ring-2 focus:ring-primary/20 transition-all" value={inspectionData[item.id]?.cost || ""} onChange={(e) => handleCostChange(item.id, e.target.value)} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {activeSection === "photos" && <PhotoEvidence photos={photos} onPhotosChange={setPhotos} carId={carId as string} />}

                    {activeSection === "summary" && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            <TrustSeal folio={folio} date={today} score={finalScore} />
                            <div className="print-break-before">
                                <RepairQuotationTable failedItems={failedItems} onCostChange={handleCostChange} />
                            </div>

                            <section className="print-break-before space-y-8 bg-background rounded-[3rem] p-10 border border-border shadow-sm">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                        <CheckCircle className="h-6 w-6 text-primary" />
                                        Detalle de Inspección (150 Puntos)
                                    </h3>
                                    <p className="text-muted-foreground font-medium italic">Resumen visual de todos los puntos verificados por categoría.</p>
                                </div>

                                <div className="grid gap-12">
                                    {filteredSections.map((section) => (
                                        <div key={section.id} className="space-y-4">
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <h4 className="font-bold text-lg">{section.label}</h4>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/50">
                                                    {section.items.filter(i => inspectionData[i.id]?.pass).length} / {section.items.length} Aptos
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                                {section.items.map((item) => (
                                                    <div key={item.id} className="group relative">
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-lg flex items-center justify-center text-[8px] font-black transition-all",
                                                            inspectionData[item.id]?.na ? "bg-slate-100 text-slate-400 border border-slate-200" :
                                                                inspectionData[item.id]?.pass ? "bg-green-100 text-green-700 border border-green-200" :
                                                                    inspectionData[item.id] !== undefined ? "bg-red-100 text-red-700 border border-red-200" :
                                                                        "bg-secondary/30 text-muted-foreground/30 border border-transparent"
                                                        )}>
                                                            {item.id.toUpperCase()}
                                                        </div>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-[10px] rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                                            {item.label}: {inspectionData[item.id] ? (inspectionData[item.id].na ? "N/A" : (inspectionData[item.id].pass ? "APTO" : "FALLA")) : "PENDIENTE"}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <div className="print-break-before space-y-8">
                                <h3 className="text-2xl font-bold no-print">Evidencia de Soporte</h3>
                                <PhotoEvidence photos={photos} onPhotosChange={setPhotos} carId={carId as string} />
                            </div>
                            {isFinalized && (
                                <div className="flex gap-4 print:hidden">
                                    <button onClick={handlePrint} className="h-14 px-8 rounded-2xl bg-secondary text-foreground font-bold flex items-center gap-3 hover:bg-secondary/80 transition-all"><Printer className="h-5 w-5" />Imprimir Reporte PDF</button>
                                    <button onClick={handleWhatsAppShare} className="h-14 px-8 rounded-2xl bg-[#25D366] text-white font-bold flex items-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-green-500/20"><MessageCircle className="h-5 w-5" />Compartir por WhatsApp</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <footer className="fixed bottom-0 w-full border-t bg-background/95 backdrop-blur-md px-6 py-6 z-50 print:hidden">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-primary font-black uppercase text-[11px] tracking-widest leading-none mb-1">
                            <AlertCircle className="h-4 w-4" />
                            Certificación en Proceso
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Revisados: {completedPoints} de {totalPoints} puntos obligatorios.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleSubmit("CON_REPARACIONES")} disabled={loading || completedPoints < totalPoints || passCount === totalPoints} className="h-14 px-10 rounded-2xl border-2 border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all disabled:opacity-30 disabled:grayscale flex items-center gap-2">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" />Emitir Cotización de Reparación</>}
                        </button>
                        <button onClick={() => handleSubmit("APROBADO")} disabled={loading || completedPoints < totalPoints} className="h-14 px-12 rounded-2xl bg-primary text-primary-foreground font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-30 disabled:grayscale">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Finalizar y Emitir Sello <Shield className="h-5 w-5 fill-current" /></>}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
