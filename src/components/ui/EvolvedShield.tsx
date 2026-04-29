import { cn } from "@/lib/utils";
import { ShieldCheck, Zap, Diamond, Crown } from "lucide-react";

interface EvolvedShieldProps {
    role?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function EvolvedShield({ role, name, size = 'md', className }: EvolvedShieldProps) {
    const isInvestor = role?.toLowerCase() === 'investor';
    const isAdmin = role?.toLowerCase() === 'admin';
    const initial = name?.[0] || 'U';

    const sizeClasses = {
        sm: 'h-8 w-8 text-[10px]',
        md: 'h-10 w-10 text-xs',
        lg: 'h-16 w-16 text-xl',
        xl: 'h-24 w-24 text-3xl'
    };

    if (isInvestor || isAdmin) {
        return (
            <div className={cn(
                "relative flex items-center justify-center rounded-full font-black uppercase italic tracking-tighter transition-all duration-700",
                "bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900",
                "border-2 border-amber-200/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                "animate-in zoom-in fade-in duration-1000",
                sizeClasses[size],
                className
            )}>
                {/* Glossy Overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                
                {/* Status Icon */}
                <div className="absolute -top-1 -right-1 h-1/3 w-1/3 bg-white rounded-full flex items-center justify-center shadow-md border border-amber-200 animate-bounce-slow">
                    {isAdmin ? (
                        <ShieldCheck className="h-full w-full p-[15%] text-amber-600" />
                    ) : (
                        <Diamond className="h-full w-full p-[15%] text-amber-600 fill-amber-500" />
                    )}
                </div>

                <span className="relative z-10 text-white drop-shadow-md">
                    {initial}
                </span>
                
                {/* Orbital Ring for Investors */}
                <div className="absolute -inset-1 border border-amber-500/20 rounded-full animate-spin-slow opacity-30" />
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold uppercase",
            sizeClasses[size],
            className
        )}>
            {initial}
        </div>
    );
}
