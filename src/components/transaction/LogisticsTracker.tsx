import { MapPin, Truck, Calendar, Phone } from "lucide-react";

interface LogisticsTrackerProps {
    origin: string;
    destination: string;
    status: 'pending' | 'in_transit' | 'delivered';
    eta: string;
}

export const LogisticsTracker = ({ origin, destination, status, eta }: LogisticsTrackerProps) => {
    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Mock Map Header */}
            <div className="h-32 bg-slate-100 relative w-full overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/2275px-Google_Maps_Logo_2020.svg.png')] bg-cover bg-center grayscale" />

                {/* Route Line Mock */}
                <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-300 rounded-full">
                    <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                        style={{ width: status === 'in_transit' ? '50%' : status === 'delivered' ? '100%' : '5%' }}
                    />
                </div>

                <div className="absolute top-1/2 left-10 -translate-y-1/2 -ml-1.5 h-4 w-4 rounded-full bg-slate-400 border-2 border-white shadow-sm" />
                <div className="absolute top-1/2 right-10 -translate-y-1/2 -mr-1.5 h-4 w-4 rounded-full bg-primary border-2 border-white shadow-sm ring-4 ring-primary/20" />

                {status === 'in_transit' && (
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white p-1.5 rounded-full shadow-md z-10 animate-pulse">
                        <Truck className="h-4 w-4 text-primary" />
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-lg">Rastreo de Envío</h3>
                        <p className="text-sm text-muted-foreground">Transportes Castores S.A. de C.V.</p>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-black uppercase">
                        {status === 'pending' ? 'Por Recolectar' : status === 'in_transit' ? 'En Ruta' : 'Entregado'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 relative">
                    {/* Connector Line */}
                    <div className="absolute left-3 top-2 bottom-4 w-0.5 bg-slate-200" />

                    <div className="relative pl-8">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center z-10">
                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Origen</span>
                        <div className="font-semibold">{origin}</div>
                        <div className="text-xs text-slate-500 mt-1">Recolección Verificada</div>
                    </div>

                    <div className="relative pl-8">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-primary/10 border border-primary flex items-center justify-center z-10">
                            <MapPin className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Destino</span>
                        <div className="font-semibold">{destination}</div>
                        <div className="text-xs text-primary font-medium mt-1">Entrega Estimada: {eta}</div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        Chofer: Roberto Méndez
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline">Ver Mapa en Vivo</button>
                </div>
            </div>
        </div>
    );
};
