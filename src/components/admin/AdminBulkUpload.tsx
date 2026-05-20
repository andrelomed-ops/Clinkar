
"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { createCarAction } from '@/app/actions/cars';
import { cn } from '@/lib/utils';

export function AdminBulkUpload({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState<'FILE' | 'MATCH' | 'FINISH'>('FILE');
    const [cars, setCars] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageMap, setImageMap] = useState<Record<string, File[]>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csv = event.target?.result as string;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            const parsedCars = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(',').map(v => v.trim());
                const car: any = {};
                headers.forEach((header, i) => {
                    car[header] = values[i];
                });
                return car;
            });

            if (parsedCars.length > 0) {
                setCars(parsedCars);
                setStep('MATCH');
                toast.success(`${parsedCars.length} vehículos cargados desde CSV`);
            }
        };
        reader.readAsText(file);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newMap = { ...imageMap };

        files.forEach(file => {
            // Logic: file name contains VIN or specific ID
            // Example: "VIN123_frontal.jpg" -> match with car having vin "VIN123"
            const matchingCar = cars.find(c => {
                const vin = (c.vin || '').toLowerCase();
                return vin && file.name.toLowerCase().includes(vin);
            });

            if (matchingCar) {
                if (!newMap[matchingCar.vin]) newMap[matchingCar.vin] = [];
                newMap[matchingCar.vin].push(file);
            }
        });

        setImageMap(newMap);
        toast.success(`${files.length} imágenes procesadas`);
    };

    const handleProcessAll = async () => {
        setLoading(true);
        let successCount = 0;

        for (const car of cars) {
            try {
                // In a real scenario, we'd upload images to Supabase Storage first
                // Here we'll simulate the creation
                const carData = {
                    make: car.make || 'Desconocido',
                    model: car.model || 'Modelo',
                    year: parseInt(car.year) || 2024,
                    price: parseFloat(car.price) || 0,
                    vin: car.vin || '',
                    mileage: parseInt(car.mileage) || 0,
                    location: car.location || 'CDMX',
                    status: 'published',
                    images: [] // Placeholder for real implementation
                };

                const res = await createCarAction(carData);
                if (res.success) successCount++;
            } catch (err) {
                console.error("Error creating car:", err);
            }
        }

        setLoading(false);
        setStep('FINISH');
        toast.success(`Proceso finalizado: ${successCount} vehículos creados`);
        onComplete();
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Carga Masiva de Lotes</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Sube archivos CSV y empareja imágenes por VIN.</p>
                </div>
                <div className="flex gap-2">
                    <div className={cn("h-2 w-8 rounded-full transition-all", step === 'FILE' ? "bg-indigo-600" : "bg-zinc-800")} />
                    <div className={cn("h-2 w-8 rounded-full transition-all", step === 'MATCH' ? "bg-indigo-600" : "bg-zinc-800")} />
                    <div className={cn("h-2 w-8 rounded-full transition-all", step === 'FINISH' ? "bg-indigo-600" : "bg-zinc-800")} />
                </div>
            </div>

            {step === 'FILE' && (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-zinc-800 rounded-[2.5rem] py-24 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                    <FileSpreadsheet className="h-16 w-16 text-zinc-800 group-hover:text-indigo-500 mb-6 transition-colors" />
                    <p className="text-sm font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Selecciona o arrastra tu archivo CSV</p>
                    <p className="text-[9px] font-bold text-zinc-700 mt-2">Columnas requeridas: make, model, year, price, vin, mileage</p>
                </div>
            )}

            {step === 'MATCH' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                        {cars.map((car, idx) => (
                            <div key={idx} className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-700 border border-zinc-800">
                                        <Camera className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase italic">{car.make} {car.model}</p>
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">VIN: {car.vin || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[8px] font-black uppercase px-2 py-1 rounded",
                                        imageMap[car.vin]?.length ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                    )}>
                                        {imageMap[car.vin]?.length || 0} FOTOS
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <label className="flex-1 h-14 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all">
                            <Upload className="h-4 w-4" />
                            Cargar Galería de Fotos
                            <input type="file" multiple onChange={handleImageUpload} accept="image/*" className="hidden" />
                        </label>
                        <button 
                            onClick={handleProcessAll}
                            disabled={loading}
                            className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Procesar Todo e Importar
                        </button>
                    </div>
                </div>
            )}

            {step === 'FINISH' && (
                <div className="text-center py-20 animate-in zoom-in-95">
                    <div className="h-24 w-24 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    </div>
                    <h4 className="text-3xl font-black italic tracking-tighter mb-4">¡Importación Exitosa!</h4>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-10 max-w-sm mx-auto">Tus vehículos han sido procesados y están listos en el inventario.</p>
                    <button 
                        onClick={() => { setStep('FILE'); onComplete(); }}
                        className="px-10 py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            )}
        </div>
    );
}
