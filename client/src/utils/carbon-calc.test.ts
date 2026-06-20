import { describe, it, expect } from 'vitest';
import { calculateCO2e } from './carbon-calc';

describe('Carbon Calculator Tests', () => {
  describe('calculateCO2e', () => {
    it('should calculate transport emissions correctly', () => {
      expect(calculateCO2e('Transport', 'car_gasoline', 100)).toBe(19.2); // 0.192 * 100
      expect(calculateCO2e('Transport', 'car_diesel', 100)).toBe(17.1); // 0.171 * 100
      expect(calculateCO2e('Transport', 'train', 50)).toBe(2.05); // 0.041 * 50
    });

    it('should calculate food emissions correctly', () => {
      expect(calculateCO2e('Food', 'beef', 2)).toBe(54.0); // 27.0 * 2
      expect(calculateCO2e('Food', 'chicken', 1)).toBe(6.9); // 6.9 * 1
      expect(calculateCO2e('Food', 'vegan_meal', 3)).toBe(1.5); // 0.5 * 3
    });

    it('should calculate energy emissions correctly', () => {
      expect(calculateCO2e('Energy', 'electricity', 100)).toBe(23.3); // 0.233 * 100
      expect(calculateCO2e('Energy', 'natural_gas', 200)).toBe(36.6); // 0.183 * 200
    });

    it('should calculate shopping emissions correctly', () => {
      expect(calculateCO2e('Shopping', 'clothes', 2)).toBe(30.0); // 15.0 * 2
      expect(calculateCO2e('Shopping', 'electronics', 1)).toBe(50.0); // 50.0 * 1
    });

    it('should calculate waste emissions correctly', () => {
      expect(calculateCO2e('Waste', 'landfill', 10)).toBe(5.0); // 0.5 * 10
      expect(calculateCO2e('Waste', 'recycling', 10)).toBe(0.2); // 0.02 * 10
    });

    it('should return 0 for invalid category or type', () => {
      expect(calculateCO2e('Transport', 'invalid_type', 100)).toBe(0);
      // @ts-expect-error - testing invalid runtime category
      expect(calculateCO2e('InvalidCategory', 'type', 100)).toBe(0);
    });
  });
});
