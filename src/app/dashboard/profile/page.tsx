
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { User, Mail, Shield, ArrowLeft, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationPreferenceCenter } from "@/components/dashboard/NotificationPreferenceCenter";
import { Briefcase, Building2 } from "lucide-react";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createBrowserClient();

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                setProfile(data);
            }
            setLoading(false);
        }
        fetchProfile();
    }, [supabase]);

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from("profiles")
            .update({ full_name: profile.full_name })
            .eq("id", profile.id);

        if (!error) {
            alert("Perfil actualizado correctamente");
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-8">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Volver al Dashboard
                </Link>

                <div className="animate-reveal">
                    <h1 className="text-4xl font-black tracking-tight mb-2">Mi Perfil</h1>
                    <p className="text-muted-foreground">Configura tu identidad digital en Clinkar.</p>
                </div>

                <div className="glass-card rounded-[2rem] p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <User className="h-4 w-4" /> Nombre Completo
                            </label>
                            <Input
                                value={profile?.full_name || ""}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                className="h-12 rounded-xl bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Correo Electrónico
                            </label>
                            <Input
                                value={profile?.email || ""}
                                disabled
                                className="h-12 rounded-xl bg-muted/50 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Perfil de Usuario
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setProfile({ ...profile, role: 'Individual' })}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                        profile?.role !== 'Business' ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "border-border hover:border-indigo-200"
                                    )}
                                >
                                    <User className="h-6 w-6 text-indigo-600" />
                                    <span className="text-xs font-bold uppercase tracking-tighter">Individual</span>
                                </button>
                                <button
                                    onClick={() => setProfile({ ...profile, role: 'Business' })}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                                        profile?.role === 'Business' ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "border-border hover:border-indigo-200"
                                    )}
                                >
                                    <Building2 className="h-6 w-6 text-indigo-600" />
                                    <span className="text-xs font-bold uppercase tracking-tighter">Negocio / Autopartes</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-14 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Guardar Perfil</>}
                    </Button>
                </div>

                <div className="animate-reveal delay-200">
                    <NotificationPreferenceCenter />
                </div>

                <div className="text-center pt-8">
                    <button
                        onClick={() => supabase.auth.signOut().then(() => window.location.href = "/")}
                        className="text-destructive font-bold hover:underline"
                    >
                        Cerrar Sesión Segura
                    </button>
                </div>
            </div>
        </div>
    );
}
