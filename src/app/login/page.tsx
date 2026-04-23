"use client";

import { useState, Suspense } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Shield, Loader2, ArrowRight } from "lucide-react";
import { StarterKarLogo } from "@/components/ui/StarterKarLogo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-zinc-950 px-6 py-12 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="flex flex-col items-center text-center animate-reveal">
                    <div className="mb-8 scale-110">
                        <StarterKarLogo size="lg" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white mb-2 italic uppercase">
                        Bienvenido <span className="text-indigo-600">Pro</span>
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm max-w-[280px]">
                        Tu acceso seguro a la Bóveda Digital de StarterKar.
                    </p>
                </div>

                {message && (
                    <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 text-center animate-in fade-in zoom-in-95">
                        {message}
                    </div>
                )}

                <div className="glass-card p-8 rounded-[2.5rem] border-zinc-200 dark:border-zinc-800 shadow-2xl animate-reveal stagger-1">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1" htmlFor="email">Correo electrónico</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nombre@ejemplo.com"
                                    className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500" htmlFor="password">Contraseña</label>
                                    <Link href="/forgot-password" className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>

                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-14 w-full rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <span className="flex items-center gap-2">
                                    Entrar <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[#F8FAFC] dark:bg-zinc-900 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">O continuar con</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="h-14 w-full rounded-2xl text-xs font-bold flex items-center justify-center gap-3 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
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
                    </form>
                </div>

                <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest animate-reveal stagger-2">
                    ¿No tienes una cuenta?{" "}
                    <Link href="/register" className="text-indigo-600 hover:underline">
                        Regístrate gratis
                    </Link>
                </p>
            </div>
        </div>
    );
}
