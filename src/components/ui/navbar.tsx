"use client";

import Link from 'next/link';
import { Menu, Heart, ArrowLeft, ArrowDownWideNarrow } from 'lucide-react';
import { StarterKarLogo } from '@/components/ui/StarterKarLogo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { NotificationCenter } from './NotificationCenter';
import { AgentModeBar } from '@/components/admin/AgentModeBar';
import { createBrowserClient } from '@/lib/supabase/client';
import { EvolvedShield } from './EvolvedShield';

interface NavbarProps {
    variant?: 'default' | 'home' | 'market' | 'sell';
    showFavorites?: boolean;
    favoritesCount?: number;
    showFavoritesOnly?: boolean;
    onToggleFavorites?: () => void;
}

export function Navbar({
    variant = 'default',
    showFavorites = false,
    favoritesCount = 0,
    showFavoritesOnly = false,
    onToggleFavorites
}: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const supabase = useMemo(() => createBrowserClient(), []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        supabase.auth.getUser().then(async ({ data: { user } }) => {
            setUser(user);
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (profile) setUserProfile(profile);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            // Clear demo role cookie
            document.cookie = "starterkar_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
            // Force a hard reload to clear any memory state
            window.location.href = '/';
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = '/';
        }
    };

    const navLinks = [
        ...(variant === 'home' ? [
            { href: '#security', label: 'Seguridad' },
            { href: '#how-it-works', label: 'Proceso' },
        ] : []),
        { href: '/buy', label: 'Comprar' },
        { href: '/sell', label: 'Vender' },
        { href: '/new-cars', label: 'Autos Nuevos', className: "font-black text-indigo-600 dark:text-indigo-400 italic" },
    ];

    return (
        <>
            <nav className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300 border-b",
                isScrolled || isMenuOpen
                    ? "bg-background/80 backdrop-blur-md border-border py-2"
                    : "bg-background/0 border-transparent py-4",
                variant === 'market' && "bg-background/80 backdrop-blur-md border-border/40"
            )}>
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

                    {/* Left Section: Logo */}
                    <div className="flex items-center shrink-0 pr-4">
                        <StarterKarLogo size="lg" showMonogram={false} href="/" hideSubmark={true} />
                    </div>

                    {/* Center Section: Navigation Links */}
                    <div className="hidden lg:flex items-center justify-center flex-1 gap-8 px-4 overflow-hidden">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-indigo-600 transition-all shrink-0 whitespace-nowrap",
                                    link.className
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-3 shrink-0 pl-4">
                        {showFavorites && (
                            <button
                                onClick={onToggleFavorites}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest",
                                    showFavoritesOnly
                                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
                                        : "border-transparent hover:bg-secondary text-muted-foreground"
                                )}
                            >
                                <Heart className={cn(
                                    "h-3.5 w-3.5 transition-all",
                                    favoritesCount > 0 ? "fill-red-500 text-red-500 animate-heartbeat" : "text-muted-foreground",
                                    showFavoritesOnly && "fill-current"
                                )} />
                                <span className="hidden xl:inline">Favoritos</span>
                            </button>
                        )}

                        <div className="flex items-center gap-2">
                            {!user ? (
                                <Link 
                                    href="/login"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                                >
                                    <User className="h-3.5 w-3.5" />
                                    Entrar
                                </Link>
                            ) : (
                                <StarterKarLogo 
                                    size="sm" 
                                    showWordmark={false} 
                                    orientation="horizontal"
                                    label="" 
                                    href="/dashboard" 
                                    className="hover:translate-y-[-2px] transition-all"
                                />
                            )}
                            {user && userProfile?.role?.toLowerCase() === 'investor' && (
                                <div className={cn(
                                    "hidden xl:flex items-center gap-2 px-4 py-1.5 rounded-full text-white border shadow-lg text-[10px] font-black uppercase tracking-[0.15em] animate-in fade-in zoom-in duration-500",
                                    userProfile?.investor_tier === 'elite' ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 shadow-indigo-500/20" :
                                    userProfile?.investor_tier === 'pro' ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 shadow-amber-500/20" :
                                    "bg-gradient-to-r from-zinc-400 to-zinc-500 border-zinc-300 shadow-zinc-500/20"
                                )}>
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    🎖️ Inversionista {userProfile?.investor_tier?.toUpperCase() || 'STARTER'}
                                </div>
                            )}
                            {user && userProfile?.role?.toLowerCase() !== 'investor' && userProfile?.role?.toLowerCase() !== 'admin' && (
                                <Link 
                                    href="/investor/apply"
                                    className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all whitespace-nowrap"
                                >
                                    Inversionistas
                                </Link>
                            )}
                            {user && (
                                <button 
                                    onClick={handleSignOut}
                                    className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                                >
                                    Cerrar Sesión
                                </button>
                            )}
                            <div className="flex items-center gap-1">
                                <NotificationCenter />
                                <ThemeToggle />
                            </div>
                            {user && (
                                <EvolvedShield 
                                    role={userProfile?.role} 
                                    tier={userProfile?.investor_tier}
                                    name={userProfile?.full_name} 
                                    size="md" 
                                    className="ml-2"
                                />
                            )}
                        </div>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden glass-card mt-2 border-x-0 rounded-none p-6 animate-reveal duration-300">
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn("text-lg font-bold tracking-tight text-foreground/80 hover:text-foreground transition-colors", link.className)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!user && (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-lg font-bold tracking-tight text-foreground/80 hover:text-foreground transition-colors"
                                >
                                    Entrar
                                </Link>
                            )}
                            {user && (
                                <button 
                                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                                    className="text-lg font-bold tracking-tight text-red-500 text-left pt-4 border-t border-zinc-100 dark:border-zinc-800"
                                >
                                    Cerrar Sesión
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            <AgentModeBar />
        </>
    );
}
