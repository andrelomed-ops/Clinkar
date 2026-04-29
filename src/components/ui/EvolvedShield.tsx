import { cn } from "@/lib/utils";
import { ShieldCheck, Zap, Diamond, Crown } from "lucide-react";

interface EvolvedShieldProps {
    role?: string;
    tier?: 'starter' | 'pro' | 'elite' | string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function EvolvedShield({ role, tier, name, size = 'md', className }: EvolvedShieldProps) {
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
        const tierConfig = {
            starter: {
                bg: "bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-600",
                border: "border-zinc-200/50",
                shadow: "shadow-[0_0_15px_rgba(161,161,170,0.3)]",
                icon: <Zap className="h-full w-full p-[15%] text-zinc-600" />,
                ring: "border-zinc-400/20"
            },
            pro: {
                bg: "bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900",
                border: "border-amber-200/50",
                shadow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                icon: <Crown className="h-full w-full p-[15%] text-amber-600 fill-amber-500" />,
                ring: "border-amber-500/20"
            },
            elite: {
                bg: "bg-gradient-to-br from-indigo-500 via-purple-600 to-zinc-900",
                border: "border-indigo-300/50",
                shadow: "shadow-[0_0_25px_rgba(79,70,229,0.4)]",
                icon: <Diamond className="h-full w-full p-[15%] text-indigo-400 fill-indigo-500" />,
                ring: "border-indigo-400/30"
            }
        };

        const config = isAdmin ? tierConfig.elite : (tierConfig[tier as keyof typeof tierConfig] || tierConfig.starter);

        return (
            <div className={cn(
                "relative flex items-center justify-center rounded-full font-black uppercase italic tracking-tighter transition-all duration-700",
                config.bg,
                "border-2",
                config.border,
                config.shadow,
                "animate-in zoom-in fade-in duration-1000",
                sizeClasses[size],
                className
            )}>
                {/* Glossy Overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                
                {/* Status Icon */}
                <div className="absolute -top-1 -right-1 h-1/3 w-1/3 bg-white rounded-full flex items-center justify-center shadow-md border border-zinc-100 animate-bounce-slow">
                    {config.icon}
                </div>

                <span className="relative z-10 text-white drop-shadow-md">
                    {initial}
                </span>
                
                {/* Orbital Ring */}
                <div className={cn("absolute -inset-1 border rounded-full animate-spin-slow opacity-30", config.ring)} />
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
