"use client";

import { useState, useRef } from "react";
import { Camera, Check, Loader2, UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";

interface CameraUploadProps {
    onUpload: (url: string) => void;
    label?: string;
    description?: string;
    category?: 'PHOTO' | 'DOCUMENT';
    className?: string;
    transactionId?: string;
}

type UploadMode = 'gallery' | 'camera' | 'pdf';

export function CameraUpload({ onUpload, label = "Capturar", description, category = 'PHOTO', className, transactionId }: CameraUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [compressionRate, setCompressionRate] = useState<number | null>(null);
    const [isPdf, setIsPdf] = useState(false);

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
                const scaleSize = MAX_WIDTH / img.width;
                if (scaleSize < 1) {
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('Canvas context not available')); return; }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Compression failed'));
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (err) => reject(err);
        });
    };

    const uploadFile = async (file: File, isDocument = false) => {
        setIsUploading(true);
        setIsPdf(isDocument);
        setCompressionRate(null);

        try {
            let uploadBlob: Blob = file;
            let ext = 'jpg';
            let contentType = 'image/jpeg';

            if (isDocument) {
                // PDF: upload directly
                uploadBlob = file;
                ext = 'pdf';
                contentType = 'application/pdf';
                setPreview('pdf');
                setUploadedFileName(file.name);
            } else {
                // Image: compress
                const objectUrl = URL.createObjectURL(file);
                setPreview(objectUrl);
                uploadBlob = await compressImage(file);
                const reduction = Math.round((1 - (uploadBlob.size / file.size)) * 100);
                setCompressionRate(reduction > 0 ? reduction : 0);
            }

            if (uploadBlob.size > 15 * 1024 * 1024) {
                alert("El archivo es demasiado grande. Máximo 15MB.");
                setPreview(null);
                setIsUploading(false);
                return;
            }

            const fileName = label.replace(/\s+/g, '_').toLowerCase();
            const path = `uploads/${transactionId || 'anonymous'}/${Date.now()}_${fileName}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('inspection-evidence')
                .upload(path, uploadBlob, { contentType, upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('inspection-evidence')
                .getPublicUrl(path);

            onUpload(publicUrl);
        } catch {
            setPreview(null);
            setUploadedFileName(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file, false);
    };

    const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file, true);
    };

    const clearPreview = () => {
        setPreview(null);
        setUploadedFileName(null);
        setCompressionRate(null);
        setIsPdf(false);
        if (galleryInputRef.current) galleryInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
        if (pdfInputRef.current) pdfInputRef.current.value = "";
    };

    const isSuccess = preview && !isUploading;

    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <label className="text-sm font-bold text-foreground/80 block">{label}</label>
            )}

            {/* Preview / Success State */}
            {isSuccess ? (
                <div className="relative rounded-2xl border-2 border-emerald-500/40 bg-emerald-50 dark:bg-emerald-900/10 p-5 flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                        {isPdf ? (
                            <FileText className="h-6 w-6 text-emerald-600" />
                        ) : (
                            <Check className="h-6 w-6 text-emerald-600" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {isPdf ? "PDF Subido Correctamente" : "Imagen Capturada"}
                        </p>
                        {uploadedFileName && (
                            <p className="text-xs text-emerald-600/70 truncate">{uploadedFileName}</p>
                        )}
                        {compressionRate !== null && compressionRate > 0 && (
                            <p className="text-[10px] text-emerald-600 font-medium">Optimizado (-{compressionRate}%)</p>
                        )}
                    </div>
                    <button onClick={clearPreview} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : isUploading ? (
                <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 dark:bg-indigo-900/10 p-8 flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold text-indigo-600 animate-pulse">Subiendo archivo...</p>
                </div>
            ) : (
                /* Upload Options */
                <div className="space-y-2">
                    {/* Three action buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Galería / Archivo */}
                        <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group"
                        >
                            <UploadCloud className="h-6 w-6 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-[10px] font-bold text-zinc-500 group-hover:text-indigo-600 uppercase tracking-wide">Galería</span>
                        </button>

                        {/* Cámara */}
                        <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group"
                        >
                            <Camera className="h-6 w-6 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                            <span className="text-[10px] font-bold text-zinc-500 group-hover:text-emerald-600 uppercase tracking-wide">Cámara</span>
                        </button>

                        {/* PDF */}
                        <button
                            type="button"
                            onClick={() => pdfInputRef.current?.click()}
                            className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
                        >
                            <FileText className="h-6 w-6 text-zinc-400 group-hover:text-red-500 transition-colors" />
                            <span className="text-[10px] font-bold text-zinc-500 group-hover:text-red-600 uppercase tracking-wide">PDF</span>
                        </button>
                    </div>

                    {description && (
                        <p className="text-xs text-muted-foreground text-center">{description}</p>
                    )}

                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground text-center">
                        Soporta: JPG · PNG · HEIC · PDF
                    </p>
                </div>
            )}

            {/* Hidden Inputs */}
            <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
            />
            <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="hidden"
            />
        </div>
    );
}
