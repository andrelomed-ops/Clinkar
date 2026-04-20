"use client";

import { useState } from "react";
import { Car, DollarSign, Phone, MessageSquare, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demandService, SellerLead } from "@/services/DemandService";
import { Database } from "@/lib/database.types";
import Link from "next/link";

const POPULAR_BRANDS = [
    "Toyota", "Honda", "Nissan", "Volkswagen", "Ford", "Chevrolet", 
    "Hyundai", "Kia", "BMW", "Mercedes-Benz", "Audi", "Mazda", "Jeep", "Tesla"
];

const CONDITIONS = [
    { value: 'excellent', label: 'Excelente', desc: 'Como nuevo, sin detalles' },
    { value: 'good', label: 'Bueno', desc: ' Algunas marcas menores' },
    { value: 'fair', label: 'Regular', desc: 'Detalles visibles' },
    { value: 'needs_work', label: 'Necesita trabajo', desc: 'Requiere reparaciones' }
];

export default function SellerLeadPage() {
    const [step, setStep] = useState<'form' | 'success' | 'matched'>('form');
    const [loading, setLoading] = useState(false);
    const [matched, setMatched] = useState<any>(null);
    const [formData, setFormData] = useState({
        currentBrand: '',
        currentModel: '',
        currentYear: '',
        currentPriceExpected: '',
        condition: 'good',
        lookingFor: '',
        contactPreference: 'whatsapp'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const leadData: Database['public']['Tables']['seller_leads']['Insert'] = {
                current_brand: formData.currentBrand,
                current_model: formData.currentModel,
                current_year: parseInt(formData.currentYear),
                current_price_expected: formData.currentPriceExpected ? parseFloat(formData.currentPriceExpected) : null,
                condition: formData.condition as any,
                looking_for: formData.lookingFor || null,
                contact_preference: formData.contactPreference as any,
                status: 'new'
            };

            const result = await demandService.createSellerLead(leadData);
            
            if (result.match) {
                setMatched(result.match);
                setStep('matched');
            } else {
                setStep('success');
            }
        } catch (error) {
            console.error('Error creating seller lead:', error);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">¡Auto Registrado!</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            Te contactaremos cuando encontremos un comprador interesado en tu {formData.currentBrand} {formData.currentModel}.
                        </p>
                        <div className="space-y-3">
                            <Button asChild className="w-full">
                                <Link href="/dashboard">Ver Mi Dashboard</Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/">Volver al Inicio</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === 'matched') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Car className="h-10 w-10 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">¡Tenemos Comprador!</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                            ¡Perfecto! Hay alguien buscando exactamente tu {matched.brand} {matched.model}.
                        </p>
                        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl mb-6 text-left">
                            <p className="text-sm text-zinc-500 mb-2">Buscan:</p>
                            <p className="font-bold">{matched.brand} {matched.model || ''}</p>
                            <p className="text-sm text-zinc-500">Presupuesto: hasta ${Number(matched.budget_max).toLocaleString()}</p>
                        </div>
                        <Button className="w-full h-12 text-lg font-bold">
                            Contactar Comprador <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4">
                        <Car className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-black mb-2">Tengo Auto, Busco Comprador</h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                        ¿Tienes un auto que quieres vender? Dános los detalles y te conectamos 
                        con compradores que ya están buscando ese modelo.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            ¿Qué auto tienes?
                        </CardTitle>
                        <CardDescription>
                            Cuanto más detallado, mejor podremos ayudarte
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="text-base font-bold">Marca *</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                    {POPULAR_BRANDS.slice(0, 8).map(brand => (
                                        <Button
                                            key={brand}
                                            type="button"
                                            variant={formData.currentBrand === brand ? "default" : "outline"}
                                            size="sm"
                                            className={formData.currentBrand === brand ? "bg-emerald-600" : ""}
                                            onClick={() => setFormData({ ...formData, currentBrand: brand })}
                                        >
                                            {brand}
                                        </Button>
                                    ))}
                                </div>
                                <Input
                                    placeholder="Otra marca..."
                                    className="mt-2"
                                    value={formData.currentBrand}
                                    onChange={(e) => setFormData({ ...formData, currentBrand: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Modelo *</Label>
                                    <Input
                                        placeholder="Ej: Civic, Corolla, Jetta"
                                        value={formData.currentModel}
                                        onChange={(e) => setFormData({ ...formData, currentModel: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Año *</Label>
                                    <Input
                                        type="number"
                                        placeholder="2020"
                                        value={formData.currentYear}
                                        onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Estado del auto</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                    {CONDITIONS.map(cond => (
                                        <button
                                            key={cond.value}
                                            type="button"
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                                                formData.condition === cond.value 
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                                    : 'border-zinc-200 dark:border-zinc-700'
                                            }`}
                                            onClick={() => setFormData({ ...formData, condition: cond.value })}
                                        >
                                            <p className="font-bold text-sm">{cond.label}</p>
                                            <p className="text-xs text-zinc-500">{cond.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>¿Qué precio esperas? ($)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <Input
                                        type="number"
                                        placeholder="250000"
                                        className="pl-10"
                                        value={formData.currentPriceExpected}
                                        onChange={(e) => setFormData({ ...formData, currentPriceExpected: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>¿Qué buscas tú? (opcional)</Label>
                                <Input
                                    placeholder="Ej: quiero un SUV más grande, necesito efectivo..."
                                    value={formData.lookingFor}
                                    onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>¿Cómo prefieres que te contactemos?</Label>
                                <div className="flex gap-3 mt-2">
                                    {[
                                        { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                                        { value: 'phone', label: 'Teléfono', icon: '📞' },
                                        { value: 'email', label: 'Email', icon: '✉️' }
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                                                formData.contactPreference === option.value
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                    : 'border-zinc-200 dark:border-zinc-700'
                                            }`}
                                            onClick={() => setFormData({ ...formData, contactPreference: option.value })}
                                        >
                                            <span>{option.icon}</span>
                                            <span className="font-bold text-sm">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700"
                                disabled={!formData.currentBrand || !formData.currentModel || !formData.currentYear || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        Buscando Comprador...
                                    </>
                                ) : (
                                    "Buscar Comprador"
                                )}
                            </Button>

                            <p className="text-center text-xs text-zinc-500">
                                Al registrar tu auto, aceptas que te contactemos cuando haya interés
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}