"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { 
    Plus, 
    Warehouse, 
    MapPin, 
    Phone, 
    Trash2, 
    CheckCircle2, 
    XCircle,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Partner {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    is_active: boolean;
    specialties: string[];
}

export default function AdminPartnersPage() {
    const supabase = createBrowserClient();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");
    const [specialties, setSpecialties] = useState<string[]>(["Car"]);

    const AVAILABLE_SPECIALTIES = [
        { id: "Car", label: "Automóviles" },
        { id: "Motorcycle", label: "Motocicletas" },
        { id: "Marine", label: "Marítimo" },
        { id: "Air", label: "Aéreo" },
        { id: "Heavy", label: "Maquinaria Pesada" }
    ];

    const fetchPartners = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setPartners(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchPartners(), 0);
        return () => clearTimeout(timer);
    }, []);

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('partners').insert({
            name,
            address,
            city,
            phone,
            is_active: true,
            specialties
        });

        if (error) {
            alert("Error al añadir taller: " + error.message);
        } else {
            setName("");
            setAddress("");
            setCity("");
            setPhone("");
            setShowAddForm(false);
            fetchPartners();
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('partners')
            .update({ is_active: !currentStatus })
            .eq('id', id);
        
        if (!error) fetchPartners();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                        Gestión de <span className="text-red-500">Talleres Aliados</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm mt-1">
                        Carga y administra las direcciones físicas para inspección técnica.
                    </p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
                >
                    <Plus className="h-5 w-5" />
                    {showAddForm ? "Cancelar" : "Nuevo Taller"}
                </button>
            </div>

            {showAddForm && (
                <form 
                    onSubmit={handleAddPartner} 
                    className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-300"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nombre Comercial</label>
                            <input 
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ej: Mecánica Tek Satélite"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:border-red-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Ciudad / Zona</label>
                            <input 
                                required
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                placeholder="Ej: Naucalpan, Edo. Mex"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:border-red-500 transition-colors"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Dirección Completa</label>
                            <input 
                                required
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Calle, Número, Colonia, CP..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:border-red-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Teléfono de Contacto</label>
                            <input 
                                required
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="55 2212 0249"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 focus:outline-none focus:border-red-500 transition-colors"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Especialidades Técnicas</label>
                            <div className="flex flex-wrap gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                                {AVAILABLE_SPECIALTIES.map(spec => (
                                    <button
                                        key={spec.id}
                                        type="button"
                                        onClick={() => {
                                            if (specialties.includes(spec.id)) {
                                                setSpecialties(specialties.filter(s => s !== spec.id));
                                            } else {
                                                setSpecialties([...specialties, spec.id]);
                                            }
                                        }}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                                            specialties.includes(spec.id)
                                                ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20"
                                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        {spec.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-white text-black px-10 py-4 rounded-2xl font-black hover:bg-zinc-200 transition-all uppercase tracking-widest">
                            Guardar Taller
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Sincronizando Base de Datos...</p>
                </div>
            ) : partners.length === 0 ? (
                <div className="border-4 border-dashed border-zinc-800 rounded-[3rem] py-32 text-center">
                    <Warehouse className="h-16 w-16 text-zinc-800 mx-auto mb-6" />
                    <p className="text-zinc-500 font-bold text-xl tracking-tight">No hay talleres registrados aún.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    {partners.map(partner => (
                        <div 
                            key={partner.id} 
                            className={cn(
                                "bg-zinc-900 border rounded-3xl p-6 transition-all hover:scale-[1.02]",
                                partner.is_active ? "border-zinc-800" : "border-red-900/30 opacity-60"
                            )}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-400">
                                    <Warehouse className="h-6 w-6" />
                                </div>
                                <button 
                                    onClick={() => toggleStatus(partner.id, partner.is_active)}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                                        partner.is_active 
                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                            : "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}
                                >
                                    {partner.is_active ? "Activo" : "Inactivo"}
                                </button>
                            </div>
                            
                            <h3 className="text-xl font-black text-white leading-tight mb-4">{partner.name}</h3>
                            
                            <div className="space-y-3 text-sm font-medium text-zinc-400">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-1 shrink-0 text-zinc-600" />
                                    <p>{partner.address}, {partner.city}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 shrink-0 text-zinc-600" />
                                    <p>{partner.phone}</p>
                                </div>
                                <div className="pt-4 flex flex-wrap gap-2">
                                    {partner.specialties?.map(spec => (
                                        <span key={spec} className="px-2 py-1 bg-zinc-800 rounded-md text-[8px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-700">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
                                <button className="text-zinc-600 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
