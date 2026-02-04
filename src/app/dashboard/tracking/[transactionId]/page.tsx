import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Truck, MapPin, Package, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogisticsService } from '@/services/LogisticsService';

export default async function TrackingPage({ params }: { params: Promise<{ transactionId: string }> }) {
    const { transactionId } = await params;
    const supabase = await createClient();

    // 1. Get Transaction & User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: transaction } = await supabase
        .from('transactions')
        .select(`
            *,
            car:cars(*),
            logistics_order:logistics_orders(*)
        `)
        .eq('id', transactionId)
        .single();

    if (!transaction) notFound();

    // Security Check
    if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
        notFound();
    }

    const order = (transaction as any).logistics_order;

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <Truck className="h-12 w-12 text-zinc-300 mb-4" />
                <h1 className="text-xl font-bold mb-2">No hay envío asociado</h1>
                <p className="text-zinc-500 mb-6">Esta transacción no incluye servicio de logística gestionado por Clinkar.</p>
                <Link href={`/dashboard/transaction/${transactionId}`} className="text-blue-600 font-bold hover:underline">
                    Volver a la Transacción
                </Link>
            </div>
        );
    }

    const steps = [
        { status: 'CREATED', label: 'Orden Recibida', icon: Package },
        { status: 'PICKUP_SCHEDULED', label: 'Recolección Programada', icon: MapPin },
        { status: 'IN_TRANSIT', label: 'En Tránsito', icon: Truck },
        { status: 'DELIVERED', label: 'Entregado', icon: CheckCircle2 }
    ];

    const currentStepIndex = steps.findIndex(s => s.status === order.status) || 0;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href={`/dashboard`} className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mb-4">
                        ← Volver al Dashboard
                    </Link>
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <Truck className="h-8 w-8 text-blue-600" />
                        Seguimiento de Envío
                    </h1>
                    <p className="text-zinc-500">
                        Orden #{order.id.slice(0, 8).toUpperCase()} • {(transaction as any).car.make} {(transaction as any).car.model}
                    </p>
                </div>

                {/* Status Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl mb-8">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">Estado Actual</div>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {steps[currentStepIndex]?.label || 'Procesando'}
                            </div>
                            {order.estimated_delivery_date && (
                                <div className="text-sm text-blue-600 font-medium mt-1">
                                    Llegada estimada: {new Date(order.estimated_delivery_date).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                        {order.tracking_number && (
                            <div className="text-right">
                                <div className="text-xs text-zinc-400 font-bold uppercase mb-1">Guía / Tracking</div>
                                <div className="font-mono text-lg font-medium">{order.tracking_number}</div>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800 -translate-y-1/2 rounded-full" />
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full transition-all duration-1000"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />

                        <div className="relative flex justify-between">
                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                const Icon = step.icon;

                                return (
                                    <div key={step.status} className="flex flex-col items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-4",
                                            isCompleted
                                                ? "bg-blue-600 border-white dark:border-zinc-900 text-white shadow-lg shadow-blue-600/30"
                                                : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-300"
                                        )}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold text-center max-w-[80px]",
                                            isCurrent ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                                        )}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-zinc-400" /> Origen
                        </h3>
                        <div className="space-y-4">
                            <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
                                <p className="text-sm font-bold opacity-50 uppercase mb-1">Punto de Recolección</p>
                                <p className="text-zinc-900 dark:text-white font-medium">{order.origin_address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-emerald-500" /> Destino
                        </h3>
                        <div className="space-y-4">
                            <div className="pl-4 border-l-2 border-emerald-500/30">
                                <p className="text-sm font-bold opacity-50 uppercase mb-1">Dirección de Entrega</p>
                                <p className="text-zinc-900 dark:text-white font-medium">{order.destination_address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
