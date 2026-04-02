import { createClient } from '@/lib/supabase/server'
import { ReferralService } from '@/services/ReferralService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Gift, CheckCircle2, Clock, Trophy, Sparkles, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { PRICING_CONFIG } from '@/config/pricing'

export default async function ReferralsDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="container py-24 text-center">
                <h2 className="text-2xl font-black italic uppercase">Inicia sesión</h2>
                <Link href="/login" className="text-indigo-600 font-bold hover:underline">Ir al login</Link>
            </div>
        );
    }

    // Ensure they have a code
    const code = await ReferralService.getOrCreateReferralCode(supabase, user.id)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '') : 'https://starterkar.com';
    const referralLink = `${baseUrl}?ref=${code}`

    // Fetch stats
    const { data: referrals } = await supabase
        .from('referrals' as any)
        .select(`
            id, status, actual_reward, created_at,
            referred_user:profiles!referred_user_id ( full_name, email )
        `)
        .eq('referrer_id', user.id);

    // Fetch Perks
    const { data: perks } = await supabase
        .from('user_perks' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const totalEarned = referrals?.filter((r: any) => r.status === 'COMPLETED' || r.status === 'PAID').length || 0;
    const pendingReferrals = referrals?.filter((r: any) => r.status === 'PENDING').length || 0;

    return (
        <div className="min-h-screen bg-background border-l border-border p-6 md:p-12 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-12">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em]">
                            <Trophy className="h-4 w-4" />
                            <span>Referidos StarterKar PRO</span>
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.9]">
                            Gana por cada <br /> <span className="text-indigo-600">Recomendación</span>
                        </h1>
                    </div>
                    <div className="bg-secondary/50 rounded-2xl p-4 border border-border flex items-center gap-4">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic">
                            {totalEarned}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Éxitos Totales</p>
                            <p className="font-bold text-sm">Transferencias logradas</p>
                        </div>
                    </div>
                </div>

                {/* Main Action Card (Copy Link) */}
                <div className="bg-zinc-950 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                                <Share2 className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase mb-4 tracking-tight">Tu Enlace de Socio</h2>
                            <p className="text-zinc-400 font-medium mb-8 leading-relaxed">
                                Comparte este enlace con amigos. Si compran o venden a través de StarterKar, tú recibes beneficios exclusivos directos en tu cuenta.
                            </p>
                            <div className="flex flex-col gap-4">
                                <code className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-indigo-300 font-mono text-sm break-all">
                                    {referralLink}
                                </code>
                                <Button className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all active:scale-95 shadow-xl shadow-indigo-600/20">
                                    Copiar Enlace
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-indigo-600/20 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-sm space-y-6">
                                <h4 className="font-black italic uppercase text-xs tracking-widest text-indigo-400">Próximas Recompensas</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Zap className="h-4 w-4 text-white" /></div>
                                        <p className="text-sm font-bold">50% de Descuento en Próxima Venta</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-white" /></div>
                                        <p className="text-sm font-bold italic">Bono de ${PRICING_CONFIG.REFERRAL_REWARD_CASH} MXN</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center"><Gift className="h-4 w-4 text-white" /></div>
                                        <p className="text-sm font-bold">Inspección 150 Puntos GRATIS</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits / Perks Section (NEW) */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-indigo-600" />
                        Tus Beneficios Acumulados
                    </h2>
                    
                    {perks && perks.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {perks.map((perk: any) => (
                                <div key={perk.id} className="bg-card border border-border rounded-3xl p-6 relative group hover:border-indigo-500/50 transition-all shadow-sm">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center",
                                            perk.status === 'AVAILABLE' ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                                        )}>
                                            {perk.perk_type === 'FREE_INSPECTION' ? <Wrench className="h-6 w-6" /> : <Gift className="h-6 w-6" />}
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            perk.status === 'AVAILABLE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-zinc-50 text-zinc-500 border-zinc-100"
                                        )}>
                                            {perk.status === 'AVAILABLE' ? 'Disponible' : 'Utilizado'}
                                        </div>
                                    </div>
                                    <h3 className="font-black text-lg italic mb-2">
                                        {perk.perk_type === 'FREE_INSPECTION' ? 'Inspección 150 Puntos' : 
                                         perk.perk_type === 'FEE_DISCOUNT' ? '50% Descuento Comisión' : 'Recompensa Especial'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-medium mb-6">
                                        {perk.metadata?.description || 'Beneficio obtenido por tu programa de referidos.'}
                                    </p>
                                    {perk.status === 'AVAILABLE' && (
                                        <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-10 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                            Canjear ahora
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center rounded-[3rem] bg-secondary/20 border border-dashed border-border">
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Aún no tienes beneficios</p>
                            <p className="text-xs text-muted-foreground mt-2">Completa tu primer referido exitoso para estrenar tus recompensas.</p>
                        </div>
                    )}
                </div>

                {/* Detailed List */}
                <div className="space-y-6 pt-12 border-t border-border/50">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Historial de Referidos</h2>
                    
                    {referrals && referrals.length > 0 ? (
                        <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-secondary/50 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <tr>
                                        <th className="px-8 py-6 text-left">Aliado Reclutado</th>
                                        <th className="px-8 py-6 text-center">Estado de Operación</th>
                                        <th className="px-8 py-6 text-right">Beneficio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {referrals.map((r: any) => (
                                        <tr key={r.id} className="group hover:bg-secondary/20 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-black text-lg italic tracking-tighter truncate max-w-[240px]">
                                                    {r.referred_user?.full_name || 'Nuevo Miembro'}
                                                </div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {r.referred_user?.email || 'Pendiente de registro'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    r.status === 'COMPLETED' || r.status === 'PAID' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                                                )}>
                                                    {r.status === 'COMPLETED' || r.status === 'PAID' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                    {r.status === 'COMPLETED' || r.status === 'PAID' ? 'Ganado' : 'En Progreso'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="font-black text-xl italic text-indigo-600">
                                                    {r.status === 'COMPLETED' || r.status === 'PAID' ? 'RECOMPENSA' : 'PENDIENTE'}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-medium">
                                                    {new Date(r.created_at).toLocaleDateString('es-MX')}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xl font-black italic uppercase mb-2">Comienza tu Red StarterKar</h3>
                            <p className="text-muted-foreground font-medium text-sm">Tu red de aliados aparecerá aquí una vez compartas tu enlace.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

function Wrench(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    )
}
