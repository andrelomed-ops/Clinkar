"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { Users, Gift, Share2, Copy, Check, ArrowRight, Zap, TrendingUp, DollarSign, UserPlus, Clock, CheckCircle2, XCircle, CarFront, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ReferralLink = {
    id: string;
    user_id: string;
    code: string;
    default_reward_amount: number;
    created_at: string;
};

type Referral = {
    id: string;
    referrer_id: string;
    referred_user_id: string;
    transaction_id: string | null;
    status: "PENDING_OPERATION" | "OPERATION_CLOSED" | "PAID";
    actual_reward: number | null;
    created_at: string;
    updated_at: string;
    referred_profile?: {
        email: string;
        full_name: string;
    };
};

type PuenteLead = {
    id: string;
    current_brand: string;
    current_model: string;
    looking_for: string;
    status: string;
    created_at: string;
    user_id: string;
};

export default function ReferralsPage() {
    return (
        <Suspense fallback={<div className="p-8"><Skeleton className="h-96" /></div>}>
            <ReferralsContent />
        </Suspense>
    );
}

function ReferralsContent() {
    const [supabase] = useState(() => createBrowserClient());
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [referralLink, setReferralLink] = useState<ReferralLink | null>(null);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [puenteLeads, setPuenteLeads] = useState<PuenteLead[]>([]);
    const [copied, setCopied] = useState(false);
    const searchParams = useSearchParams();
    const refCode = searchParams.get("ref");

    const applyReferralCode = useCallback(async (code: string) => {
        if (!user) return;

        try {
            const { data: codeOwner, error: codeError } = await supabase
                .from("referral_links")
                .select("user_id")
                .eq("code", code.toUpperCase())
                .single();

            if (codeError || !codeOwner) {
                toast.error("Código de referido inválido");
                return;
            }

            if (codeOwner.user_id === user.id) {
                toast.error("No puedes referirte a ti mismo");
                return;
            }

            const { error: insertError } = await supabase
                .from("referrals")
                .insert({
                    referrer_id: codeOwner.user_id,
                    referred_user_id: user.id,
                    status: "PENDING_OPERATION",
                });

            if (insertError) {
                if (insertError.code === "23505") {
                    toast.info("Ya eras parte de este programa de referidos");
                } else {
                    toast.error("Error al aplicar el código");
                }
            } else {
                toast.success("¡Código aplicado! Ganaste beneficios.");
            }
        } catch (err) {
            console.error(err);
        }
    }, [user, supabase]);

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = "/login";
                return;
            }
            setUser(user);

            // Check for ref code in URL
            if (refCode) {
                await applyReferralCode(refCode);
            }

            // Fetch referral link
            const { data: link } = await supabase
                .from("referral_links")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (link) {
                setReferralLink(link);
            } else {
                const newCode = `STARTER-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                const { data: newLink } = await supabase
                    .from("referral_links")
                    .insert({
                        user_id: user.id,
                        code: newCode,
                        default_reward_amount: 500,
                    })
                    .select()
                    .single();
                if (newLink) setReferralLink(newLink);
            }

            // Fetch referrals where user is referrer
            const { data: refs } = await supabase
                .from("referrals")
                .select("*, referred_profile:profiles!referrals_referred_user_id_fkey(email, full_name)")
                .eq("referrer_id", user.id)
                .order("created_at", { ascending: false });

            if (refs) setReferrals(refs);

            // Fetch leads from referred users
            if (refs && refs.length > 0) {
                const referredUserIds = refs.map(r => r.referred_user_id);
                const { data: leads } = await supabase
                    .from('seller_leads')
                    .select('*')
                    .in('user_id', referredUserIds)
                    .order('created_at', { ascending: false });
                
                if (leads) setPuenteLeads(leads);
            }

            setLoading(false);
        }

        loadData();
    }, [supabase, refCode, applyReferralCode]);

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(`${window.location.origin}?ref=${referralLink.code}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalGenerated = referrals.reduce((sum, r) => sum + (r.actual_reward || 0), 0);
    const paidCount = referrals.filter(r => r.status === "PAID").length;

    if (loading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">Programa de Referidos</h1>
                    <p className="text-muted-foreground">Invita amigos y gana recompensas</p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <Users size={180} />
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Gift className="h-6 w-6 text-indigo-100" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Crecimiento StarterKar PRO</h3>
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Gana por expandir nuestra red</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-3">
                            <h4 className="text-3xl font-black leading-none tracking-tighter">
                                Invita a un amigo <br />
                                <span className="text-indigo-300">Gana $500 MXN</span>
                            </h4>
                            <p className="text-indigo-100/80 text-sm font-medium">
                                Por cada amigo que se registre con tu código y complete una operación.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-200 ml-1">Tu Enlace Único</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-black/20 rounded-xl h-12 flex items-center px-4 font-mono text-xs overflow-hidden text-indigo-200 border border-white/10 uppercase">
                                        {window.location.origin}?ref={referralLink?.code || "..."}
                                    </div>
                                    <Button
                                        onClick={handleCopy}
                                        variant="secondary"
                                        className="h-12 w-12 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 p-0"
                                    >
                                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button className="h-12 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold border-0">
                                    <Share2 className="mr-2 h-4 w-4" /> Compartir
                                </Button>
                                <Button className="h-12 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black shadow-lg">
                                    Ver Recompensas
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                        <div className="text-center space-y-1">
                            <TrendingUp className="h-4 w-4 mx-auto text-indigo-300" />
                            <div className="text-lg font-black tracking-tighter">${totalGenerated.toLocaleString()}</div>
                            <div className="text-[8px] font-black uppercase text-indigo-300/70 tracking-widest">Generado Total</div>
                        </div>
                        <div className="text-center space-y-1">
                            <Users className="h-4 w-4 mx-auto text-indigo-300" />
                            <div className="text-lg font-black tracking-tighter">{referrals.length}</div>
                            <div className="text-[8px] font-black uppercase text-indigo-300/70 tracking-widest">Referidos</div>
                        </div>
                        <div className="text-center space-y-1">
                            <Zap className="h-4 w-4 mx-auto text-indigo-300" />
                            <div className="text-lg font-black tracking-tighter">{referrals.length >= 5 ? "Silver" : "Bronze"}</div>
                            <div className="text-[8px] font-black uppercase text-indigo-300/70 tracking-widest">Nivel</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Milestones / Progress */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-black text-lg italic tracking-tight uppercase">Próximo Hito</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Completa 5 referidos para subir a Nivel Plata</p>
                    </div>
                    <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                        <Zap className="h-6 w-6" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min((referrals.length / 5) * 100, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        <span>{referrals.length} Referidos</span>
                        <span>Meta: 5 Referidos</span>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600">
                                <DollarSign className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Bono Nivel Plata</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-tight">Al llegar a 5 referidos, tu comisión sube a <span className="text-zinc-900 dark:text-white font-bold">$750 MXN</span> por cada uno.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600">
                                <Gift className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Soporte VIP</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-tight">Canal directo con el equipo de operaciones para agilizar tus cierres.</p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Tus Referidos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {referrals.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No tienes referidos aún</p>
                            <p className="text-sm">Comparte tu código para invitar amigos</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {referrals.map((ref) => (
                                <div
                                    key={ref.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <UserPlus className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {ref.referred_profile?.full_name || ref.referred_profile?.email || "Usuario"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(ref.created_at).toLocaleDateString("es-MX")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {ref.status === "PENDING_OPERATION" && (
                                            <span className="flex items-center gap-1 text-sm text-yellow-600">
                                                <Clock className="h-4 w-4" /> Pendiente
                                            </span>
                                        )}
                                        {ref.status === "OPERATION_CLOSED" && (
                                            <span className="flex items-center gap-1 text-sm text-blue-600">
                                                <CheckCircle2 className="h-4 w-4" /> Cerrado
                                            </span>
                                        )}
                                        {ref.status === "PAID" && (
                                            <span className="flex items-center gap-1 text-sm text-green-600">
                                                <DollarSign className="h-4 w-4" /> Pagado
                                            </span>
                                        )}
                                        {ref.actual_reward && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                ${ref.actual_reward} MXN
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {puenteLeads.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CarFront className="h-5 w-5" />
                            Certificados Puente Generados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {puenteLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                Interés en: <span className="font-black italic">{lead.looking_for}</span>
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                                {new Date(lead.created_at).toLocaleDateString("es-MX")} • {lead.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                        Activo
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}