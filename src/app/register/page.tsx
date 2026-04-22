"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Shield, User, Car, Loader2, Gift } from "lucide-react";
import { StarterKarSeal } from "@/components/market/StarterKarSeal";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReferralService } from "@/services/ReferralService";


export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<"buyer" | "seller">("buyer");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createBrowserClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const refCode = searchParams.get("ref");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard?verified=true")}`,
                },
            });

            if (error) {
                console.error("Supabase Auth Error:", error);
                setError(error.message);
                setLoading(false);
            } else {
                // Background: Assign Referral if code exists
                const finalRefCode = refCode || localStorage.getItem("clinkar_ref_code");
                if (finalRefCode && data.user) {
                    try {
                        await ReferralService.assignReferral(supabase, data.user.id, finalRefCode);
                        localStorage.removeItem("clinkar_ref_code");
                        console.log(`[REFERRAL] Successfully assigned code ${finalRefCode} to user ${data.user.id}`);
                    } catch (refErr) {
                        console.error("[REFERRAL] Failed to assign code:", refErr);
                    }
                }

                if (data.session === null) {
                    // Email confirmation sent
                    router.push("/login?message=Verifica tu correo electrónico para confirmar tu cuenta");
                } else {
                    router.push("/dashboard");
                }
            }
        } catch (err: any) {
            console.error("Registration Critical Error:", err);
            // Better diagnosis for 404/Failed to fetch
            if (err.message?.includes("fetch")) {
                setError("Error de conexión: No se pudo contactar con el servidor de autenticación. Verifica tu conexión.");
            } else {
                setError(err.message || "Inesperado fallo en el registro. Intenta de nuevo.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center text-center">
                    <Link href="/" className="mb-8 group">
                        <StarterKarSeal variant="compact" className="scale-150" />
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Crea tu cuenta</h2>
                    <p className="mt-2 text-muted-foreground">Únete a la plataforma de intermediación segura.</p>
                    {refCode && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                            <Gift className="h-4 w-4" />
                            <span>Código de referido aplicado</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleRegister} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        {/* Role Selector */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole("buyer")}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all",
                                    role === "buyer"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border bg-background text-muted-foreground hover:bg-secondary"
                                )}
                            >
                                <User className="h-6 w-6" />
                                <span className="text-sm font-semibold">Comprador</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("seller")}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all",
                                    role === "seller"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border bg-background text-muted-foreground hover:bg-secondary"
                                )}
                            >
                                <Car className="h-6 w-6" />
                                <span className="text-sm font-semibold">Vendedor</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="fullName">Nombre completo</label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Juan Pérez"
                                className="h-12 rounded-xl"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="email">Correo electrónico</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                className="h-12 rounded-xl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">Contraseña</label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-12 rounded-xl"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="terms"
                            required
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="terms" className="text-sm text-muted-foreground">
                            Acepto los{" "}
                            <Link href="/terms" className="text-primary hover:underline">
                                Términos y Condiciones
                            </Link>{" "}
                            y el{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                                Aviso de Privacidad
                            </Link>
                        </label>
                    </div>


                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-12 w-full rounded-xl text-base font-semibold"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear cuenta"}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground font-medium">O continuar con</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                            setLoading(true);
                            const { error } = await supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: {
                                    redirectTo: `${window.location.origin}/auth/callback`,
                                },
                            });
                            if (error) {
                                setError(error.message);
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="h-12 w-full rounded-xl text-base font-semibold flex items-center justify-center gap-3"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </form>
            </div >
        </div >
    );
}
