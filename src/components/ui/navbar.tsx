"use client";

import Link from 'next/link';
import { Menu, Heart, ArrowLeft, ArrowDownWideNarrow } from 'lucide-react';
import { StarterKarLogo } from '@/components/ui/StarterKarLogo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { NotificationCenter } from './NotificationCenter';
import { AgentModeBar } from '@/components/admin/AgentModeBar';
import { createBrowserClient } from '@/lib/supabase/client';

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
    const supabase = createBrowserClient();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
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
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                    {/* Left Section: Logo */}
                    <div className="flex items-center gap-4">
                        <StarterKarLogo size="sm" showMonogram={false} href="/" />
                    </div>

                    {/* Center Section: Navigation Links (Home variant only) */}
                    {variant === 'home' && (
                        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                            <Link href="#security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Seguridad</Link>
                            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Proceso</Link>
                        </div>
                    )}

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-4">
                        {showFavorites && (
                            <button
                                onClick={onToggleFavorites}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-bold",
                                    showFavoritesOnly
                                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
                                        : "border-transparent hover:bg-secondary text-muted-foreground"
                                )}
                            >
                                <Heart className={cn(
                                    "h-4 w-4 transition-all",
                                    favoritesCount > 0 ? "fill-red-500 text-red-500 animate-heartbeat" : "text-muted-foreground",
                                    showFavoritesOnly && "fill-current"
                                )} />
                                <span className={cn(
                                    "hidden lg:inline font-bold",
                                    favoritesCount > 0 ? "text-red-600" : "text-muted-foreground"
                                )}>Mis Favoritos</span>
                                {favoritesCount > 0 && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-full text-[10px]",
                                        showFavoritesOnly ? "bg-red-100 dark:bg-red-900/40" : "bg-zinc-100 dark:bg-zinc-800"
                                    )}>
                                        {favoritesCount}
                                    </span>
                                )}
                            </button>
                        )}

                        <div className="hidden lg:flex items-center gap-4">
                            {variant !== 'market' && variant !== 'sell' && (
                                <>
                                    <Link href="/buy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Comprar</Link>
                                    <Link href="/sell" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Vender</Link>
                                    <Link href="/new-cars" className="text-sm font-black text-indigo-600 dark:text-indigo-400 hover:text-foreground transition-colors italic">Autos Nuevos</Link>
                                </>
                            )}
                            <StarterKarLogo 
                                size="sm" 
                                showWordmark={false} 
                                orientation="vertical" 
                                label={user ? "Mi Garage" : "Inicio"} 
                                href={user ? "/dashboard" : "/login"} 
                                className="hover:translate-y-[-2px] transition-all"
                            />
                            {user && (
                                <button 
                                    onClick={handleSignOut}
                                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    Salir
                                </button>
                            )}
                            <NotificationCenter />
                            <ThemeToggle />
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
