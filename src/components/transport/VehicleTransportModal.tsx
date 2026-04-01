"use client";

import { useState, useEffect } from "react";
import { Truck, MapPin, Package, Clock, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClinkargoTransportService, type VehicleTransportQuote, type VehicleTransportType } from "@/services/ClinkargoTransportService";

interface VehicleTransportModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionId: string;
    vehicle: {
        brand: string;
        model: string;
        year: number;
        licensePlate?: string;
    };
    pickupAddress: string;
    dropoffAddress: string;
    pickupCoordinates?: { lat: number; lng: number };
    dropoffCoordinates?: { lat: number; lng: number };
    customerName?: string;
    customerPhone?: string;
    onTransportOrdered?: (orderId: string) => void;
}

export function VehicleTransportModal({
    isOpen,
    onClose,
    transactionId,
    vehicle,
    pickupAddress,
    dropoffAddress,
    pickupCoordinates,
    dropoffCoordinates,
    customerName,
    customerPhone,
    onTransportOrdered
}: VehicleTransportModalProps) {
    const [step, setStep] = useState<'quotes' | 'processing' | 'success' | 'error'>('quotes');
    const [quotes, setQuotes] = useState<VehicleTransportQuote[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleTransportType | null>(null);
    const [loadingQuotes, setLoadingQuotes] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && pickupCoordinates && dropoffCoordinates) {
            loadQuotes();
        }
    }, [isOpen, pickupCoordinates, dropoffCoordinates]);

    const loadQuotes = async () => {
        setLoadingQuotes(true);
        setError(null);
        try {
            const quotesData = await ClinkargoTransportService.getQuote(
                pickupCoordinates,
                dropoffCoordinates
            );
            setQuotes(quotesData);
        } catch (err: any) {
            setError(err.message || 'Error al cargar cotizaciones');
        } finally {
            setLoadingQuotes(false);
        }
    };

    const handleCreateOrder = async () => {
        if (!selectedVehicle) return;
        
        setCreatingOrder(true);
        setStep('processing');
        
        try {
            const result = await ClinkargoTransportService.createOrder({
                transactionId,
                pickupAddress,
                dropoffAddress,
                pickupCoordinates,
                dropoffCoordinates,
                vehicleType: selectedVehicle,
                vehicleToTransport: vehicle,
                customerPhone,
                customerName
            });

            if (result.success && result.orderId) {
                setOrderId(result.orderId);
                setStep('success');
                onTransportOrdered?.(result.orderId);
            } else {
                setError(result.error || 'Error al crear orden');
                setStep('error');
            }
        } catch (err: any) {
            setError(err.message || 'Error al crear orden de transporte');
            setStep('error');
        } finally {
            setCreatingOrder(false);
        }
    };

    const handleClose = () => {
        setStep('quotes');
        setQuotes([]);
        setSelectedVehicle(null);
        setOrderId(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-lg font-semibold">🚗 Transportar Vehículo</h2>
                    <button onClick={handleClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[70vh]">
                    {step === 'quotes' && (
                        <>
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <strong>{vehicle.year} {vehicle.brand} {vehicle.model}</strong>
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    {pickupAddress} → {dropoffAddress}
                                </p>
                            </div>

                            {loadingQuotes && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    <span className="ml-2 text-slate-600">Cargando cotizaciones...</span>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                    <Button variant="outline" size="sm" onClick={loadQuotes} className="mt-2">
                                        Reintentar
                                    </Button>
                                </div>
                            )}

                            {!loadingQuotes && !error && quotes.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    No hay cotizaciones disponibles
                                </div>
                            )}

                            {!loadingQuotes && !error && quotes.length > 0 && (
                                <div className="space-y-3">
                                    {quotes.map((quote) => (
                                        <button
                                            key={quote.vehicleType}
                                            onClick={() => setSelectedVehicle(quote.vehicleType)}
                                            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                                selectedVehicle === quote.vehicleType
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{quote.vehicleName}</p>
                                                    <p className="text-xs text-slate-500">
                                                        <Clock className="w-3 h-3 inline mr-1" />
                                                        {quote.estimatedTimeMinutes} min
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">${quote.price.toFixed(2)}</p>
                                                    <p className="text-xs text-slate-500">MXN</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-slate-500">
                                                Base: ${quote.breakdown.basePrice} + Distancia: ${quote.breakdown.distancePrice.toFixed(2)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                            <p className="text-lg font-medium">Creando orden de transporte...</p>
                            <p className="text-sm text-slate-500 mt-2">Esto puede tomar unos segundos</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                            <p className="text-lg font-medium">¡Orden creada!</p>
                            <p className="text-sm text-slate-500 mt-2">ID: {orderId}</p>
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg w-full">
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Un conductor será asignado pronto. Recibirás actualizaciones por webhook.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <X className="w-16 h-16 text-red-500 mb-4" />
                            <p className="text-lg font-medium">Error</p>
                            <p className="text-sm text-slate-500 mt-2">{error}</p>
                            <Button 
                                variant="outline" 
                                onClick={() => setStep('quotes')} 
                                className="mt-4"
                            >
                                Volver a cotizaciones
                            </Button>
                        </div>
                    )}
                </div>

                {step === 'quotes' && (
                    <div className="p-4 border-t dark:border-slate-700">
                        <Button 
                            className="w-full" 
                            onClick={handleCreateOrder}
                            disabled={!selectedVehicle || creatingOrder}
                        >
                            {creatingOrder ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Truck className="w-4 h-4 mr-2" />
                                    Solicitar Transporte
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {step === 'success' && (
                    <div className="p-4 border-t dark:border-slate-700">
                        <Button className="w-full" onClick={handleClose}>
                            Cerrar
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function RequestTransportButton({
    transactionId,
    vehicle,
    pickupAddress,
    dropoffAddress,
    pickupCoordinates,
    dropoffCoordinates,
    customerName,
    customerPhone
}: {
    transactionId: string;
    vehicle: { brand: string; model: string; year: number; licensePlate?: string };
    pickupAddress: string;
    dropoffAddress: string;
    pickupCoordinates?: { lat: number; lng: number };
    dropoffCoordinates?: { lat: number; lng: number };
    customerName?: string;
    customerPhone?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOrdered, setHasOrdered] = useState(false);

    return (
        <>
            <Button 
                variant={hasOrdered ? "outline" : "default"}
                onClick={() => setIsOpen(true)}
                className="w-full"
            >
                <Truck className="w-4 h-4 mr-2" />
                {hasOrdered ? 'Ver Transporte' : 'Solicitar Transporte'}
            </Button>

            <VehicleTransportModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                transactionId={transactionId}
                vehicle={vehicle}
                pickupAddress={pickupAddress}
                dropoffAddress={dropoffAddress}
                pickupCoordinates={pickupCoordinates}
                dropoffCoordinates={dropoffCoordinates}
                customerName={customerName}
                customerPhone={customerPhone}
                onTransportOrdered={(orderId) => {
                    setHasOrdered(true);
                    console.log('Transport ordered:', orderId);
                }}
            />
        </>
    );
}
