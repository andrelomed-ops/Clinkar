"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, User, Car, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<"buyer" | "seller">("buyer");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
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
                            <input
                                id="fullName"
                                type="text"
                                placeholder="Juan Pérez"
                                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="email">Correo electrónico</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear cuenta"}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
