"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get("message");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
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
                    <h2 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</h2>
                    <p className="mt-2 text-muted-foreground">Ingresa tus credenciales para continuar.</p>
                </div>

                {message && (
                    <div className="rounded-xl bg-primary/10 p-4 text-sm font-medium text-primary">
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div className="space-y-4">
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
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none" htmlFor="password">Contraseña</label>
                                <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
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
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Iniciar sesión"}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        ¿No tienes una cuenta?{" "}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Regístrate gratis
                        </Link>
                    </p>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Modo Demo: Acceso Rápido</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => { document.cookie = "clinkar_role=buyer; path=/"; window.location.href = "/dashboard"; }} className="h-10 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 border border-blue-200">
                            🛍️ Comprador
                        </button>
                        <button type="button" onClick={() => { document.cookie = "clinkar_role=seller; path=/"; window.location.href = "/dashboard"; }} className="h-10 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 border border-green-200">
                            🚗 Vendedor
                        </button>
                        <button type="button" onClick={() => { document.cookie = "clinkar_role=inspector; path=/"; window.location.href = "/dashboard"; }} className="h-10 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 border border-amber-200">
                            🔧 Mecánico
                        </button>
                        <button type="button" onClick={() => { document.cookie = "clinkar_role=legal; path=/"; window.location.href = "/dashboard"; }} className="h-10 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 border border-purple-200">
                            ⚖️ Legal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
