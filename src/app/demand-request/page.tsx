"use client";

import { useState } from "react";
import { Search, Car, DollarSign, MapPin, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demandService, DemandRequest } from "@/services/DemandService";

const POPULAR_BRANDS = [
    "Toyota", "Honda", "Nissan", "Volkswagen", "Ford", "Chevrolet", 
    "Hyundai", "Kia", "BMW", "Mercedes-Benz", "Audi", "Mazda", "Jeep", "Tesla"
];

export default function DemandRequestPage() {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        yearMin: '',
        yearMax: '',
        budgetMin: '',
        budgetMax: '',
        location: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const demandData: Omit<DemandRequest, 'id' | 'created_at' | 'updated_at'> = {
                brand: formData.brand,
                model: formData.model || undefined,
                year_min: formData.yearMin ? parseInt(formData.yearMin) : undefined,
                year_max: formData.yearMax ? parseInt(formData.yearMax) : undefined,
                budget_min: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
                budget_max: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
                location: formData.location || undefined,
                notes: formData.notes || undefined,
                status: 'pending'
            };

            await demandService.createDemandRequest(demandData);
            setStep('success');
        } catch (error) {
            console.error('Error creating demand:', error);
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
                        <h2 className="text-2xl font-black mb-2">¡Petición Creada!</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            Te notificaremos cuando encontremos un auto que coincida con tu búsqueda. 
                            También puedes revisar el inventario diariamente.
                        </p>
                        <div className="space-y-3">
                            <Button asChild className="w-full">
                                <a href="/buy">Ver Inventario</a>
                            </Button>
                            <Button variant="outline" asChild className="w-full">
                                <a href="/">Volver al Inicio</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
                        <Search className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-black mb-2">¿No encontraste lo que buscabas?</h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                        Crea una petición y te avisamos cuando un auto que buscas esté disponible. 
                        ¡Miles de vendedores y revendedores buscan clientes como tú!
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Detalles del Auto que Buscas
                        </CardTitle>
                        <CardDescription>
                            Cuanto más específico, mejor podrás encontrar lo que necesitas
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
                                            variant={formData.brand === brand ? "default" : "outline"}
                                            size="sm"
                                            className={formData.brand === brand ? "bg-indigo-600" : ""}
                                            onClick={() => setFormData({ ...formData, brand })}
                                        >
                                            {brand}
                                        </Button>
                                    ))}
                                </div>
                                <Input
                                    placeholder="Otra marca..."
                                    className="mt-2"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Modelo (opcional)</Label>
                                    <Input
                                        placeholder="Ej: Corolla, Civic, Jetta"
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Ubicación preferida</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            placeholder="Ciudad o Estado"
                                            className="pl-10"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Año mínimo</Label>
                                    <Input
                                        type="number"
                                        placeholder="2020"
                                        value={formData.yearMin}
                                        onChange={(e) => setFormData({ ...formData, yearMin: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Año máximo</Label>
                                    <Input
                                        type="number"
                                        placeholder="2024"
                                        value={formData.yearMax}
                                        onChange={(e) => setFormData({ ...formData, yearMax: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Presupuesto mínimo ($)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            type="number"
                                            placeholder="150000"
                                            className="pl-10"
                                            value={formData.budgetMin}
                                            onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Presupuesto máximo ($)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            type="number"
                                            placeholder="350000"
                                            className="pl-10"
                                            value={formData.budgetMax}
                                            onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>Notas adicionales</Label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <Textarea
                                        placeholder="Características específicas que buscas: color, equipamiento, kilómetros máximos..."
                                        className="pl-10 min-h-[100px]"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-bold"
                                disabled={!formData.brand || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        Creando Petición...
                                    </>
                                ) : (
                                    "Crear Petición"
                                )}
                            </Button>

                            <p className="text-center text-xs text-zinc-500">
                                Al crear una petición, aceptas recibir notificaciones cuando haya match con tu búsqueda
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}