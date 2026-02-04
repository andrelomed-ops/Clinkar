"use client";

import Link from 'next/link';
import { Menu, Heart, ArrowLeft, ArrowDownWideNarrow } from 'lucide-react';
import { ClinkarSeal } from '@/components/market/ClinkarSeal';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
    variant?: 'default' | 'home' | 'market' | 'sell';
    showBack?: boolean;
    backHref?: string;
    backLabel?: string;
    showFavorites?: boolean;
    favoritesCount?: number;
    showFavoritesOnly?: boolean;
    onToggleFavorites?: () => void;
}

export function Navbar({
    variant = 'default',
    showBack = false,
    backHref = '/',
    backLabel = 'Volver',
    showFavorites = false,
    favoritesCount = 0,
    showFavoritesOnly = false,
    onToggleFavorites
}: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
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

                    {/* Left Section: Back Button or Logo */}
                    <div className="flex items-center gap-4">
                        {showBack ? (
                            <Link href={backHref} className="flex items-center gap-2 group text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-semibold text-sm hidden sm:inline">{backLabel}</span>
                            </Link>
                        ) : variant === 'home' ? (
                            <Link href="/" className="flex items-center gap-3 group">
                                <ClinkarSeal variant="compact" className="!bg-transparent !border-none !shadow-none !p-0" />
                            </Link>
                        ) : (
                            <Link href="/" className="flex items-center gap-2 group">
                                <ClinkarSeal variant="compact" className="scale-110" />
                            </Link>
                        )}
                    </div>

                    {/* Center Section: Navigation Links (Home variant only) */}
                    {variant === 'home' && (
                        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
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
                                <Heart className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
                                <span className="hidden lg:inline">Mis Favoritos</span>
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

                        <div className="hidden lg:flex items-center gap-6">
                            {variant !== 'market' && variant !== 'sell' && (
                                <>
                                    <Link href="/buy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Comprar</Link>
                                    <Link href="/sell" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Vender</Link>
                                    <Link href="/new-cars" className="text-sm font-black text-indigo-600 dark:text-indigo-400 hover:text-foreground transition-colors italic tracking-tight">Autos Nuevos</Link>
                                </>
                            )}
                            <Link href="/login" className="text-sm font-bold hover:text-primary transition-colors">Entrar</Link>
                        </div>

                        <Link href="/register" className="h-10 px-4 sm:px-6 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold flex items-center hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/5 shrink-0">
                            Comenzar
                        </Link>

                        <NotificationCenter />
                        <ThemeToggle />

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden glass-card mt-2 border-x-0 rounded-none p-6 animate-reveal duration-300">
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
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-lg font-bold tracking-tight text-foreground/80 hover:text-foreground transition-colors"
                            >
                                Entrar
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
