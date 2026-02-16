"use client";

import { useState, Suspense } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    const supabase = createBrowserClient();
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
            const next = searchParams.get("next");
            router.push(next || "/dashboard");
            router.refresh();
        }
    };

    const handleGoogleLogin = async () => {
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
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none" htmlFor="password">Contraseña</label>
                                <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

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

                    {error && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-destructive">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-12 w-full rounded-xl text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Iniciar sesión"}
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
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="h-12 w-full rounded-xl text-base font-semibold flex items-center justify-center gap-3 transition-all hover:bg-secondary active:scale-[0.98]"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        ¿No tienes una cuenta?{" "}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Regístrate gratis
                        </Link>
                    </p>
                </form>
            </div >
        </div >
    );
}
