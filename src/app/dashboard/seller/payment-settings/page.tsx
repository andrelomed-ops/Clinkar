"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Landmark, ShieldCheck, CreditCard, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationService } from "@/services/NotificationService";

export default function PaymentSettingsPage() {
    const supabase = createBrowserClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [bankName, setBankName] = useState("");
    const [accountHolder, setAccountHolder] = useState("");
    const [clabe, setClabe] = useState("");
    
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadPaymentSettings() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.payment_settings) {
                const settings = user.user_metadata.payment_settings;
                setBankName(settings.bank_name || "");
                setAccountHolder(settings.account_holder || "");
                setClabe(settings.clabe || "");
            }
            setLoading(false);
        }
        loadPaymentSettings();
    }, [supabase]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        // Validation
        if (clabe.length !== 18 || !/^\d+$/.test(clabe)) {
            setError("La cuenta CLABE debe contener exactamente 18 dígitos numéricos.");
            return;
        }
        if (!bankName.trim() || !accountHolder.trim()) {
            setError("Por favor completa todos los campos.");
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authentitcated user");

            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    payment_settings: {
                        bank_name: bankName,
                        account_holder: accountHolder,
                        clabe: clabe,
                        updated_at: new Date().toISOString()
                    }
                }
            });

            if (updateError) throw updateError;

            // Notify Admin securely via Audit Logs
            await NotificationService.notifyAdmin(supabase, {
                action: "UPDATE_CLABE",
                entityType: "USER_METADATA",
                entityId: user.id
            });

            setSuccessMessage("Configuración de pago guardada exitosamente. Tu cuenta está lista para recibir transferencias por venta.");
        } catch (err: any) {
            setError(err.message || "Ocurrió un error al guardar la configuración.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 animate-pulse text-zinc-500">Cargando configuración de pagos...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6 md:p-8">
            <div>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Configuración de Cobro</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Ingresa los datos de cuenta bancaria donde deseas recibir el dinero por la venta de tu vehículo tras la entrega.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form Secton */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                        <div className="space-y-6">
                            
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800">
                                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {successMessage && (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-start gap-3 border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium">{successMessage}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Nombre de Institución Bancaria</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Landmark className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: BBVA México, Banorte, Santander"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Nombre en la Cuenta (Titular)</label>
                                <input 
                                    type="text" 
                                    placeholder="Nombre completo exactamente como aparece en tu estado de cuenta"
                                    value={accountHolder}
                                    onChange={(e) => setAccountHolder(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Cuenta CLABE (18 dígitos)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CreditCard className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        maxLength={18}
                                        placeholder="123456789012345678"
                                        value={clabe}
                                        onChange={(e) => setClabe(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium font-mono text-lg transition-all"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <span className={cn(
                                            "text-xs font-bold", 
                                            clabe.length === 18 ? "text-emerald-500" : "text-zinc-400"
                                        )}>
                                            {clabe.length}/18
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-4 font-bold disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/20"
                            >
                                {saving ? "Guardando en Bóveda..." : "Guardar Cuenta de Cobro"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Security info */}
                <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-3xl p-6">
                        <Lock className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-4" />
                        <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Bóveda Cifrada StarterKar</h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400/80 leading-relaxed">
                            Esta información se almacena con cifrado bancario centralizado y es inaccesible al público. Solo la mesa de control de StarterKar la usa para efectuar transferencias seguras tras certificar la entrega.
                        </p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50 rounded-3xl p-6">
                        <ShieldCheck className="h-8 w-8 text-zinc-600 dark:text-zinc-400 mb-4" />
                        <h3 className="font-bold text-zinc-900 dark:text-white mb-2">Transferencia post-entrega</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Protegemos la operación protegiendo la comisión y la titularidad hasta que el comprador y tú concreten físicamente la entrega del auto en el Taller Aliado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
