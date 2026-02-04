"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Shield, User, Car, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<"buyer" | "seller">("buyer");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createBrowserClient();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/login?message=Check your email to confirm your account");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center text-center">
                    <Link href="/" className="mb-8 flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                            <Shield className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Clinkar</span>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Crea tu cuenta</h2>
                    <p className="mt-2 text-muted-foreground">Únete a la plataforma de intermediación segura.</p>
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
