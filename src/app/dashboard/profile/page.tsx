"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { User, Mail, Phone, MapPin, Shield, Loader2, Camera, Save, FileCheck, ChevronLeft, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navbar } from "@/components/ui/navbar";
import { CameraUpload } from "@/components/ui/CameraUpload";
import Link from "next/link";

export default function ProfilePage() {
    const supabase = createBrowserClient();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});

    const toggleEdit = (field: string) => {
        setEditingFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = "/login";
                return;
            }
            setUser(user);

            const { data: profileData, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (profileData) {
                setProfile(profileData);
            } else {
                // Initialize empty profile with user ID for new users
                setProfile({
                    id: user.id,
                    full_name: "",
                    phone: "",
                    location: "",
                    avatar_url: null,
                    rfc: "",
                    cif_url: null
                });
            }
            setLoading(false);
        }
        loadProfile();
    }, [supabase]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: profile.id,
                    full_name: profile.full_name,
                    phone: profile.phone,
                    location: profile.location,
                    avatar_url: profile.avatar_url,
                    rfc: profile.rfc,
                    cif_url: profile.cif_url,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error("Error saving profile:", error);
                throw error;
            }
            
            // Reset editing states
            setEditingFields({});
            
            toast.success("Perfil actualizado con éxito");
        } catch (err) {
            toast.error("Error al actualizar perfil");
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-zinc-500 font-bold">Cargando tu identidad digital...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-background/80 backdrop-blur-md px-6 h-16 shrink-0 flex items-center justify-between z-50 sticky top-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <User className="h-5 w-5 text-indigo-600" />
                    <span className="font-bold text-lg">Mi Perfil StarterKar</span>
                </div>
                <div className="flex items-center gap-4">
                     <span className="hidden md:inline-block text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">Cuenta Verificada</span>
                     <button 
                        onClick={handleSignOut}
                        className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors ml-4"
                     >
                        Cerrar Sesión
                     </button>
                </div>
            </div>

            <main className="max-w-4xl mx-auto py-12 px-6">
                <div className="grid md:grid-cols-12 gap-12">
                    {/* Left: Avatar & Quick Info */}
                    <div className="md:col-span-4 space-y-6 text-center">
                        <div className="relative inline-block group">
                            {profile?.avatar_url ? (
                                <img 
                                    src={profile.avatar_url} 
                                    alt="Avatar" 
                                    className="h-32 w-32 rounded-full border-4 border-white dark:border-zinc-900 shadow-2xl object-cover"
                                />
                            ) : (
                                <div className="h-32 w-32 rounded-full bg-indigo-100 border-4 border-white dark:border-zinc-900 shadow-2xl flex items-center justify-center text-4xl font-black text-indigo-600">
                                    {profile?.full_name ? profile.full_name.split(' ').map((n: any) => n[0]).join('') : 'U'}
                                </div>
                            )}
                            
                            <div className="absolute bottom-0 right-0">
                                <CameraUpload 
                                    onUpload={(url) => setProfile({ ...profile, avatar_url: url })}
                                    variant="circle-trigger"
                                    className="z-[60]"
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">{profile?.full_name || 'Usuario'}</h2>
                            <p className="text-sm text-zinc-500 font-medium">{user?.email}</p>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-left space-y-3">
                            <div className="flex items-center gap-3 text-xs font-bold text-zinc-600">
                                <Shield className="h-4 w-4 text-indigo-600" />
                                Nivel de Seguridad: Alto
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-zinc-600">
                                <Shield className="h-4 w-4 text-indigo-600" />
                                Bóveda Activa: Sí
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="md:col-span-8">
                        <form onSubmit={handleSave} className="space-y-8 glass-card p-8 rounded-[2.5rem] border-border/40 shadow-2xl shadow-indigo-500/5">
                            <div className="space-y-6">
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-zinc-400">Nombre Completo</Label>
                                        <button 
                                            type="button"
                                            onClick={() => toggleEdit('full_name')}
                                            className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:opacity-70 transition-opacity"
                                        >
                                            {editingFields['full_name'] ? <><X className="h-3 w-3" /> Cancelar</> : <><Pencil className="h-3 w-3" /> Editar</>}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input 
                                            id="name"
                                            value={profile?.full_name || ""}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            disabled={!editingFields['full_name']}
                                            className={cn(
                                                "pl-10 h-12 rounded-xl transition-all",
                                                editingFields['full_name'] 
                                                    ? "bg-white border-indigo-200 shadow-sm" 
                                                    : "bg-secondary/30 border-transparent cursor-not-allowed"
                                            )}
                                            placeholder="Tu nombre legal"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-zinc-400">Email (Protegido)</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input 
                                            id="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="pl-10 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-transparent cursor-not-allowed opacity-60"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-zinc-400">Teléfono</Label>
                                            <button 
                                                type="button"
                                                onClick={() => toggleEdit('phone')}
                                                className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:opacity-70 transition-opacity"
                                            >
                                                {editingFields['phone'] ? <><X className="h-3 w-3" /> Cancelar</> : <><Pencil className="h-3 w-3" /> Editar</>}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <Input 
                                                id="phone"
                                                value={profile?.phone || ""}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                disabled={!editingFields['phone']}
                                                className={cn(
                                                    "pl-10 h-12 rounded-xl transition-all",
                                                    editingFields['phone'] 
                                                        ? "bg-white border-indigo-200 shadow-sm" 
                                                        : "bg-secondary/30 border-transparent cursor-not-allowed"
                                                )}
                                                placeholder="+52 ..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-zinc-400">Ubicación</Label>
                                            <button 
                                                type="button"
                                                onClick={() => toggleEdit('location')}
                                                className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:opacity-70 transition-opacity"
                                            >
                                                {editingFields['location'] ? <><X className="h-3 w-3" /> Cancelar</> : <><Pencil className="h-3 w-3" /> Editar</>}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <Input 
                                                id="location"
                                                value={profile?.location || ""}
                                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                                disabled={!editingFields['location']}
                                                className={cn(
                                                    "pl-10 h-12 rounded-xl transition-all",
                                                    editingFields['location'] 
                                                        ? "bg-white border-indigo-200 shadow-sm" 
                                                        : "bg-secondary/30 border-transparent cursor-not-allowed"
                                                )}
                                                placeholder="Ciudad, Estado"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border/50">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200 mb-6 flex items-center gap-2">
                                        <FileCheck className="h-4 w-4 text-indigo-600" />
                                        Información Fiscal (Dealerships)
                                    </h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="rfc" className="text-xs font-black uppercase tracking-widest text-zinc-400">RFC (Tax ID)</Label>
                                                <button 
                                                    type="button"
                                                    onClick={() => toggleEdit('rfc')}
                                                    className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:opacity-70 transition-opacity"
                                                >
                                                    {editingFields['rfc'] ? <><X className="h-3 w-3" /> Cancelar</> : <><Pencil className="h-3 w-3" /> Editar</>}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                <Input 
                                                    id="rfc"
                                                    value={profile?.rfc || ""}
                                                    onChange={(e) => setProfile({ ...profile, rfc: e.target.value.toUpperCase() })}
                                                    disabled={!editingFields['rfc']}
                                                    className={cn(
                                                        "pl-10 h-12 rounded-xl transition-all font-mono",
                                                        editingFields['rfc'] 
                                                            ? "bg-white border-indigo-200 shadow-sm" 
                                                            : "bg-secondary/30 border-transparent cursor-not-allowed"
                                                    )}
                                                    placeholder="ABCD123456..."
                                                    maxLength={13}
                                                />
                                            </div>
                                            <p className="text-[10px] text-zinc-500 font-medium italic">Necesario para facturación en agencias.</p>
                                        </div>

                                        <div className="relative group">
                                            {!editingFields['cif'] && (
                                                <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-[1px] z-10 rounded-2xl flex items-center justify-center pointer-events-auto">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="bg-white border-indigo-200 text-indigo-600 font-black uppercase tracking-widest text-[10px]"
                                                        onClick={() => toggleEdit('cif')}
                                                    >
                                                        <Pencil className="h-3 w-3 mr-2" /> Actualizar Documento
                                                    </Button>
                                                </div>
                                            )}
                                            <CameraUpload 
                                                label="Cédula de Identificación Fiscal (CIF)"
                                                description="Sube tu CIF en formato PDF o imagen"
                                                category="DOCUMENT"
                                                onUpload={(url) => {
                                                    setProfile({ ...profile, cif_url: url });
                                                    toggleEdit('cif');
                                                }}
                                                className="bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-border/50"
                                            />
                                            {editingFields['cif'] && (
                                                <button 
                                                    onClick={() => toggleEdit('cif')}
                                                    className="absolute top-2 right-2 p-1 bg-white dark:bg-zinc-800 rounded-full shadow-md z-20 text-zinc-400 hover:text-red-500"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                             <div className="pt-6 border-t border-border flex justify-end">
                                <Button 
                                    type="submit" 
                                    disabled={saving || Object.values(editingFields).every(v => !v)}
                                    className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                                >
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-3xl">
                            <h4 className="text-amber-800 dark:text-amber-400 font-black text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Zona de Seguridad
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                                Para cambiar tu correo electrónico o solicitar la eliminación definitiva de tu identidad digital y activos en la Bóveda, por favor contacta a soporte técnico de StarterKar.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
