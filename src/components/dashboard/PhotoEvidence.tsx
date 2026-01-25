"use client";

import { useState } from "react";
import { Camera, Upload, Info, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const PHOTO_CATEGORIES = [
    { id: "exterior", label: "Exterior", guide: "/guides/exterior.png", instruction: "Captura el auto desde los 4 ángulos principales." },
    { id: "motor", label: "Motor", guide: "/guides/engine.png", instruction: "Enfoque en fugas, batería y niveles de fluidos." },
    { id: "interior", label: "Interior", guide: "/guides/interior.png", instruction: "Tablero encendido, tapicería y controles." },
    { id: "tires", label: "Llantas", guide: "/guides/tires.png", instruction: "Muestra el dibujo de la llanta y estado del rin." },
    { id: "legals", label: "Legales", guide: "/guides/legals.png", instruction: "Foto clara del VIN y documentos de propiedad." }
];

interface PhotoEvidenceProps {
    photos: Record<string, string[]>;
    onPhotosChange: (photos: Record<string, string[]>) => void;
    carId?: string;
}

export function PhotoEvidence({ photos, onPhotosChange, carId }: PhotoEvidenceProps) {
    const [uploading, setUploading] = useState<string | null>(null);
    const supabase = createClient();

    const handleUpload = async (catId: string, file: File) => {
        try {
            setUploading(catId);
            const fileExt = file.name.split('.').pop();
            const fileName = `${carId || 'temp'}/${catId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('inspection-photos')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Supabase Storage Error:', uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('inspection-photos')
                .getPublicUrl(filePath);

            const newPhotos = {
                ...photos,
                [catId]: [...(photos[catId] || []), publicUrl]
            };

            onPhotosChange(newPhotos);
        } catch (error: any) {
            console.error('Error detail:', error);
            const errorMessage = error.message || 'Error desconocido';
            alert(`Error al subir la imagen: ${errorMessage}\n\nVerifica que el bucket "inspection-photos" exista y las llaves en .env.local sean correctas.`);
        } finally {
            setUploading(null);
        }
    };

    return (
        <div className="space-y-12">
            <header>
                <h3 className="text-2xl font-black tracking-tight">Evidencia Fotográfica</h3>
                <p className="text-muted-foreground text-sm font-medium">Sigue las guías visuales para garantizar un reporte profesional.</p>
            </header>

            <div className="grid gap-8">
                {PHOTO_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="bg-background rounded-[2.5rem] border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="grid md:grid-cols-2">
                            {/* Guide Section */}
                            <div className="p-8 bg-secondary/10 flex flex-col justify-center border-r">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Camera className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-lg font-bold">{cat.label}</h4>
                                </div>
                                <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-primary/20 bg-white group">
                                    <img src={cat.guide} alt={cat.label} className="w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Info className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <p className="mt-4 text-xs text-muted-foreground font-medium flex items-start gap-2">
                                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                                    {cat.instruction}
                                </p>
                            </div>

                            {/* Upload Section */}
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {photos[cat.id]?.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-300">
                                            <img src={url} alt={`Evidence ${idx}`} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => document.getElementById(`file-${cat.id}`)?.click()}
                                        disabled={uploading === cat.id}
                                        className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-2 hover:bg-secondary/50 transition-colors group disabled:opacity-50"
                                    >
                                        {uploading === cat.id ? (
                                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                        ) : (
                                            <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            {uploading === cat.id ? "Subiendo..." : "Subir Foto"}
                                        </span>
                                    </button>
                                    <input
                                        type="file"
                                        id={`file-${cat.id}`}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUpload(cat.id, file);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
