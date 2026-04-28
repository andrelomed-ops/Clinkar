"use client";

import Link from "next/link";
import { Vehicle } from "@/data/cars";
import { MapPin, Gauge, Fuel, Heart, TrendingDown, BadgeCheck, Zap } from "lucide-react";
import { StarterKarSeal } from "./StarterKarSeal";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CarCardProps {
    car: Vehicle;
    isFavorite?: boolean;
    onToggleFavorite?: (e: React.MouseEvent) => void;
}

export function CarCard({ car, isFavorite = false, onToggleFavorite }: CarCardProps) {
    const priceDiff = (car.marketValue && car.price) ? car.marketValue - car.price : 0;
    const savingsPercent = (car.marketValue && car.price) ? (priceDiff / car.marketValue) * 100 : 0;
    const carMake = car.make || 'Auto';
    const carModel = car.model || '';
    const carYear = car.year || '';
    const carLocation = car.location || 'México';
    const carFuel = car.fuel || (car as any).fuel_type || 'Gasolina';
    const carDistance = car.distance ?? (car as any).mileage ?? 0;
    const carCondition = car.condition || 'Seminuevo';
    const carImages = Array.isArray(car.images) ? car.images : [];

    const getPriceLabel = () => {
        if (savingsPercent > 10) return { label: "Gran Oferta", color: "bg-emerald-500", icon: <TrendingDown className="h-3 w-3" /> };
        if (savingsPercent > 5) return { label: "Buen Precio", color: "bg-blue-500", icon: <BadgeCheck className="h-3 w-3" /> };
        if (savingsPercent > 0) return { label: "Precio Justo", color: "bg-zinc-600", icon: <Zap className="h-3 w-3" /> };
        return null;
    };

    const priceLabel = getPriceLabel();

    return (
        <Link href={`/buy/${car.id}`} className="group block h-full relative animate-reveal stagger-1">
            <div className="h-full glass-card border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col">
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {carImages[0] ? (
                        <Image
                            src={carImages[0]}
                            alt={`${carMake} ${carModel}`}
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={false}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            Sin Imagen
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[calc(100%-60px)] z-20">
                        {(car.status === 'CERTIFIED' || car.has_starterkar_seal) && (
                            <StarterKarSeal variant="compact" />
                        )}
                        {car.flashSale && (
                            <div className="px-2.5 py-1 bg-amber-400 dark:bg-amber-500 text-black text-[10px] font-extrabold rounded-lg uppercase tracking-wide whitespace-nowrap shadow-sm shadow-amber-400/20 animate-pulse">
                                Flash
                            </div>
                        )}
                        {car.isBorder && (
                            <div className="px-2.5 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm whitespace-nowrap">
                                🌎 Fronterizo
                            </div>
                        )}
                        {car.investorOnly && (
                            <div className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm whitespace-nowrap">
                                💎 Inversionista
                            </div>
                        )}
                        {(car as any).isNew && (
                            <div className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm whitespace-nowrap">
                                <Zap className="h-3 w-3 fill-current" /> Nuevo
                            </div>
                        )}
                        {priceLabel && (
                            <div className={cn("px-2.5 py-1 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm whitespace-nowrap", priceLabel.color)}>
                                {priceLabel.icon}
                                {priceLabel.label}
                            </div>
                        )}
                        {savingsPercent > 15 && (
                            <div className="px-2.5 py-1 bg-zinc-800 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm whitespace-nowrap">
                                <TrendingDown className="h-3 w-3" />
                                Oportunidad
                            </div>
                        )}
                        {car.interestedPeople && car.interestedPeople > 0 && (
                            <div className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm shadow-rose-500/30 whitespace-nowrap animate-pulse">
                                🔥 {car.interestedPeople} {car.interestedPeople === 1 ? 'interesado' : 'interesados'}
                            </div>
                        )}
                    </div>

                    {/* Favorite Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onToggleFavorite?.(e);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors z-20 group/heart"
                    >
                        <Heart
                            className={cn(
                                "h-5 w-5 transition-all duration-300",
                                isFavorite
                                    ? "fill-red-500 text-red-500 scale-110 animate-pulse"
                                    : "text-white group-hover/heart:scale-110"
                            )}
                        />
                    </button>

                    {/* LOCK OVERLAY */}
                    {car.isCurrentlyLocked && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 text-center">
                            <div className="h-12 w-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/20 mb-3">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </div>
                            <h4 className="text-white font-black text-lg mb-1 leading-tight">En Proceso de Compra</h4>
                            <p className="text-zinc-200 text-xs font-semibold max-w-[200px] mb-3">
                                Otro usuario está apartando este auto.
                            </p>
                            <div className="px-3 py-1.5 bg-black/50 border border-white/20 rounded-lg text-amber-400 text-sm font-bold animate-pulse">
                                Espera 15 min...
                            </div>
                            <p className="text-zinc-300 text-[10px] mt-2">
                                Si no concreta el pago, se liberará.
                            </p>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {carMake} {carModel}
                            </h3>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                            {carYear} • {carCondition}
                        </p>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <Gauge className="h-3.5 w-3.5 text-zinc-400" />
                            {carDistance ? carDistance.toLocaleString() : '0'} km
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <Fuel className="h-3.5 w-3.5 text-zinc-400" />
                            {carFuel}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 col-span-2">
                            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                            {carLocation}
                        </div>
                    </div>

                    {/* Price Footer */}
                    <div className="mt-auto flex items-end justify-between">
                        <div>
                            {car.marketValue && (
                                <p className="text-xs text-zinc-400 line-through mb-0.5">
                                    ${car.marketValue.toLocaleString()}
                                </p>
                            )}
                            <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                ${car.price ? car.price.toLocaleString() : '0'}
                            </p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-300 group-hover:scale-110 group-hover:-rotate-45">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
