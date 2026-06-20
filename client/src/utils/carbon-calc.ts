export type ActivityCategory = 'Transport' | 'Food' | 'Energy' | 'Shopping' | 'Waste';

export interface ActivityData {
  category: ActivityCategory;
  amount: number;
  unit: string;
  type: string;
}

// Simple CO2e factors (kg CO2e per unit)
const EMISSION_FACTORS: Record<string, Record<string, number>> = {
  Transport: {
    'car_gasoline': 0.192, // per km
    'car_diesel': 0.171, // per km
    'car_ev': 0.05, // per km (depends on grid, approx)
    'bus': 0.105, // per km
    'train': 0.041, // per km
    'flight_short': 0.255, // per km
    'flight_long': 0.15, // per km
  },
  Food: {
    'beef': 27.0, // per kg
    'chicken': 6.9, // per kg
    'pork': 12.1, // per kg
    'fish': 6.1, // per kg
    'cheese': 13.5, // per kg
    'vegan_meal': 0.5, // per meal
    'vegetarian_meal': 1.2, // per meal
    'meat_meal': 3.0, // per meal
  },
  Energy: {
    'electricity': 0.233, // per kWh (varies by country, UK approx)
    'natural_gas': 0.183, // per kWh
    'heating_oil': 0.254, // per kWh
  },
  Shopping: {
    'clothes': 15.0, // per item (approx)
    'electronics': 50.0, // per item (approx)
  },
  Waste: {
    'landfill': 0.5, // per kg
    'recycling': 0.02, // per kg
  }
};

export const calculateCO2e = (category: ActivityCategory, type: string, amount: number): number => {
  const categoryFactors = EMISSION_FACTORS[category];
  if (!categoryFactors) return 0;
  
  const factor = categoryFactors[type];
  if (factor === undefined) return 0;
  
  return Number((factor * amount).toFixed(2));
};
