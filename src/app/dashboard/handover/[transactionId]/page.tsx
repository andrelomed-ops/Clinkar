"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { Shield, Smartphone, QrCode, CheckCircle2, Loader2, ArrowRight, FileText, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HandoverPage({ params }: { params: { transactionId: string } }) {
    const [transaction, setTransaction] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [releasing, setReleasing] = useState(false);
    const [status, setStatus] = useState<"ready" | "scanned" | "success">("ready");
    const [isMounted, setIsMounted] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: trans } = await supabase
                .from("escrow_transactions")
                .select("*, cars(make, model, year, images)")
                .eq("id", params.transactionId)
                .single();

            if (trans) {
                setTransaction(trans);
                setUserRole(user.id === trans.seller_id ? "seller" : "buyer");
            }
            setLoading(false);
        }
        setIsMounted(true);
        fetchData();
    }, [params.transactionId]);

    const handleRelease = async () => {
        setReleasing(true);
        try {
            const response = await fetch("/api/escrow/release", {
                method: "POST",
                body: JSON.stringify({
                    transactionId: params.transactionId,
                    qrSecret: transaction.qr_release_code
                })
            });

            if (response.ok) {
                setStatus("success");
            } else {
                alert("Error al liberar fondos. Verifica el código.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setReleasing(false);
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
                    <span className="font-bold">Handover Hub</span>
                </Link>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Conexión Segura
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
                {status === "success" ? (
                    <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="h-24 w-24 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black">¡Transacción Exitosa!</h2>
                            <p className="text-muted-foreground">Los fondos han sido liberados de la Bóveda Digital.</p>
                        </div>
                        <div className="bg-secondary/50 rounded-3xl p-6 text-left space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Monto Transferido</span>
                                <span className="font-bold">${isMounted ? transaction.amount.toLocaleString() : "..."} MXN</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Referencia</span>
                                <span className="font-mono text-[10px]">{transaction.id}</span>
                            </div>
                        </div>
                        <Link
                            href="/dashboard"
                            className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20"
                        >
                            Volver a mi Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="w-full space-y-12">
                        <header className="text-center space-y-2">
                            <h1 className="text-3xl font-black">Intercambio Mutual QR</h1>
                            <p className="text-muted-foreground text-sm">
                                {userRole === "seller"
                                    ? "Muestra este código al comprador para recibir tus fondos."
                                    : "Escanea el código del vendedor una vez que recibas las llaves."}
                            </p>
                        </header>

                        {/* Car Mini Card */}
                        <div className="bg-secondary/30 rounded-3xl p-4 flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-secondary overflow-hidden">
                                {transaction.cars.images?.[0] && <img src={transaction.cars.images[0]} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold">{transaction.cars.make} {transaction.cars.model}</p>
                                <p className="text-xs text-muted-foreground">Bóveda: ${isMounted ? transaction.amount.toLocaleString() : "..."} MXN</p>
                            </div>
                        </div>

                        {/* QR Area */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-colors" />
                            <div className="relative aspect-square w-full max-w-[280px] mx-auto bg-background rounded-[2.5rem] border-4 border-foreground p-8 shadow-2xl flex items-center justify-center">
                                {userRole === "seller" ? (
                                    <QRCodeSVG
                                        value={transaction.qr_release_code}
                                        size={200}
                                        fgColor="#000000"
                                        level="H"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                                            <QrCode className="h-10 w-10" />
                                        </div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4">Esperando escaneo físico...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Role-Specific Actions */}
                        <div className="space-y-4">
                            {userRole === "buyer" && (
                                <button
                                    onClick={handleRelease}
                                    disabled={releasing}
                                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/10 flex items-center justify-center gap-2"
                                >
                                    {releasing ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                        <>
                                            <Smartphone className="h-6 w-6" />
                                            Liberar Fondos (Check-in)
                                        </>
                                    )}
                                </button>
                            )}

                            <div className="flex justify-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Esperando validación bidireccional</span>
                            </div>
                        </div>

                        {/* Paperwork Reminder */}
                        <div className="rounded-2xl border border-dashed border-border p-4 flex gap-4 items-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground leading-tight">
                                Asegúrate de haber intercambiado el título físico antes de confirmar la liberación de los fondos.
                            </p>
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-8 text-center">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    Protegido por Clinkar Digital Vault & Stripe Connect
                </p>
            </footer>
        </div>
    );
}
