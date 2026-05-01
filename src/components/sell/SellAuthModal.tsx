
"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SellAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export function SellAuthModal({ isOpen, onClose, onSuccess }: SellAuthModalProps) {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'signup'>('signup');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    
    const supabase = createBrowserClient();

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { 
                            full_name: fullName,
                            phone: phone 
                        }
                    }
                });
                if (error) throw error;
                
                // Also update the profile directly just in case the trigger is slow
                if (data.user) {
                    await supabase.from('profiles').update({
                        full_name: fullName,
                        phone: phone
                    }).eq('id', data.user.id);

                    toast.success("¡Cuenta creada! Iniciando sesión...");
                    onSuccess(data.user);
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                if (data.user) {
                    toast.success("Bienvenido de vuelta.");
                    onSuccess(data.user);
                }
            }
        } catch (err: any) {
            toast.error(err.message || "Error en la autenticación");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 -z-10" />
                
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <X className="h-5 w-5 text-zinc-400" />
                </button>

                <div className="p-10">
                    <div className="flex flex-col items-center text-center space-y-4 mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                                {mode === 'signup' ? 'Inicia tu Viaje' : 'Bienvenido'}
                            </h2>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                {mode === 'signup' ? 'Captura tus datos para recibir atención personalizada' : 'Ingresa para gestionar tu agenda'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {mode === 'signup' && (
                            <>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nombre Completo</Label>
                                    <Input 
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Andrés Medina"
                                        className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">WhatsApp / Teléfono</Label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center justify-center px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-500">
                                            🇲🇽 +52
                                        </div>
                                        <Input 
                                            required
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="55 1234 5678"
                                            className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 flex-1"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input 
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="h-12 pl-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input 
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-12 pl-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl mt-4"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <span className="flex items-center gap-2">
                                    {mode === 'signup' ? 'Crear Cuenta y Continuar' : 'Entrar y Continuar'}
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
                        <button 
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                        </button>
                    </div>
                </div>

                {/* Secure Footer */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 flex items-center justify-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Conexión Segura de Extremo a Extremo</span>
                </div>
            </div>
        </div>
    );
}
