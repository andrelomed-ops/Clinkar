"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps {
    value: number[]
    min?: number
    max?: number
    step?: number
    onValueChange?: (value: number[]) => void
    className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    ({ className, value, min = 0, max = 100, step = 1, onValueChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = [parseInt(e.target.value, 10)]
            onValueChange?.(newValue)
        }

        const percentage = ((value[0] - min) / (max - min)) * 100

        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex w-full touch-none select-none items-center",
                    className
                )}
                {...props}
            >
                <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="absolute h-full bg-indigo-600 transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value[0]}
                    onChange={handleChange}
                    className="absolute w-full h-2 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all active:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:animate-pulse"
                />
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
