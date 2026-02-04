"use client";

import { useState, useEffect, use } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { Shield, Smartphone, QrCode, CheckCircle2, Loader2, ArrowRight, FileText, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { HandoverSafeCheck } from "@/components/dashboard/HandoverSafeCheck";
import { Button } from "@/components/ui/button";

export default function HandoverPage({ params }: { params: Promise<{ transactionId: string }> }) {
    const { transactionId } = use(params);
    const [transaction, setTransaction] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [releasing, setReleasing] = useState(false);
    const [status, setStatus] = useState<"ready" | "scanned" | "success" | "negotiating">("ready");
    const [isMounted, setIsMounted] = useState(false);
    const [docUploaded, setDocUploaded] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    const supabase = createBrowserClient();

    useEffect(() => {
        async function fetchData() {
            // DEMO/MOCK MODE HANDLER
            if (transactionId === 'demo-tx-123' || transactionId.startsWith('mock-') || transactionId === 'test') {
                setTransaction({
                    id: transactionId,
                    car_price: 350000,
                    qr_code: 'demo-secret-123',
                    cars: {
                        make: 'Clinkar',
                        model: 'Certified Unit',
                        year: 2024,
                        images: ['https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&q=80']
                    },
                    seller_success_fee: 2149.13,
                    buyer_commission: 5000
                });
                setUserRole('buyer');
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: trans, error } = await supabase
                .from("transactions")
                .select("*, cars(make, model, year, images)")
                .eq("id", transactionId)
                .single();

            if (error) {
                console.error("Error fetching transaction:", error);
                return;
            }

            if (trans) {
                setTransaction(trans);
                setUserRole(user.id === trans.seller_id ? "seller" : "buyer");
            }
            setLoading(false);
        }
        setIsMounted(true);
        fetchData();
    }, [transactionId, supabase]);

    const handleRelease = async () => {
        setReleasing(true);
        try {
            // If in demo mode, just simulate
            if (transactionId === 'demo-tx-123' || transactionId.startsWith('mock-') || transactionId === 'test') {
                await new Promise(r => setTimeout(r, 2000));
                setStatus("success");
                return;
            }

            const response = await fetch("/api/escrow/release", {
                method: "POST",
                body: JSON.stringify({
                    transactionId: transactionId,
                    qrSecret: transaction.qr_code
                })
            });

            if (response.ok) {
                setStatus("success");
            } else {
                const err = await response.json();
                alert(`Error al liberar fondos: ${err.error || "Verifica el código"}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setReleasing(false);
        }
    };

    const handleNegotiate = async () => {
        const confirmed = window.confirm("¿Deseas iniciar un proceso de negociación? Esto detendrá el pago temporalmente.");
        if (confirmed) {
            setStatus("negotiating");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navigation */}
            <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10 px-6 h-16 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="font-bold font-mono tracking-tighter italic">Handover Hub</span>
                </Link>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                    <Lock className="h-3 w-3" />
                    Punto a Punto Cifrado
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
                {status === "negotiating" ? (
                    <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="relative h-24 w-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-12 w-12 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-amber-900">Negociación Iniciada</h2>
                        <p className="text-muted-foreground font-medium">
                            Has reportado una discrepancia en el estado del vehículo.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left space-y-4">
                            <p className="text-sm text-amber-800 font-medium">
                                El vendedor ha sido notificado. Tienen <strong>48 horas</strong> para acordar un ajuste en el precio o la reparación del desperfecto.
                            </p>
                            <p className="text-xs text-amber-700">
                                Los fondos permanecen seguros en la Bóveda hasta que ambas partes acepten el nuevo acuerdo.
                            </p>
                        </div>
                        <Button
                            onClick={() => setStatus("ready")}
                            variant="outline"
                            className="w-full h-12 rounded-xl"
                        >
                            Volver al Checklist
                        </Button>
                    </div>
                ) : status === "success" ? (
                    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                            <div className="relative h-32 w-32 rounded-[2.5rem] bg-green-500 text-white flex items-center justify-center mx-auto shadow-2xl rotate-3">
                                <CheckCircle2 className="h-16 w-16" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">¡Entrega Confirmada!</h2>
                            <p className="text-muted-foreground font-medium">Los fondos han sido liberados de la Bóveda y están en camino al vendedor.</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900 border border-border rounded-[2.5rem] p-8 text-left space-y-6 shadow-sm">
                            <div className="flex justify-between items-center border-b border-dashed border-border pb-4">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Monto Liberado</span>
                                <span className="text-2xl font-black italic">${isMounted ? transaction.car_price.toLocaleString() : "..."} <span className="text-sm">MXN</span></span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase">Referencia de Pago</span>
                                    <p className="font-mono text-[10px] truncate">{transaction.id}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase">Estatus Bancario</span>
                                    <p className="text-[10px] font-bold text-green-600 uppercase">Procesando SPEI</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/dashboard"
                                className="flex h-14 w-full items-center justify-center rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform"
                            >
                                Volver a mi Bóveda
                            </Link>
                            <p className="text-[10px] text-muted-foreground italic font-medium">
                                Recibirás un correo con el comprobante fiscal y el contrato firmado digitalmente.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full space-y-12">
                        <header className="text-center space-y-3">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                <Smartphone className="h-3.5 w-3.5" /> Protocolo de Liberación Mutual
                            </div>
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Intercambio Mutual</h1>
                            <p className="text-muted-foreground text-sm font-medium">
                                {userRole === "seller"
                                    ? "Proporciona el código de liberación al comprador una vez realizada la inspección física."
                                    : "Valida el estado del vehículo y escanea el código para liberar los fondos de la Bóveda."}
                            </p>
                        </header>

                        {/* Car Mini Card */}
                        <div className="bg-secondary/30 rounded-[2rem] p-5 flex items-center gap-5 border border-border/50">
                            <div className="h-20 w-20 rounded-2xl bg-secondary overflow-hidden shadow-inner flex-shrink-0">
                                {transaction.cars.images?.[0] && <img src={transaction.cars.images[0]} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Vehículo en Custodia</p>
                                <h3 className="text-lg font-black italic uppercase truncate leading-none">{transaction.cars.make} {transaction.cars.model} {transaction.cars.year}</h3>
                                <p className="text-sm font-bold text-primary mt-1">Bóveda: ${isMounted ? transaction.car_price.toLocaleString() : "..."} MXN</p>
                            </div>
                        </div>

                        {userRole === "buyer" ? (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                <HandoverSafeCheck
                                    onComplete={handleRelease}
                                    onNegotiate={handleNegotiate}
                                    isProcessing={releasing}
                                />
                            </div>
                        ) : (
                            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                                {!docUploaded ? (
                                    <div className="bg-card border border-primary/20 rounded-[2.5rem] p-8 text-center space-y-6 shadow-xl shadow-primary/5 animate-in zoom-in duration-500">
                                        <div className="h-20 w-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto">
                                            <FileText className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Paso 1: Documentación</h3>
                                            <p className="text-muted-foreground text-sm font-medium px-4">
                                                Para habilitar el código de liberación, toma una foto del contrato de transferencia firmado por ambas partes.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setUploadingDoc(true);
                                                setTimeout(() => {
                                                    setDocUploaded(true);
                                                    setUploadingDoc(false);
                                                }, 2000);
                                            }}
                                            disabled={uploadingDoc}
                                            className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                        >
                                            {uploadingDoc ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Smartphone className="mr-2 h-5 w-5" />
                                                    Capturar Documento
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative group">
                                            <div className="absolute -inset-8 bg-emerald-500/5 rounded-[4rem] blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                                            <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-white dark:bg-zinc-950 rounded-[3rem] border-8 border-emerald-600 dark:border-emerald-900 p-10 shadow-2xl flex items-center justify-center">
                                                <QRCodeSVG
                                                    value={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/handover/${transaction.qr_code}`}
                                                    size={220}
                                                    fgColor="currentColor"
                                                    className="text-zinc-900 dark:text-white"
                                                    level="Q"
                                                    includeMargin={false}
                                                />
                                            </div>
                                            <div className="mt-6 flex justify-center items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Código Listo para Escaneo</span>
                                            </div>
                                        </div>
                                        <div className="bg-emerald-50 content-card border border-emerald-100 rounded-[2rem] p-6 space-y-2 shadow-sm text-emerald-900">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                <p className="text-sm font-black uppercase italic">Documento Registrado</p>
                                            </div>
                                            <p className="text-xs leading-relaxed font-medium">
                                                El contrato ha sido capturado. Muestra este código al comprador para que confirme la entrega física y libere los fondos.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-dashed border-border flex justify-between items-center opacity-60">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 bg-secondary rounded-lg flex items-center justify-center">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Contrato Digital</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground px-3 py-1 bg-secondary rounded-full">ID: {transaction.id.slice(0, 8)}</span>
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-10 text-center">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] italic">
                    Powered by Clinkar Protocol v2.5 • Escrow Secured
                </p>
            </footer>
        </div>
    );
}
