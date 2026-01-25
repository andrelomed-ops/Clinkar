"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/marketplace/image-upload";
import { Shield, ArrowRight, Loader2, Info } from "lucide-react";
import Link from "next/link";

export default function SellCarPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        price: "",
        vin: "",
        description: "",
    });
    const [images, setImages] = useState<string[]>([]);
    const supabase = createClient();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login?redirect=/dashboard/sell");
            return;
        }

        const { error } = await supabase
            .from("cars")
            .insert({
                seller_id: user.id,
                make: formData.make,
                model: formData.model,
                year: Number(formData.year),
                price: Number(formData.price),
                vin: formData.vin,
                description: formData.description,
                images: images,
                status: "published",
            });

        if (error) {
            alert("Error al publicar: " + error.message);
            setLoading(false);
        } else {
            router.push("/dashboard?message=Auto publicado correctamente");
        }
    };

    return (
        <div className="min-h-screen bg-secondary/30">
            <nav className="border-b bg-background px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowRight className="h-5 w-5 rotate-180" />
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="font-bold">Clinkar Sell</span>
                    </Link>
                </div>
            </nav>

            <main className="p-6 md:p-12 max-w-4xl mx-auto">
                <div className="space-y-8">
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight">Publica tu Auto</h1>
                        <p className="text-muted-foreground mt-2">Vende con seguridad garantizada por nuestra Bóveda Digital.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Asset-Light Strategy Tip */}
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex gap-4 items-start text-primary">
                            <Info className="h-5 w-5 mt-1 shrink-0" />
                            <div className="text-sm">
                                <p className="font-bold">Estrategia Asset-Light</p>
                                <p className="opacity-80">Clinkar no retiene tu auto. Tú lo mantienes hasta que el comprador libere los fondos mediante QR.</p>
                            </div>
                        </div>

                        <section className="bg-background rounded-3xl p-8 shadow-sm border border-border space-y-6">
                            <h2 className="text-lg font-bold">Detalles del Vehículo</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Marca</label>
                                    <input
                                        required
                                        className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Ej. Tesla, BMW, Toyota"
                                        value={formData.make}
                                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Modelo</label>
                                    <input
                                        required
                                        className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Ej. Model 3, X5, Corolla"
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Año</label>
                                    <input
                                        required
                                        type="number"
                                        className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Precio (MXN)</label>
                                    <input
                                        required
                                        type="number"
                                        className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="35000"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Número de Serie (VIN)</label>
                                <input
                                    required
                                    className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="17 dígitos"
                                    value={formData.vin}
                                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descripción</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="flex w-full rounded-xl border border-input bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Cuenta la historia de tu auto..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </section>

                        <section className="bg-background rounded-3xl p-8 shadow-sm border border-border space-y-6">
                            <h2 className="text-lg font-bold">Fotos</h2>
                            <ImageUpload onUpload={(urls) => setImages([...images, ...urls])} />
                            <p className="text-xs text-muted-foreground">Sube al menos 4 fotos (frente, trasera, laterales e interior).</p>
                        </section>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-bold transition-all hover:bg-primary/90 flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        Publicar listado
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                            <Link
                                href="/dashboard"
                                className="h-14 px-8 rounded-2xl border border-border bg-background flex items-center justify-center font-semibold text-muted-foreground hover:bg-secondary"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
