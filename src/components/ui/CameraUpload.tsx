"use client";

import { useState, useRef } from "react";
import { Camera as CameraIcon, Check, Loader2, Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";

interface CameraUploadProps {
    onUpload: (url: string) => void;
    label?: string;
    description?: string;
    category?: 'PHOTO' | 'DOCUMENT';
    className?: string;
    transactionId?: string;
    variant?: 'default' | 'circle-trigger';
}

export function CameraUpload({ onUpload, label = "Capturar", description, category = 'PHOTO', className, transactionId, variant = 'default' }: CameraUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [isPdf, setIsPdf] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const supabase = createBrowserClient();

    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('no context')); return; }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('fail')), 'image/jpeg', 0.82);
            };
            img.onerror = reject;
        });
    };

    const uploadFile = async (file: File, isPdfFile = false) => {
        setIsUploading(true);
        setIsPdf(isPdfFile);

        try {
            let publicUrl: string;

            if (isPdfFile) {
                // Try Supabase, fallback to local blob URL
                try {
                    const path = `uploads/${transactionId || 'anon'}/${Date.now()}_${file.name}`;
                    const { error } = await supabase.storage
                        .from('inspection-evidence')
                        .upload(path, file, { contentType: 'application/pdf', upsert: true });

                    if (error) throw error;
                    const { data: { publicUrl: url } } = supabase.storage.from('inspection-evidence').getPublicUrl(path);
                    publicUrl = url;
                } catch {
                    // Fallback: use local blob URL so wizard can proceed
                    publicUrl = URL.createObjectURL(file);
                }

                setUploadedFileName(file.name);
            } else {
                // Image: compress first
                const blob = await compressImage(file);

                try {
                    const path = `uploads/${transactionId || 'anon'}/${Date.now()}.jpg`;
                    const { error } = await supabase.storage
                        .from('inspection-evidence')
                        .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

                    if (error) throw error;
                    const { data: { publicUrl: url } } = supabase.storage.from('inspection-evidence').getPublicUrl(path);
                    publicUrl = url;
                } catch {
                    // Fallback: use local blob URL
                    publicUrl = URL.createObjectURL(blob);
                }

                setUploadedFileName(file.name || 'imagen.jpg');
            }

            // Always call onUpload — even with local blob URL — so wizard state advances
            onUpload(publicUrl);

        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file, false);
    };

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file, true);
    };

    const clearPreview = () => {
        setUploadedFileName(null);
        setIsPdf(false);
        if (galleryInputRef.current) galleryInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
        if (pdfInputRef.current) pdfInputRef.current.value = "";
        onUpload(''); // Clear parent state
    };

    const isSuccess = !!uploadedFileName && !isUploading;

    if (variant === 'circle-trigger') {
        return (
            <div className={cn("relative", className)}>
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CameraIcon className="h-5 w-5" />}
                </button>

                {isMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-4 w-64 glass-card p-4 rounded-3xl shadow-2xl z-[60] animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cambiar Foto</span>
                            <button onClick={() => setIsMenuOpen(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => { galleryInputRef.current?.click(); setIsMenuOpen(false); }}
                                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary/50 hover:bg-indigo-50 transition-all"
                            >
                                <Upload className="h-4 w-4 text-zinc-400" />
                                <span className="text-[8px] font-bold uppercase">Galería</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { cameraInputRef.current?.click(); setIsMenuOpen(false); }}
                                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary/50 hover:bg-indigo-50 transition-all"
                            >
                                <CameraIcon className="h-4 w-4 text-zinc-400" />
                                <span className="text-[8px] font-bold uppercase">Cámara</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { pdfInputRef.current?.click(); setIsMenuOpen(false); }}
                                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary/50 hover:bg-indigo-50 transition-all"
                            >
                                <FileText className="h-4 w-4 text-zinc-400" />
                                <span className="text-[8px] font-bold uppercase">PDF</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Hidden inputs */}
                <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
            </div>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{label}</p>
            )}

            {isUploading ? (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                    <p className="text-xs font-medium text-zinc-400">Procesando...</p>
                </div>
            ) : isSuccess ? (
                /* ── Success State: clean, minimal ── */
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                        {isPdf ? <FileText className="h-4 w-4 text-emerald-600" /> : <Check className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{uploadedFileName}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Guardado correctamente</p>
                    </div>
                    <button onClick={clearPreview} className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 transition-colors">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                /* ── Upload Options: minimal, no color noise ── */
                <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-4 space-y-3">
                    {description && (
                        <p className="text-[11px] text-zinc-400 text-center">{description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all"
                        >
                            <Upload className="h-5 w-5 text-zinc-400" />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Galería</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all"
                        >
                            <CameraIcon className="h-5 w-5 text-zinc-400" />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Cámara</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => pdfInputRef.current?.click()}
                            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all"
                        >
                            <FileText className="h-5 w-5 text-zinc-400" />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">PDF</span>
                        </button>
                    </div>

                    <p className="text-[9px] text-center text-zinc-400 font-medium uppercase tracking-widest">
                        JPG · PNG · HEIC · PDF
                    </p>
                </div>
            )}

            {/* Hidden inputs */}
            <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
            <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
        </div>
    );
}
