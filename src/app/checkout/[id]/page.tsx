// app/checkout/[id]/page.tsx
'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ALL_CARS } from '@/data/cars';
import { notFound } from 'next/navigation';
import SmartPaymentSelector from '@/components/checkout/SmartPaymentSelector';
import { createBrowserClient } from '@/lib/supabase/client';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    const car = ALL_CARS.find((c) => c.id === id);

    useEffect(() => {
        const supabase = createBrowserClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    if (!car) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="relative h-48 bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={car.images[0]}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                        <Link href={`/buy/${car.id}`} className="bg-white/90 p-2 rounded-full text-sm font-medium hover:bg-white transition">
                            ← Cancelar
                        </Link>
                    </div>
                </div>

                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{car.make} {car.model} {car.year}</h1>
                    <p className="text-gray-500 mb-6 font-medium">Garantizado por Bóveda Digital Clinkar</p>

                    <SmartPaymentSelector
                        amount={car.price}
                        carId={car.id}
                        carTitle={`${car.make} ${car.model} ${car.year}`}
                        imageUrl={car.images[0]}
                        onPaymentSuccess={() => {
                            router.push('/dashboard?payment=success');
                        }}
                    />

                    {!user && (
                        <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-800 text-center">
                            Nota: Debes iniciar sesión para completar la compra.
                            <Link href="/login" className="font-bold underline ml-1">Entrar ahora</Link>
                        </div>
                    )}

                    <p className="mt-6 text-xs text-center text-gray-400">
                        Pagos encriptados y seguros. No almacenamos tus datos bancarios.
                    </p>
                </div>
            </div>
        </div>
    );
}
