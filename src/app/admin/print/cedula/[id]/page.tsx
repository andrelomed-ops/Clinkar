"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { CedulaCertezaPrint } from "@/components/admin/CedulaCertezaPrint";
import { Loader2 } from "lucide-react";

export default function PrintCedulaPage() {
    const { id } = useParams();
    const [car, setCar] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createBrowserClient();

    useEffect(() => {
        async function fetchCar() {
            if (id === 'template') {
                setCar({
                    make: "________________",
                    model: "________________",
                    year: 0,
                    location: "________________",
                    vin: "________________",
                    provenance: "",
                    fair_price_suggested: 0,
                    reconditioning_budget: 0,
                    reconditioning_notes: [],
                    mechanical_notes: "",
                    legal_notes: ""
                });
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('id', id)
                .single();
            
            if (data) {
                // Map database columns to the component props if necessary
                setCar({
                    ...data,
                    fair_price_suggested: data.fair_price_suggested || data.market_data?.fair_price_suggested,
                    reconditioning_budget: data.reconditioning_budget || data.market_data?.reconditioning_budget,
                    reconditioning_notes: data.reconditioning_notes || data.market_data?.reconditioning_notes || [],
                    mechanical_notes: data.mechanical_notes || data.market_data?.reality_notes,
                    legal_notes: data.legal_notes || data.market_data?.legal_notes || data.market_data?.legal_reality_notes,
                    provenance: data.provenance || data.market_data?.provenance
                });
            }
            setLoading(false);
        }
        fetchCar();
    }, [id, supabase]);

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Generando Cédula de Certeza...</p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white">
                <p className="text-xl font-black uppercase italic">Error: Vehículo no encontrado</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 py-12 px-4 print:p-0 print:bg-white">
            <div className="max-w-[210mm] mx-auto mb-8 flex justify-end gap-4 print:hidden">
                <button 
                    onClick={() => window.print()}
                    className="h-12 px-8 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                >
                    IMPRIMIR CÉDULA (PDF)
                </button>
                <button 
                    onClick={() => window.close()}
                    className="h-12 px-8 bg-zinc-800 text-zinc-400 text-xs font-black rounded-xl hover:bg-zinc-700 transition-all"
                >
                    CERRAR
                </button>
            </div>
            
            <CedulaCertezaPrint car={car} />
        </div>
    );
}
