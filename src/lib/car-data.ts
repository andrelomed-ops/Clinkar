
export const POPULAR_BRANDS = [
    "BMW", "Mercedes-Benz", "Audi", "Porsche", "Tesla", 
    "Toyota", "Honda", "Mazda", "Nissan", "Ford", 
    "Chevrolet", "Volkswagen", "Kia", "Hyundai", "Land Rover"
];

export const MODEL_SUGGESTIONS: Record<string, string[]> = {
    "BMW": ["M2", "M3", "M4", "X3", "X5", "Series 3", "Series 4"],
    "Mazda": ["3", "MX-5", "CX-5", "CX-30", "CX-90", "2"],
    "Toyota": ["Tacoma", "Hilux", "Corolla", "Camry", "RAV4", "Supra"],
    "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "GLC", "GLE", "AMG GT"],
    "Audi": ["A3", "A4", "Q3", "Q5", "RS3", "RS6", "R8"],
    "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    "Porsche": ["911", "718 Cayman", "Taycan", "Macan", "Cayenne"]
};

export const PRESET_SPECS: Record<string, any> = {
    "Mazda-3": {
        performance: { engine: "2.5L Turbo", horsepower: "227 hp", fuelType: "Gasoline", transmission: "Automatic", driveTrain: "AWD", cylinders: 4, consumption: "12.4 km/l" },
        architecture: { bodyType: "Sedan", doors: 4, passengers: 5, dimensions: "4662 x 1795 x 1440 mm", tankCapacity: "51L", rims: "18\"" },
        features: { ac: true, sunroof: true, leatherSeats: true, touchScreen: true, carPlay: true, androidAuto: true, bluetooth: true, startStopButton: true },
        security: { airbags: 7, abs: true, discBrakes: 4, reverseCamera: true, parkingSensors: true }
    },
    "BMW-M3": {
        performance: { engine: "3.0L Twin-Turbo I6", horsepower: "473 hp", fuelType: "Gasoline", transmission: "Manual", driveTrain: "RWD", cylinders: 6, consumption: "8.5 km/l" },
        architecture: { bodyType: "Sedan", doors: 4, passengers: 5, dimensions: "4794 x 1903 x 1433 mm", tankCapacity: "59L", rims: "19\"/20\"" },
        features: { ac: true, sunroof: false, leatherSeats: true, touchScreen: true, carPlay: true, androidAuto: true, bluetooth: true, startStopButton: true },
        security: { airbags: 6, abs: true, discBrakes: 4, reverseCamera: true, parkingSensors: true }
    },
    "Tesla-Model 3": {
        performance: { engine: "Dual Motor Electric", horsepower: "450 hp", fuelType: "Electric", transmission: "Direct", driveTrain: "AWD", cylinders: 0, consumption: "0.0 km/l" },
        architecture: { bodyType: "Sedan", doors: 4, passengers: 5, dimensions: "4694 x 1849 x 1443 mm", tankCapacity: "N/A", rims: "18\"/19\"" },
        features: { ac: true, sunroof: true, leatherSeats: true, touchScreen: true, carPlay: false, androidAuto: false, bluetooth: true, startStopButton: true },
        security: { airbags: 8, abs: true, discBrakes: 4, reverseCamera: true, parkingSensors: true }
    }
};

export function getSpecsForModel(brand: string, model: string) {
    const key = `${brand}-${model}`;
    return PRESET_SPECS[key] || null;
}
