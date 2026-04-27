"use client";

import { useState, useMemo } from "react";
import { Ban, Loader2, Upload, X, Check, Save, Zap, Settings, ShieldCheck, Camera as CameraIcon, Layers, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/marketplace/image-upload";
import { POPULAR_BRANDS, MODEL_SUGGESTIONS } from "@/lib/car-data";
import { getAutomatedSpecsAction } from "@/app/actions/cars";
import { toast } from "sonner";

interface CarFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isLoading: boolean;
    mode: "create" | "edit";
}

export function CarFormModal({ isOpen, onClose, onSubmit, initialData, isLoading, mode }: CarFormModalProps) {
    const [activeTab, setActiveTab] = useState<"general" | "specs" | "features" | "gallery">("general");
    const [previewMode, setPreviewMode] = useState(false);
    
    const defaultData = {
        make: "",
        model: "",
        year: 2024,
        price: 0,
        minimum_price: 0,
        mileage: 0,
        location: "CDMX",
        description: "Unidad certificada por StarterKar.",
        status: "published",
        category: "Car",
        images: [],
        technical_specs: {
            performance: { engine: "", horsepower: "", fuelType: "Gasoline", transmission: "Automatic", driveTrain: "FWD", cylinders: 4, consumption: "" },
            architecture: { bodyType: "SUV", doors: 5, passengers: 5, dimensions: "", tankCapacity: "", rims: "" },
            features: { ac: true, sunroof: false, leatherSeats: false, touchScreen: true, carPlay: true, androidAuto: true, bluetooth: true, startStopButton: true },
            security: { airbags: 6, abs: true, discBrakes: 4, reverseCamera: true, parkingSensors: true }
        }
    };

    const parsedInitialData = initialData ? {
        ...initialData,
        minimum_price: initialData.minimum_price || initialData.market_data?.minimum_price || initialData.price
    } : null;

    const [formData, setFormData] = useState(parsedInitialData || defaultData);

    const [magicLoading, setMagicLoading] = useState(false);
    const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
    const [showModelSuggestions, setShowModelSuggestions] = useState(false);

    const handleMagicFill = async () => {
        if (!formData.make || !formData.model) {
            toast.error("Ingresa Marca y Modelo primero");
            return;
        }

        setMagicLoading(true);
        try {
            const result = await getAutomatedSpecsAction(formData.make, formData.model);
            if (result.success && result.specs) {
                setFormData(prev => ({
                    ...prev,
                    technical_specs: result.specs
                }));
                toast.success("¡Ficha técnica auto-completada!", {
                    description: `Se cargaron especificaciones para ${formData.make} ${formData.model}`,
                    icon: <Zap className="h-4 w-4 text-amber-500" />
                });
            } else {
                toast.error("Datos no encontrados", {
                    description: "No tenemos especificaciones exactas para este modelo."
                });
            }
        } catch (err) {
            toast.error("Error al buscar datos");
        } finally {
            setMagicLoading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        console.log("[CarFormModal] handleSubmit called. PreviewMode:", previewMode);
        toast.info("Procesando vista previa...");
        
        if (!previewMode && mode === "create") {
            // Validation
            if (!formData.make || !formData.model || formData.price <= 0 || !formData.location) {
                toast.error("Campos incompletos", {
                    description: "Por favor completa la Marca, Modelo, Precio (>0) y Ubicación."
                });
                return;
            }
            setPreviewMode(true);
            return;
        }

        const finalData = {
            ...formData,
            technical_specs: formData.technical_specs,
            market_data: {
                ...(initialData?.market_data || {}),
                technical_specs: formData.technical_specs
            }
        };

        try {
            await onSubmit(finalData);
            
            if (mode === "create") {
                toast.success("¡Unidad publicada con éxito!", {
                    description: `${formData.make} ${formData.model} ya está disponible.`,
                    icon: <Check className="h-4 w-4 text-emerald-500" />
                });
                // Continuous workflow: reset and keep open
                setFormData(defaultData);
                setPreviewMode(false);
                setActiveTab("general");
            } else {
                toast.success("Actualizado con éxito");
                onClose();
            }
        } catch (err) {
            toast.error("Error al procesar la unidad");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 shadow-[0_0_100px_rgba(99,102,241,0.1)]">
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center border-b border-zinc-800 bg-zinc-900/50">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                            {previewMode ? "Confirmar Publicación" : mode === "create" ? "Publicar Nueva Unidad" : "Editar Expediente de Unidad"}
                        </h3>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                            {previewMode ? "Vista previa del anuncio en marketplace" : mode === "create" ? "Configuración de inventario maestro" : `Editando: ${formData.make} ${formData.model}`}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        {previewMode && (
                            <button 
                                onClick={() => setPreviewMode(false)}
                                className="h-12 px-6 bg-zinc-800 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-zinc-700 transition-all border border-zinc-700"
                            >
                                ← Volver a Editar
                            </button>
                        )}
                        <button onClick={onClose} className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:rotate-90">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs - Hidden in Preview */}
                {!previewMode && (
                    <div className="flex px-8 pt-4 gap-2 bg-zinc-950/30 border-b border-zinc-800/50">
                        <TabButton active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={<Zap className="h-4 w-4" />} label="General" />
                        <TabButton active={activeTab === "specs"} onClick={() => setActiveTab("specs")} icon={<Settings className="h-4 w-4" />} label="Ficha Técnica" />
                        <TabButton active={activeTab === "features"} onClick={() => setActiveTab("features")} icon={<ShieldCheck className="h-4 w-4" />} label="Equipamiento" />
                        <TabButton active={activeTab === "gallery"} onClick={() => setActiveTab("gallery")} icon={<CameraIcon className="h-4 w-4" />} label="Galería" />
                    </div>
                )}

                {/* Form Content */}
                <form id="car-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {previewMode ? (
                        <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300 pb-10">
                            {/* Listing Preview Card */}
                            <div className="bg-zinc-950 border-2 border-indigo-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                                <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                                    {formData.images.length > 0 ? (
                                        <img src={formData.images[0]} alt="Hero" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800">
                                            <CameraIcon className="h-20 w-20 mb-4" />
                                            <p className="text-xs font-black uppercase tracking-[0.3em]">Sin imágenes</p>
                                        </div>
                                    )}
                                    <div className="absolute top-6 left-6 px-4 py-2 bg-indigo-600/80 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white animate-pulse">
                                        Modo Vista Previa
                                    </div>
                                </div>
                                <div className="p-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white">{(formData.make || "Sin Marca")} {(formData.model || "Sin Modelo")}</h4>
                                            <p className="text-zinc-500 font-black uppercase text-xs tracking-widest mt-1 italic">
                                                {formData.year} • {(Number(formData.mileage) || 0).toLocaleString()} KM • {formData.location || "N/A"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-indigo-400 italic tracking-tighter">${(Number(formData.price) || 0).toLocaleString()}</p>
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Precio Final Clinkar</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <PreviewInfo icon={Zap} label="Motor" value={formData.technical_specs?.performance?.engine || "N/A"} />
                                        <PreviewInfo icon={Settings} label="Transmisión" value={formData.technical_specs?.performance?.transmission || "N/A"} />
                                        <PreviewInfo icon={ShieldCheck} label="Seguridad" value={`${formData.technical_specs?.security?.airbags || 0} Airbags`} />
                                    </div>
                                    <div className="p-8 bg-zinc-900/50 rounded-3xl border border-zinc-800 text-zinc-300 text-sm italic leading-relaxed">
                                        "{formData.description || "Sin descripción proporcionada."}"
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-indigo-600/5 border border-indigo-500/20 rounded-[3rem] text-center">
                                <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.2em] mb-4 italic">¿Todo listo para publicar?</p>
                                <p className="text-zinc-500 text-[10px] font-medium leading-loose mb-8">Al confirmar, la unidad se indexará inmediatamente en el marketplace<br/>y se activará el sistema de transacciones P2P.</p>
                                <Button type="submit" disabled={isLoading} className="w-full h-20 bg-indigo-600 hover:bg-indigo-500 text-2xl font-black italic tracking-tighter rounded-3xl shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all">
                                    {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : "PUBLICAR UNIDAD AHORA"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeTab === "general" && (
                        <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <FormGroup label="Marca">
                                <div className="relative">
                                    <input 
                                        value={formData.make} 
                                        placeholder="Ej. BMW" 
                                        className="form-input pr-10" 
                                        onFocus={() => setShowBrandSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
                                        onChange={e => setFormData({...formData, make: e.target.value})} 
                                    />
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                    
                                    {showBrandSuggestions && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                                            {POPULAR_BRANDS.filter(b => b.toLowerCase().includes(formData.make.toLowerCase())).map(b => (
                                                <button
                                                    key={b}
                                                    type="button"
                                                    className="w-full px-6 py-4 text-left text-sm hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-none flex items-center justify-between group"
                                                    onClick={() => {
                                                        setFormData({...formData, make: b});
                                                        setShowBrandSuggestions(false);
                                                    }}
                                                >
                                                    <span className="font-bold">{b}</span>
                                                    <Search className="h-3 w-3 text-zinc-700 group-hover:text-indigo-500 transition-colors" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </FormGroup>
                            <FormGroup label="Modelo">
                                <div className="relative group">
                                    <input 
                                        value={formData.model} 
                                        placeholder="Ej. M3" 
                                        className="form-input pr-32" 
                                        onFocus={() => setShowModelSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowModelSuggestions(false), 200)}
                                        onChange={e => setFormData({...formData, model: e.target.value})} 
                                    />
                                    
                                    {showModelSuggestions && formData.make && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                                            {(MODEL_SUGGESTIONS[formData.make] || []).filter(m => m.toLowerCase().includes(formData.model.toLowerCase())).map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    className="w-full px-6 py-4 text-left text-sm hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-none flex items-center justify-between group"
                                                    onClick={() => {
                                                        setFormData({...formData, model: m});
                                                        setShowModelSuggestions(false);
                                                    }}
                                                >
                                                    <span className="font-bold">{m}</span>
                                                    <Zap className="h-3 w-3 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                                                </button>
                                            ))}
                                            {(!MODEL_SUGGESTIONS[formData.make] || MODEL_SUGGESTIONS[formData.make].length === 0) && (
                                                <div className="px-6 py-4 text-[10px] font-black uppercase text-zinc-600 tracking-widest text-center italic">
                                                    Ingresa modelo manualmente
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {formData.make && formData.model && (
                                        <button 
                                            type="button"
                                            onClick={handleMagicFill}
                                            disabled={magicLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            {magicLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                                            Magia IA
                                        </button>
                                    )}
                                </div>
                            </FormGroup>
                            <FormGroup label="Año">
                                <input type="number" value={formData.year} className="form-input" onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
                            </FormGroup>
                            <FormGroup label="Precio de Venta Público (MXN)">
                                <input type="number" value={formData.price} className="form-input" onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                            </FormGroup>
                            <FormGroup label="Piso de Venta (Mínimo Aceptable MXN)">
                                <div className="relative">
                                    <input type="number" value={formData.minimum_price || formData.price} className="form-input text-red-500 font-bold pr-10" onChange={e => setFormData({...formData, minimum_price: parseFloat(e.target.value)})} />
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                                </div>
                            </FormGroup>
                            <FormGroup label={
                                formData.category === 'Marine' || formData.category === 'Air' || formData.category === 'Heavy' 
                                ? "Horas de Uso" 
                                : "Kilometraje"
                            }>
                                <input type="number" value={formData.mileage} className="form-input" onChange={e => setFormData({...formData, mileage: parseInt(e.target.value)})} />
                            </FormGroup>
                            <FormGroup label="Categoría">
                                <select value={formData.category} className="form-input" onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="Car">Automóvil</option>
                                    <option value="Motorcycle">Motocicleta</option>
                                    <option value="Marine">Marítimo (Yates/Lanchas)</option>
                                    <option value="Air">Aéreo (Aviones/Helicópteros)</option>
                                    <option value="Heavy">Maquinaria Pesada</option>
                                </select>
                            </FormGroup>
                            <FormGroup label="Ubicación">
                                <input value={formData.location} className="form-input" onChange={e => setFormData({...formData, location: e.target.value})} />
                            </FormGroup>
                            <div className="col-span-2">
                                <FormGroup label="Descripción / Notas">
                                    <textarea className="form-input h-24 resize-none p-4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </FormGroup>
                            </div>
                            <FormGroup label="Estatus">
                                <select value={formData.status} className="form-input" onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="published">PUBLICADO</option>
                                    <option value="draft">BORRADOR</option>
                                    <option value="archived">ARCHIVADO</option>
                                </select>
                            </FormGroup>
                        </div>
                    )}

                    {activeTab === "specs" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Dynamic Specs based on Category */}
                            <div>
                                <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Layers className="h-3 w-3" /> {formData.category === 'Air' || formData.category === 'Marine' ? 'Planta de Poder y Estado' : 'Motor y Desempeño'}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormGroup label={formData.category === 'Air' ? "Motores / Turbinas" : "Motor"}>
                                        <input value={formData.technical_specs.performance.engine} placeholder={formData.category === 'Air' ? "Ej. Pratt & Whitney" : "Ej. 2.5L Turbo"} className="form-input" onChange={e => setFormData({...formData, technical_specs: {...formData.technical_specs, performance: {...formData.technical_specs.performance, engine: e.target.value}}})} />
                                    </FormGroup>
                                    {formData.category === 'Air' ? (
                                        <FormGroup label="Ciclos / TBO">
                                            <input value={formData.technical_specs.performance.horsepower} placeholder="Ej. 1500h remanentes" className="form-input" onChange={e => setFormData({...formData, technical_specs: {...formData.technical_specs, performance: {...formData.technical_specs.performance, horsepower: e.target.value}}})} />
                                        </FormGroup>
                                    ) : (
                                        <FormGroup label="Potencia (HP)">
                                            <input value={formData.technical_specs.performance.horsepower} placeholder="Ej. 227 hp" className="form-input" onChange={e => setFormData({...formData, technical_specs: {...formData.technical_specs, performance: {...formData.technical_specs.performance, horsepower: e.target.value}}})} />
                                        </FormGroup>
                                    )}
                                    <FormGroup label="Combustible">
                                        <select value={formData.technical_specs.performance.fuelType} className="form-input" onChange={e => setFormData({...formData, technical_specs: {...formData.technical_specs, performance: {...formData.technical_specs.performance, fuelType: e.target.value}}})}>
                                            <option value="Gasoline">Gasolina</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Hybrid">Híbrido</option>
                                            <option value="Electric">Eléctrico</option>
                                            <option value="AvGas">AvGas (Aviación)</option>
                                            <option value="JetA">Jet A-1</option>
                                        </select>
                                    </FormGroup>
                                    <FormGroup label={formData.category === 'Marine' || formData.category === 'Air' ? 'Propulsión' : 'Transmisión'}>
                                        <select value={formData.technical_specs.performance.transmission} className="form-input" onChange={e => setFormData({...formData, technical_specs: {...formData.technical_specs, performance: {...formData.technical_specs.performance, transmission: e.target.value}}})}>
                                            <option value="Automatic">Automática / Hidrostática</option>
                                            <option value="Manual">Manual</option>
                                            <option value="Inboard">Intraborda (Marino)</option>
                                            <option value="Outboard">Fueraborda (Marino)</option>
                                            <option value="Direct">Direct Drive</option>
                                        </select>
                                    </FormGroup>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Layers className="h-3 w-3" /> {formData.category === 'Marine' ? 'Arquitectura Naval' : formData.category === 'Air' ? 'Fuselaje y Capacidad' : 'Arquitectura y Dimensiones'}
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <FormGroup label={formData.category === 'Marine' ? "Tipo de Casco" : formData.category === 'Air' ? "Modelo Fuselaje" : "Carrocería"}>
                                        <input value={formData.technical_specs.architecture.bodyType} placeholder="Ej. Monocasco / SUV" className="form-input" onChange={e => setFormData({...formData, technical_specs: {...formData.technical_specs, architecture: {...formData.technical_specs.architecture, bodyType: e.target.value}}})} />
                                    </FormGroup>
                                    <FormGroup label={formData.category === 'Marine' ? "Eslora (Pies)" : formData.category === 'Air' ? "Carga Útil" : "Puertas"}>
                                        <input value={formData.technical_specs.architecture.doors} placeholder="Ej. 40ft" className="form-input" onChange={e => setFormData({...formData, technical_specs: {...formData.technical_specs, architecture: {...formData.technical_specs.architecture, doors: e.target.value as any}}})} />
                                    </FormGroup>
                                    <FormGroup label="Pasajeros">
                                        <input type="number" value={formData.technical_specs.architecture.passengers} className="form-input" onChange={e => setFormData({...formData, technical_specs: {...formData.technical_specs, architecture: {...formData.technical_specs.architecture, passengers: parseInt(e.target.value)}}})} />
                                    </FormGroup>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "features" && (
                        <div className="grid grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="space-y-4">
                                <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Confort y Tecnología</h4>
                                <ToggleGroup label="Aire Acondicionado" checked={formData.technical_specs.features.ac} onChange={v => setFormData({...formData, technical_specs: {...formData.technical_specs, features: {...formData.technical_specs.features, ac: v}}})} />
                                <ToggleGroup label="Apple CarPlay" checked={formData.technical_specs.features.carPlay} onChange={v => setFormData({...formData, technical_specs: {...formData.technical_specs, features: {...formData.technical_specs.features, carPlay: v}}})} />
                                <ToggleGroup label="Android Auto" checked={formData.technical_specs.features.androidAuto} onChange={v => setFormData({...formData, technical_specs: {...formData.technical_specs, features: {...formData.technical_specs.features, androidAuto: v}}})} />
                                <ToggleGroup label="Pantalla Táctil" checked={formData.technical_specs.features.touchScreen} onChange={v => setFormData({...formData, technical_specs: {...formData.technical_specs, features: {...formData.technical_specs.features, touchScreen: v}}})} />
                                <ToggleGroup label="Techo Panorámico" checked={formData.technical_specs.features.sunroof} onChange={v => setFormData({...formData, technical_specs: {...formData.technical_specs, features: {...formData.technical_specs.features, sunroof: v}}})} />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Seguridad</h4>
                                <FormGroup label="Bolsas de Aire (Total)">
                                    <input type="number" value={formData.technical_specs.security.airbags} className="form-input" onChange={e => setFormData({...formData, technical_specs: {...formData.technical_specs, security: {...formData.technical_specs.security, airbags: parseInt(e.target.value)}}})} />
                                </FormGroup>
                                <ToggleGroup label="Frenos ABS" checked={formData.technical_specs.security.abs} onChange={v => setFormData({...formData, technical_specs: {...formData.technical_specs, security: {...formData.technical_specs.security, abs: v}}})} />
                                <ToggleGroup label="Cámara de Reversa" checked={formData.technical_specs.security.reverseCamera} onChange={v => setFormData({...formData, technical_specs: {...formData.technical_specs, security: {...formData.technical_specs.security, reverseCamera: v}}})} />
                                <ToggleGroup label="Sensores de Proximidad" checked={formData.technical_specs.security.parkingSensors} onChange={v => setFormData({...formData, technical_specs: {...formData.technical_specs, security: {...formData.technical_specs.security, parkingSensors: v}}})} />
                            </div>
                        </div>
                    )}

                    {activeTab === "gallery" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Upload Button as first item */}
                                <div className="aspect-video">
                                    <ImageUpload onUpload={(urls) => setFormData({...formData, images: [...formData.images, ...urls]})} />
                                </div>

                                {/* Uploaded Images */}
                                {formData.images.map((url, i) => (
                                    <div key={i} className={cn(
                                        "relative aspect-video rounded-2xl overflow-hidden border-2 transition-all group",
                                        i === 0 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-zinc-800"
                                    )}>
                                        <img src={url} alt="Uploaded" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})}
                                                className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {i === 0 && (
                                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-indigo-600 text-[8px] font-black uppercase tracking-widest text-white rounded-md shadow-lg">
                                                Principal
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {formData.images.length === 0 && (
                                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-900/30">
                                    <CameraIcon className="h-12 w-12 text-zinc-700 mb-4" />
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Sin imágenes cargadas</p>
                                </div>
                            )}
                        </div>
                    )}
                    </>
                )}
                </form>

                {/* Footer - Hidden in Preview */}
                {!previewMode && (
                    <div className="p-8 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex justify-between items-center">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
                                <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Autoguardado Activo</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={onClose} className="px-8 py-4 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                                Cancelar
                            </button>
                            <Button 
                                type="button" 
                                onClick={() => handleSubmit()}
                                disabled={isLoading} 
                                className="h-16 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center gap-3"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                <span className="text-sm font-black uppercase italic tracking-tighter">
                                    {mode === "create" ? "Continuar a Vista Previa" : "Guardar Cambios"}
                                </span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .form-input {
                    width: 100%;
                    height: 3.5rem;
                    background-color: #09090b;
                    border: 1px solid #27272a;
                    border-radius: 1rem;
                    padding-left: 1.5rem;
                    padding-right: 1.5rem;
                    color: white;
                    outline: none;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }
                .form-input:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
                }
            `}</style>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-t-2xl font-black text-[10px] uppercase tracking-widest transition-all border-t-2 border-x-2",
                active 
                    ? "bg-zinc-900 border-zinc-800 text-indigo-400" 
                    : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
            {children}
        </div>
    );
}

function ToggleGroup({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn(
                    "h-6 w-12 rounded-full p-1 transition-all flex items-center",
                    checked ? "bg-indigo-600 justify-end" : "bg-zinc-800 justify-start"
                )}
            >
                <div className="h-4 w-4 bg-white rounded-full shadow-sm" />
            </button>
        </div>
    );
}

function PreviewInfo({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <Icon className="h-3 w-3 text-indigo-500" />
                <p className="text-xs font-bold text-white uppercase">{value}</p>
            </div>
        </div>
    );
}
