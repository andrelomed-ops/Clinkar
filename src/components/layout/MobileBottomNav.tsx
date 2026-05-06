"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, CarFront, Tag, User, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Hide bottom nav on scroll down, show on scroll up for more reading space
    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 50) { 
                    setIsVisible(false); // scrolling down
                } else { 
                    setIsVisible(true); // scrolling up
                }
                setLastScrollY(window.scrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    // Check if we are inside a specific record (like a car detail or nested dashboard view)
    const isDeepPage = pathname?.match(/\/buy\/[a-zA-Z0-9-]/) || 
                       pathname?.match(/\/sell\/.+/) || 
                       (pathname?.includes('/dashboard/') && pathname !== '/dashboard');

    return (
        <div className={cn(
            "fixed bottom-0 left-0 w-full z-50 transition-transform duration-300 md:hidden bg-background/95 backdrop-blur-2xl border-t border-border shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]",
            isVisible ? "translate-y-0" : "translate-y-[calc(100%+env(safe-area-inset-bottom))]"
        )}>
            {/* Global Floating Back Button for nested pages */}
            {isDeepPage && (
                <button
                    onClick={() => router.back()}
                    className="absolute -top-16 right-4 h-12 w-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-2xl text-zinc-900 dark:text-white transition-transform active:scale-95"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
            )}

            <div className="flex items-center justify-around h-16 px-2">
                <Link href="/" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", pathname === '/' ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground")}>
                    <Home className={cn("h-5 w-5 transition-transform", pathname === '/' && "scale-110 fill-indigo-600/20")} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Inicio</span>
                </Link>
                <Link href="/buy" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", pathname?.startsWith('/buy') && !isDeepPage ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground")}>
                    <CarFront className={cn("h-5 w-5 transition-transform", pathname?.startsWith('/buy') && !isDeepPage && "scale-110 fill-indigo-600/20")} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Comprar</span>
                </Link>
                <Link href="/sell" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", pathname === '/sell' ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground")}>
                    <Tag className={cn("h-5 w-5 transition-transform", pathname === '/sell' && "scale-110 fill-indigo-600/20")} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Vender</span>
                </Link>
                <Link href="/dashboard" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", pathname?.startsWith('/dashboard') && !isDeepPage ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground")}>
                    <User className={cn("h-5 w-5 transition-transform", pathname?.startsWith('/dashboard') && !isDeepPage && "scale-110 fill-indigo-600/20")} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Perfil</span>
                </Link>
            </div>
        </div>
    );
}
