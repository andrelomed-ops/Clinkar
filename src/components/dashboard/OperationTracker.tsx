
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrackerStep {
    id: string;
    label: string;
    status: 'COMPLETED' | 'CURRENT' | 'PENDING';
    timestamp?: string;
    note?: string;
}

interface OperationTrackerProps {
    title: string;
    steps: TrackerStep[];
    className?: string;
}

export function OperationTracker({ title, steps, className }: OperationTrackerProps) {
    return (
        <div className={cn("bg-slate-50/50 rounded-xl p-4 border border-slate-100", className)}>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                {title}
            </h4>
            <div className="relative pl-2 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-slate-200 before:content-['']">
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    return (
                        <div key={step.id} className="relative pl-8">
                            {/* Icon / Dot logic */}
                            <div className={cn(
                                "absolute left-0 top-1 h-6 w-6 rounded-full border-2 flex items-center justify-center bg-white z-10",
                                step.status === 'COMPLETED' ? "border-green-500 text-green-500" :
                                    step.status === 'CURRENT' ? "border-blue-500 text-blue-500" :
                                        "border-slate-300 text-slate-300"
                            )}>
                                {step.status === 'COMPLETED' ? <CheckCircle2 className="h-3 w-3" /> :
                                    step.status === 'CURRENT' ? <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" /> :
                                        <Circle className="h-3 w-3" />}
                            </div>

                            {/* Content */}
                            <div className={cn("transition-opacity", step.status === 'PENDING' && "opacity-50")}>
                                <p className={cn(
                                    "text-sm font-bold leading-none mb-1",
                                    step.status === 'CURRENT' ? "text-blue-700" : "text-slate-700"
                                )}>
                                    {step.label}
                                </p>
                                {step.note && (
                                    <p className="text-xs text-slate-500 mb-1 leading-relaxed">
                                        {step.note}
                                    </p>
                                )}
                                {step.timestamp && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                        <Clock className="h-3 w-3" /> {step.timestamp}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
