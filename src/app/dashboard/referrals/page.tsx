"use client";

import { useState, useEffect, Suspense } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { Users, Gift, Share2, Copy, Check, ArrowRight, Zap, TrendingUp, DollarSign, UserPlus, Clock, CheckCircle2, XCircle } from "lucide-react";
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
    const [copied, setCopied] = useState(false);
    const searchParams = useSearchParams();
    const refCode = searchParams.get("ref");

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
            setLoading(false);
        }

        loadData();
    }, [supabase, refCode]);

    const applyReferralCode = async (code: string) => {
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
    };

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(`${window.location.origin}?ref=${referralLink.code}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalGenerated = referrals.reduce((sum, r) => sum + (r.actual_reward || 0), 0);
    const pendingCount = referrals.filter(r => r.status === "PENDING_OPERATION").length;
    const closedCount = referrals.filter(r => r.status === "OPERATION_CLOSED").length;
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
                <Link href="/dashboard">
                    <Button variant="ghost">Volver</Button>
                </Link>
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
                            <div className="text-lg font-black tracking-tighter">{paidCount > 0 ? "Paid" : "New"}</div>
                            <div className="text-[8px] font-black uppercase text-indigo-300/70 tracking-widest">Nivel</div>
                        </div>
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
        </div>
    );
}