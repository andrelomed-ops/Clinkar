"use client";

import { useState } from "react";
import { LegalDocumentViewer } from "@/components/dashboard/LegalDocumentViewer";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { NotificationService } from "@/services/NotificationService";

interface Document {
    id: string;
    type: "Factura" | "Identificación" | "Contrato" | "Tenencia";
    status: "PENDING" | "APPROVED" | "REJECTED";
    url: string;
    updatedAt: string;
    userId?: string;
    carId?: string; // Enhanced to support admin context
}

export function AdminDocumentManager({ initialDocuments }: { initialDocuments: Document[] }) {
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const supabase = createBrowserClient();

    const handleAction = async (docId: string, action: "APPROVE" | "REJECT") => {
        setIsUpdating(docId);
        try {
            const doc = documents.find(d => d.id === docId);
            if (!doc || !doc.carId) {
                toast.error("Error: Car ID missing for document");
                return;
            }

            const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
            const updatedDocs = documents.map(d =>
                d.id === docId ? { ...d, status: newStatus as any, updatedAt: new Date().toISOString().split('T')[0] } : d
            );

            // 1. Fetch current car state to ensure we don't overwrite other changes
            const { data: car, error: fetchError } = await supabase
                .from("cars")
                .select("documents, status")
                .eq("id", doc.carId)
                .single();

            if (fetchError) throw fetchError;

            // 2. Prepare updated documents array for JUST this car
            // If we are in the admin hub, 'documents' state has docs from many cars.
            // We only want to update the docs associated with doc.carId.
            const carSpecificDocs = updatedDocs
                .filter(d => d.carId === doc.carId)
                .map(({ carId, carMake, carModel, carYear, userId, sellerId, ...rest }: any) => rest);

            // 3. Determine if car should be CERTIFIED
            // Logic: If all docs are approved AND it was in LEGAL_REVIEW
            const allApproved = carSpecificDocs.every((d: any) => d.status === 'APPROVED');
            let newCarStatus = car.status;
            if (allApproved && car.status === 'LEGAL_REVIEW') {
                newCarStatus = 'CERTIFIED';
            }

            // 4. Update Supabase
            const { error: updateError } = await supabase
                .from("cars")
                .update({
                    documents: carSpecificDocs,
                    status: newCarStatus
                })
                .eq("id", doc.carId);

            if (updateError) throw updateError;

            // Update local state
            setDocuments(updatedDocs);

            // 5. Send notification
            if (doc.userId) {
                await NotificationService.notify(supabase, {
                    userId: doc.userId,
                    title: action === 'APPROVE' ? "Documento Aprobado" : "Documento Rechazado",
                    message: action === 'APPROVE'
                        ? `Tu ${doc.type} ha sido validado correctamente.`
                        : `Tu ${doc.type} fue rechazado. Por favor, sube una imagen más clara.`,
                    type: action === 'APPROVE' ? "SUCCESS" : "WARNING",
                    link: action === 'APPROVE' && allApproved ? "/dashboard" : `/dashboard/sell/${doc.carId}`
                });
            }

            toast.success(allApproved && newCarStatus === 'CERTIFIED'
                ? "¡Vehículo Certificado Exitosamente!"
                : `Documento ${action === 'APPROVE' ? 'Aprobado' : 'Rechazado'}`
            );

        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar el documento");
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tight text-foreground">Gestión de Expedientes</h2>
                <div className="px-4 py-1 bg-yellow-400/10 text-yellow-600 border border-yellow-400/20 rounded-full text-xs font-bold uppercase">
                    {documents.filter(d => d.status === 'PENDING').length} Pendientes
                </div>
            </div>

            <LegalDocumentViewer
                documents={documents}
                onAction={handleAction}
            />
        </div>
    );
}
