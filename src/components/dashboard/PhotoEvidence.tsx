"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Info, CheckCircle2, Loader2, X, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";
import { validateImageQuality } from "@/lib/ai-brain";
import { motion, AnimatePresence } from "framer-motion";

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
    const [aiFeedback, setAiFeedback] = useState<Record<string, { feedback: string; severity: string; score: number }>>({});
    const [activeCamera, setActiveCamera] = useState<string | null>(null);
    const [isCameraStarting, setIsCameraStarting] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const supabase = createBrowserClient();

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startCamera = async () => {
        try {
            setIsCameraStarting(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("No se pudo acceder a la cámara. Por favor verifica los permisos o usa el modo de subida de archivos.");
            setActiveCamera(null);
        } finally {
            setIsCameraStarting(false);
        }
    };

    useEffect(() => {
        if (activeCamera) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [activeCamera]);

    const handleUpload = async (catId: string, file: File, forceUpload = false) => {
        try {
            setUploading(catId);
            const tempUrl = URL.createObjectURL(file);

            const result = await validateImageQuality(tempUrl, catId);
            setAiFeedback(prev => ({
                ...prev,
                [catId]: {
                    feedback: result.feedback,
                    severity: result.severity || 'OK',
                    score: result.score
                }
            }));

            if (result.severity === 'ERROR' && !forceUpload) {
                alert(result.feedback);
                setUploading(null);
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${carId || 'temp'}/${catId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('inspection-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('inspection-photos')
                .getPublicUrl(filePath);

            const newPhotos = {
                ...photos,
                [catId]: [...(photos[catId] || []), publicUrl]
            };
            onPhotosChange(newPhotos);
            setActiveCamera(null);
        } catch (error: any) {
            console.error('Error detail:', error);
            alert(`Error al subir imagen: ${error.message}`);
        } finally {
            setUploading(null);
        }
    };

    const takePhoto = async () => {
        if (!videoRef.current || !activeCamera) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `photo-${activeCamera}.jpg`, { type: 'image/jpeg' });
                handleUpload(activeCamera, file, false);
            }
        }, 'image/jpeg', 0.85);
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

                                <AnimatePresence>
                                    {aiFeedback[cat.id] && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className={cn(
                                                "mt-4 p-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-between gap-2",
                                                aiFeedback[cat.id].severity === 'OK' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                    aiFeedback[cat.id].severity === 'WARNING' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                                        "bg-red-500/10 text-red-500 border border-red-500/20"
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                {aiFeedback[cat.id].severity === 'OK' ? <ShieldCheck className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                                                {aiFeedback[cat.id].feedback}
                                            </span>
                                            {aiFeedback[cat.id].severity === 'WARNING' && (
                                                <button
                                                    onClick={() => setAiFeedback(prev => ({
                                                        ...prev,
                                                        [cat.id]: { ...prev[cat.id], severity: 'OK', feedback: '✅ Omitido por el mecánico' }
                                                    }))}
                                                    className="underline hover:opacity-80"
                                                >
                                                    Omitir
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {photos[cat.id]?.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-300">
                                            <img src={url} alt={`Evidence ${idx}`} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                                                <CheckCircle2 className="h-3 w-3" />
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setActiveCamera(cat.id)}
                                        disabled={uploading === cat.id}
                                        className="aspect-square rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all group disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                    >
                                        <Camera className="h-6 w-6" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Captura IA</span>
                                    </button>

                                    <button
                                        onClick={() => document.getElementById(`file-${cat.id}`)?.click()}
                                        disabled={uploading === cat.id}
                                        className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-2 hover:bg-secondary/50 transition-colors text-muted-foreground group"
                                    >
                                        <Upload className="h-5 w-5" />
                                        <span className="text-[9px] font-bold uppercase tracking-tight">Galería</span>
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

            <AnimatePresence>
                {activeCamera && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 md:p-10"
                    >
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                <span className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                    Cámara de Inspección: {PHOTO_CATEGORIES.find(c => c.id === activeCamera)?.label}
                                </span>
                            </div>
                            <button
                                onClick={() => setActiveCamera(null)}
                                className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 hover:bg-red-500 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="relative w-full max-w-2xl aspect-[3/4] md:aspect-video rounded-[2.5rem] overflow-hidden bg-zinc-900 border-4 border-white/20 shadow-2xl">
                            {isCameraStarting ? (
                                <div className="absolute inset-0 flex items-center justify-center gap-3 text-white">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                    <span className="font-bold">Iniciando Sensor...</span>
                                </div>
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] contrast-125"
                                    />
                                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-full h-full border-2 border-dashed border-white/40 rounded-xl relative"
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                                <img
                                                    src={PHOTO_CATEGORIES.find(c => c.id === activeCamera)?.guide}
                                                    className="max-h-[60%] filter invert brightness-200"
                                                    alt="Overlay Guide"
                                                />
                                            </div>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg">
                                                <p className="text-[10px] text-white font-bold uppercase tracking-tight text-center">
                                                    Encuadra el {PHOTO_CATEGORIES.find(c => c.id === activeCamera)?.label} aquí
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-10 flex flex-col items-center gap-6 z-20">
                            <button
                                onClick={takePhoto}
                                disabled={uploading !== null || isCameraStarting}
                                className="h-20 w-20 rounded-full border-[6px] border-white flex items-center justify-center group active:scale-90 transition-all disabled:opacity-50"
                            >
                                <div className="h-14 w-14 rounded-full bg-white group-hover:scale-95 transition-transform flex items-center justify-center">
                                    {uploading ? <Loader2 className="h-8 w-8 text-black animate-spin" /> : <Zap className="h-8 w-8 text-black" />}
                                </div>
                            </button>
                            <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-[0.2em]">Pulsar para Capturar e Inspeccionar</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
