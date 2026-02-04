
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, CreditCard, Banknote, QrCode, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { payForInspection } from '@/actions/payment-actions';

// Public key - in a real app this would be in env, but for dev defaults we can have a placeholder or expect env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm = ({ amount, totalWithCommission, commission, carId, onSuccess }: { amount: number, totalWithCommission: number, commission: number, carId: string, onSuccess: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await payForInspection(carId, 'card');

            if (result.success) {
                onSuccess();
            } else {
                setErrorMessage(result.error || "Error desconocido");
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl text-sm text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                <div className="space-y-1">
                    <p className="font-bold">Comisión Bancaria (Stripe)</p>
                    <p>El pago con tarjeta genera una comisión adicional del <span className="font-bold">3.6% + $3.00 MXN + IVA</span>.</p>
                    <div className="pt-2 mt-2 border-t border-amber-200/50 flex justify-between font-mono text-xs">
                        <span>Monto Original:</span>
                        <span>${amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-mono text-xs">
                        <span>Comisión Procesador:</span>
                        <span>+${commission.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl p-4">
                {/* Note: In a real integration with valid keys, <PaymentElement /> would identify itself here. 
                   For the demo without keys, we render a high-fidelity visual mock to ensure the UI looks perfect 
                   even if the dev environment lacks Stripe keys. */}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Titular de la tarjeta</label>
                        <input type="text" className="w-full bg-secondary rounded-lg px-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-primary transition-all" placeholder="Como aparece en la tarjeta" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Número de tarjeta</label>
                        <div className="relative">
                            <input type="text" className="w-full bg-secondary rounded-lg pl-12 pr-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-primary transition-all" placeholder="0000 0000 0000 0000" />
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Vencimiento</label>
                            <input type="text" className="w-full bg-secondary rounded-lg px-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-primary transition-all" placeholder="MM/AA" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">CVC</label>
                            <div className="relative">
                                <input type="text" className="w-full bg-secondary rounded-lg pl-10 pr-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-primary transition-all" placeholder="123" />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={!stripe || isLoading}
                className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Procesando Pago Seguro...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Pagar ${totalWithCommission.toLocaleString()} MXN
                    </span>
                )}
            </Button>

            <div className="flex justify-center items-center gap-2 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>Transacción encriptada de extremo a extremo. Tus fondos se guardan en la Bóveda Clinkar.</span>
            </div>
        </form>
    );
};

export const SmartPaymentSelector = ({ amount, carId, onPaymentSuccess }: { amount: number, carId: string, onPaymentSuccess: () => void }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei'>('spei');
    const [isProcessingSPEI, setIsProcessingSPEI] = useState(false);

    const stripeFeeBase = (amount * 0.036) + 3;
    const stripeFeeIva = stripeFeeBase * 0.16;
    const totalStripeFee = stripeFeeBase + stripeFeeIva;
    const totalWithStripe = amount + totalStripeFee;

    const handleSPEIPayment = async () => {
        setIsProcessingSPEI(true);
        try {
            const result = await payForInspection(carId, 'spei');
            if (result.success) {
                onPaymentSuccess();
            } else {
                alert(result.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessingSPEI(false);
        }
    };

    useEffect(() => {
        // Create PaymentIntent as soon as the component loads
        if (paymentMethod === 'card') {
            fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: totalWithStripe, carId }),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret));
        }
    }, [amount, carId, paymentMethod]);

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mb-2">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Asegura tu Transacción</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    El dinero se deposita en una <span className="font-bold text-foreground">Cuenta Concentradora Regulada (STP)</span>. Clinkar solo instruye la dispersión cuando TÚ autorizas la entrega.
                </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex p-1 bg-secondary rounded-xl mb-6">
                <button
                    onClick={() => setPaymentMethod('spei')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                        paymentMethod === 'spei'
                            ? "bg-white dark:bg-black text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        <span>SPEI / CoDi</span>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full">Sin Comisión</span>
                    </div>
                </button>

                <button
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                        paymentMethod === 'card'
                            ? "bg-white dark:bg-black text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <CreditCard className="h-4 w-4" /> Tarjeta (+Comisión)
                </button>
            </div>

            {paymentMethod === 'card' && clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <CheckoutForm
                        amount={amount}
                        totalWithCommission={totalWithStripe}
                        commission={totalStripeFee}
                        carId={carId}
                        onSuccess={onPaymentSuccess}
                    />
                </Elements>
            )}

            {paymentMethod === 'spei' && (
                <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl p-6 text-center space-y-4">
                    <div className="h-16 w-16 mx-auto bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                        <Banknote className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-2">Transferencia Bancaria (SPEI / CoDi)</h4>
                        <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-lg mb-4 text-left space-y-2 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Banco:</span>
                                <span>STP</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">CLABE:</span>
                                <span className="font-bold select-all">646180123456789012</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Concepto:</span>
                                <span className="font-bold select-all">COMPRA AUTO #{carId}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-dashed border-slate-200 dark:border-zinc-700">
                                <span className="text-muted-foreground">Monto Exacto:</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">${amount.toLocaleString()} MXN</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                            Al hacer la transferencia, nuestro sistema detectará el pago automáticamente y dispersará los fondos correspondientes al vendedor y las comisiones de servicio.
                        </p>
                        <Button onClick={handleSPEIPayment} disabled={isProcessingSPEI} className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700">
                            {isProcessingSPEI ? "Verificando recepción..." : "Ya realicé la transferencia"}
                        </Button>

                        <div className="mt-6 pt-6 border-t border-border">
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <QrCode className="h-12 w-12 border-2 border-slate-200 p-1 rounded-lg" />
                                <span className="text-xs max-w-[150px] text-left">
                                    Escanea este código CoDi desde tu app bancaria para pagar sin comisiones.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
