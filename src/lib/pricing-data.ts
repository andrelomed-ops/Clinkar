
export interface CarVersion {
  name: string;
  basePrice: number; // For a 2024 model as reference
}

export interface PricingModel {
  [modelName: string]: {
    [year: number]: {
      versions: CarVersion[];
    };
  };
}

export const PRICING_DATABASE: Record<string, PricingModel> = {
  "Kia": {
    "Seltos": {
      2022: {
        versions: [
          { name: "EX", basePrice: 345000 },
          { name: "EX Pack", basePrice: 385000 },
          { name: "SX", basePrice: 415000 },
          { name: "GT Line", basePrice: 465000 }
        ]
      },
      2023: {
        versions: [
          { name: "EX", basePrice: 380000 },
          { name: "EX Pack", basePrice: 420000 },
          { name: "SX", basePrice: 450000 },
          { name: "GT Line", basePrice: 510000 }
        ]
      }
    },
    "K3 / Rio": {
      2024: {
        versions: [
          { name: "L", basePrice: 285000 },
          { name: "LX", basePrice: 315000 },
          { name: "EX", basePrice: 345000 },
          { name: "EX Pack", basePrice: 375000 },
          { name: "GT Line", basePrice: 410000 }
        ]
      }
    }
  },
  "Nissan": {
    "Versa": {
      2024: {
        versions: [
          { name: "Sense", basePrice: 315000 },
          { name: "Advance", basePrice: 345000 },
          { name: "Exclusive", basePrice: 395000 }
        ]
      },
      2023: {
        versions: [
          { name: "Sense", basePrice: 285000 },
          { name: "Advance", basePrice: 315000 },
          { name: "Exclusive", basePrice: 365000 }
        ]
      }
    },
    "March": {
      2024: {
        versions: [
          { name: "Sense", basePrice: 245000 },
          { name: "Advance", basePrice: 275000 },
          { name: "Exclusive", basePrice: 315000 }
        ]
      }
    }
  },
  "Volkswagen": {
    "Jetta": {
      2024: {
        versions: [
          { name: "Trendline", basePrice: 395000 },
          { name: "Comfortline", basePrice: 435000 },
          { name: "Sportline", basePrice: 495000 }
        ]
      }
    },
    "Virtus": {
      2024: {
        versions: [
          { name: "Trendline", basePrice: 315000 },
          { name: "Comfortline", basePrice: 345000 },
          { name: "Highline", basePrice: 395000 }
        ]
      }
    }
  },
  "Mazda": {
    "Mazda 3": {
      2024: {
        versions: [
          { name: "i", basePrice: 395000 },
          { name: "i Grand Touring", basePrice: 455000 },
          { name: "Signature", basePrice: 525000 }
        ]
      }
    }
  }
};

/**
 * Segment-based fallback for models not in the dictionary
 */
export const SEGMENT_PRICING: Record<string, number> = {
  "Sedan Económico": 280000,
  "Sedan Mediano": 450000,
  "SUV Compacta": 420000,
  "SUV Mediana": 650000,
  "Pickup": 550000,
  "Lujo": 1100000
};
