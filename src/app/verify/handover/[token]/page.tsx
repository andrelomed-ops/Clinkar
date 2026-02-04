"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { CheckCircle2, AlertTriangle, CarFront, ShieldCheck, Loader2 } from 'lucide-react';
import { HandoverSafeCheck } from '@/components/dashboard/HandoverSafeCheck';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VerifyHandoverPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    const supabase = createBrowserClient();

    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function verify() {
            try {
                // 1. Get Transaction by QR Secret
                const { data: tx, error: txError } = await supabase
                    .from('transactions')
                    .select('*, cars(*), buyer:profiles!transactions_buyer_id_fkey(*), seller:profiles!transactions_seller_id_fkey(*)')
                    .eq('qr_code', token)
                    .single();

                if (txError || !tx) {
                    setError("Código inválido o expirado.");
                    setLoading(false);
                    return;
                }

                setData(tx);

                // 2. Get Current User
                const { data: { user: authUser } } = await supabase.auth.getUser();
                setUser(authUser);

                setLoading(false);
            } catch (err) {
                console.error("Verification error:", err);
                setError("Error de conexión.");
                setLoading(false);
            }
        }

        verify();
    }, [token, supabase]);

    const handleRelease = async () => {
        setVerifying(true);
        try {
            const response = await fetch('/api/escrow/release', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId: data.id,
                    qrSecret: token
                })
            });

            const result = await response.json();
            if (result.success) {
                setSuccess(true);
            } else {
                alert("Error: " + (result.error || "No se pudo procesar la entrega."));
            }
        } catch (err) {
            console.error("Release error:", err);
            alert("Error de red.");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-red-900">Código Inválido</h1>
            <p className="text-red-600 mt-2">{error}</p>
            <Link href="/" className="mt-8 px-6 py-3 bg-red-100 text-red-700 rounded-lg font-bold">
                Volver al Inicio
            </Link>
        </div>
    );

    const isBuyer = user?.id === data.buyer_id;
    const isReleased = data.status === 'RELEASED';

    if (success || isReleased) {
        return (
            <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 max-w-sm w-full">
                    <div className="h-24 w-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                        <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase italic tracking-tighter mb-4">¡Entrega Exitosa!</h1>
                    <p className="text-emerald-700 font-medium mb-8 leading-relaxed">
                        Has confirmado la recepción del vehículo. Los fondos han sido liberados al vendedor.
                    </p>
                    <Button asChild size="lg" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg">
                        <Link href="/dashboard">Ir a mi Garage</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 py-12">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="h-32 w-32" />
                    </div>
                    <ShieldCheck className="h-12 w-12 mx-auto mb-4 relative z-10" />
                    <h1 className="text-2xl font-black italic uppercase italic tracking-tighter relative z-10">Bóveda Clinkar</h1>
                    <p className="text-indigo-100/80 text-xs font-bold uppercase tracking-widest relative z-10">Verificación de Activos</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Role Check */}
                    {!isBuyer && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-black text-amber-900 uppercase tracking-widest leading-none">Acceso Restringido</p>
                                <p className="text-xs text-amber-700 font-medium">
                                    Solo el comprador asignado ({data.buyer?.full_name}) puede confirmar esta entrega.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Car Preview */}
                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="h-20 w-32 bg-slate-200 rounded-xl overflow-hidden shadow-inner relative">
                            {data.cars?.images?.[0] ? (
                                <img src={data.cars.images[0]} alt={data.cars.model} className="w-full h-full object-cover" />
                            ) : (
                                <CarFront className="h-8 w-8 text-slate-400 m-auto mt-6" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black italic uppercase italic text-lg leading-tight">{data.cars?.make} {data.cars?.model}</h3>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{data.cars?.year} • {data.cars?.vin?.slice(-4) || 'XXXX'}</p>
                        </div>
                    </div>

                    {/* Checklist integration */}
                    {isBuyer && (
                        <div className="space-y-6 pt-4 border-t border-dashed border-slate-200">
                            <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase tracking-widest">Protocolo de Inspección</h4>
                                <p className="text-xs text-muted-foreground font-medium">Confirma el estado del vehículo antes de liberar el pago.</p>
                            </div>

                            <HandoverSafeCheck
                                onComplete={handleRelease}
                                isProcessing={verifying}
                            />
                        </div>
                    )}

                    {!user && (
                        <div className="text-center space-y-4 pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-600 font-medium">
                                Debes iniciar sesión como comprador para completar la transacción.
                            </p>
                            <Button asChild size="lg" className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black">
                                <Link href="/login">Iniciar Sesión</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
