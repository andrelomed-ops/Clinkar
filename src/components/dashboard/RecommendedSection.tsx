"use client";

import { useState, useEffect } from "react";
import { ALL_CARS } from "@/data/cars";
import { CarCard } from "@/components/market/CarCard";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function RecommendedSection() {
    const [recommendedCars, setRecommendedCars] = useState<typeof ALL_CARS>([]);

    useEffect(() => {
        // Simulated AI Recommendation Logic: Get 3 interesting cars
        const shuffled = [...ALL_CARS]
            .filter(c => c.status === 'CERTIFIED' && c.category === 'Car')
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        setRecommendedCars(shuffled);
    }, []);

    if (recommendedCars.length === 0) return null;

    return (
        <section className="mt-16 animate-reveal stagger-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">Sugerencias IA para ti</h2>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Basado en tendencias de mercado</p>
                    </div>
                </div>
                <Button variant="ghost" asChild className="text-indigo-600 hover:text-indigo-700 font-bold">
                    <Link href="/buy" className="flex items-center gap-2">
                        Ver todo el inventario <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {recommendedCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                ))}
            </div>
        </section>
    );
}
