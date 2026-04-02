import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, AlertCircle, DollarSign, ArrowRight, User, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function AdminReferralsPage() {
    const supabase = await createClient()
    
    // Fetch all referrals with user info
    const { data: referrals, error } = await supabase
        .from('referrals' as any)
        .select(`
            id, status, actual_reward, created_at, transaction_id,
            referrer:referrer_id ( id, full_name, email ),
            referred:referred_id ( id, full_name, email )
        `)
        .order('created_at', { ascending: false });

    const pendingPayments = referrals?.filter((r: any) => r.status === 'COMPLETED').length || 0;
    const totalPayout = referrals?.filter((r: any) => r.status === 'PAID').reduce((acc: number, r: any) => acc + (r.actual_reward || 0), 0) || 0;

    return (
        <div className="p-8 space-y-8 bg-zinc-950 min-h-screen text-zinc-100">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Gestión de Referidos</h1>
                    <p className="text-zinc-500 font-bold text-sm mt-2 uppercase tracking-widest">Panel de Control para Dispersión de Comisiones</p>
                </div>
                <div className="flex gap-4">
                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 min-w-[200px]">
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-[10px] font-black uppercase text-zinc-500">Pendientes de Pago</CardTitle>
                            <Clock className="h-3 w-3 text-amber-500" />
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                            <div className="text-2xl font-black">{pendingPayments}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 min-w-[200px]">
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-[10px] font-black uppercase text-zinc-500">Total Pagado</CardTitle>
                            <DollarSign className="h-3 w-3 text-emerald-500" />
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                            <div className="text-2xl font-black">${totalPayout.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <tr>
                            <th className="px-8 py-6">Referidor (Beneficiario)</th>
                            <th className="px-8 py-6">Referido (Cliente)</th>
                            <th className="px-8 py-6 text-center">Estado</th>
                            <th className="px-8 py-6 text-right">Monto / Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {referrals?.map((r: any) => (
                            <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-black text-base">{r.referrer?.full_name}</div>
                                            <div className="text-[10px] text-zinc-500 font-bold uppercase">{r.referrer?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="font-bold text-zinc-400">{r.referred?.full_name}</div>
                                    <div className="text-[10px] text-zinc-600 truncate max-w-[150px]">{r.referred?.email}</div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <StatusBadge status={r.status} />
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="font-black text-xl italic mb-1">${r.actual_reward?.toLocaleString() || '0'}</div>
                                    {r.status === 'COMPLETED' && (
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg h-8 px-4 text-[10px] uppercase">
                                            Confirmar Pago SPEI
                                        </Button>
                                    )}
                                    {r.transaction_id && (
                                        <Link href={`/admin/transactions/${r.transaction_id}`} className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center justify-end gap-1 mt-1">
                                            Ver Transacción <ExternalLink className="h-2 w-2" />
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {(!referrals || referrals.length === 0) && (
                            <tr>
                                <td colSpan={4} className="px-8 py-24 text-center">
                                    <p className="text-zinc-500 font-bold uppercase tracking-widest">No hay referidos registrados aún</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: any = {
        PENDING: { label: 'Pendiente Op.', class: 'bg-zinc-800 text-zinc-500 border-zinc-700', icon: Clock },
        COMPLETED: { label: 'Aprobado (Por Pagar)', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: AlertCircle },
        PAID: { label: 'Pagado', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 }
    };
    
    const config = configs[status] || configs.PENDING;
    const Icon = config.icon;
    
    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wide ${config.class}`}>
            <Icon className="h-3 w-3" />
            {config.label}
        </div>
    );
}
