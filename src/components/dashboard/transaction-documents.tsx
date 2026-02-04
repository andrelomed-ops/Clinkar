"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { FileText, Upload, Check, Loader2, Link as LinkIcon } from "lucide-react";

interface DocUploadProps {
    transactionId: string;
}

export function TransactionDocuments({ transactionId }: DocUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [docs, setDocs] = useState<any[]>([]);
    const supabase = createBrowserClient();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);

        const file = e.target.files[0];
        // eslint-disable-next-line react-hooks/purity
        const path = `docs/${transactionId}/${name}-${Date.now()}`;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error: storageError } = await supabase.storage
            .from('documents')
            .upload(path, file);

        if (storageError) {
            alert("Error storage: " + storageError.message);
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);

        const { error: dbError } = await supabase
            .from("documents")
            .insert({
                transaction_id: transactionId,
                uploader_id: user.id,
                name: name,
                file_url: publicUrl
            });

        if (dbError) {
            alert("Error DB: " + dbError.message);
        } else {
            setDocs([...docs, { name, file_url: publicUrl }]);
        }
        setUploading(false);
    };

    const documentTypes = [
        { id: "title", label: "Título de Propiedad" },
        { id: "registration", label: "Tarjeta de Circulación" },
        { id: "id_proof", label: "Identificación Oficial" },
    ];

    return (
        <div className="bg-background rounded-3xl p-8 border border-border shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Trámites Digitales
            </h3>

            <div className="grid gap-4">
                {documentTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-semibold">{type.label}</span>
                        </div>

                        <label className="cursor-pointer">
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleUpload(e, type.label)}
                                disabled={uploading}
                            />
                            <div className="h-10 px-4 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 transition-all">
                                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : (
                                    <>
                                        <Upload className="h-3 w-3" />
                                        Subir
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                ))}
            </div>

            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold text-center">
                Los documentos son privados y solo visibles para las partes involucradas.
            </p>
        </div>
    );
}
