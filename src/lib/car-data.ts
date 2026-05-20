
export const CAR_BRANDS_MODELS: Record<string, string[]> = {
    "Acura": ["ILX", "MDX", "NSX", "RDX", "RLX", "TLX"],
    "Alfa Romeo": ["Giulia", "Giulietta", "Stelvio"],
    "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "RS3", "RS5", "S3", "S4", "S5", "TT"],
    "BMW": ["Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "Serie 7", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "M2", "M3", "M4", "M5"],
    "Buick": ["Enclave", "Encore", "Envision", "LaCrosse"],
    "Cadillac": ["ATS", "CTS", "Escalade", "XT4", "XT5", "XT6"],
    "Chevrolet": ["Aveo", "Beat", "Blazer", "Camaro", "Captiva", "Cavalier", "Cheyenne", "Colorado", "Corvette", "Cruze", "Equinox", "Onix", "S10", "Silverado", "Spark", "Suburban", "Tahoe", "Tracker", "Traverse", "Trax"],
    "Chrysler": ["300", "Pacifica"],
    "Dodge": ["Attitude", "Challenger", "Charger", "Durango", "Journey", "Neon"],
    "Fiat": ["500", "Argo", "Mobi", "Palio", "Pulse", "Uno"],
    "Ford": ["Bronco", "EcoSport", "Edge", "Escape", "Expedition", "Explorer", "F-150", "Fiesta", "Figo", "Focus", "Fusion", "Lobo", "Maverick", "Mustang", "Ranger", "Territory", "Transit"],
    "GMC": ["Acadia", "Sierra", "Terrain", "Yukon"],
    "Honda": ["Accord", "City", "Civic", "CR-V", "Fit", "HR-V", "Insight", "Odyssey", "Pilot", "Ridgeline"],
    "Hyundai": ["Accent", "Creta", "Elantra", "Grand i10", "Ioniq", "Santa Fe", "Tucson", "Venue"],
    "Infiniti": ["Q50", "Q60", "QX50", "QX60", "QX80"],
    "JAC": ["Frison", "J7", "S2", "S3", "S4", "Sei 2", "Sei 3", "Sei 4", "Sei 7"],
    "Jaguar": ["E-Pace", "F-Pace", "F-Type", "XE", "XF"],
    "Jeep": ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Renegade", "Wrangler"],
    "KIA": ["Forte", "Niro", "Optima", "Rio", "Sedona", "Seltos", "Sorento", "Soul", "Sportage", "Stinger"],
    "Land Rover": ["Defender", "Discovery", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
    "Lexus": ["ES", "IS", "LS", "NX", "RX", "UX"],
    "Lincoln": ["Aviator", "Corsair", "Nautilus", "Navigator"],
    "Mazda": ["Mazda 2", "Mazda 3", "Mazda 6", "CX-3", "CX-30", "CX-5", "CX-50", "CX-9", "MX-5"],
    "Mercedes-Benz": ["Clase A", "Clase B", "Clase C", "Clase E", "Clase S", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "AMG GT"],
    "MG": ["GT", "HS", "RX5", "ZS", "MG5"],
    "MINI": ["Cooper", "Clubman", "Countryman"],
    "Mitsubishi": ["L200", "Mirage", "Montero Sport", "Outlander", "Xpander"],
    "Nissan": ["Altima", "Frontier", "Kicks", "March", "Maxima", "Murano", "NP300", "Pathfinder", "Sentra", "Tiida", "Urvan", "Versa", "X-Trail", "Z"],
    "Peugeot": ["208", "301", "2008", "3008", "5008", "Partner", "Rifter"],
    "Porsche": ["718", "911", "Cayenne", "Macan", "Panamera", "Taycan"],
    "RAM": ["700", "1500", "2500", "Promaster"],
    "Renault": ["Captur", "Duster", "Kwid", "Koleos", "Logan", "Oroch", "Stepway", "Twizy"],
    "SEAT": ["Arona", "Ateca", "Ibiza", "Leon", "Tarraco"],
    "Subaru": ["BRZ", "Forester", "WRX", "XV"],
    "Suzuki": ["Ertiga", "Ignis", "Jimny", "Swift", "Vitara", "S-Cross"],
    "Tesla": ["Model 3", "Model S", "Model X", "Model Y"],
    "Toyota": ["Avanza", "Camry", "Corolla", "Hiace", "Highlander", "Hilux", "Prius", "RAV4", "Sienna", "Tacoma", "Tundra", "Yaris"],
    "Volkswagen": ["Caddy", "Golf", "Jetta", "Nivus", "Polo", "Saveiro", "T-Cross", "Taos", "Teramont", "Tiguan", "Vento", "Virtus"],
    "Volvo": ["S60", "S90", "V60", "XC40", "XC60", "XC90"]
};

export const POPULAR_BRANDS = [
    "Nissan", "Chevrolet", "Volkswagen", "Toyota", "Kia", "Honda", "Mazda", "Ford", "Hyundai", "BMW"
];

export const MODEL_SUGGESTIONS: Record<string, string[]> = CAR_BRANDS_MODELS;

export function getSpecsForModel(make: string, model: string): Record<string, any> | null {
    return null;
}
