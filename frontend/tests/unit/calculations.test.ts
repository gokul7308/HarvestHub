import { describe, it, expect } from 'vitest';
import { cn } from '../../src/lib/utils';
import { getCropForecast } from '../../src/lib/forecast';

describe('Unit Tests: Core Utilities, Calculations & Data Formatting', () => {

  describe('Tailwind CSS class merging (cn)', () => {
    it('correctly merges class names and resolves tailwind collisions', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
      expect(cn('p-4', 'p-2')).toBe('p-2'); // twMerge collision resolution
      expect(cn('flex items-center', false && 'hidden', undefined, null)).toBe('flex items-center');
    });
  });

  describe('Crop Forecast Calculation & Chart Data Modeling', () => {
    it('computes moving average and 3-month forecast for known crops', () => {
      const forecast = getCropForecast('tomato');
      expect(forecast).toBeDefined();
      expect(forecast.chartData.length).toBeGreaterThan(6);
      expect(forecast.lastPrice).toBeGreaterThan(0);
      expect(['Increasing', 'Decreasing']).toContain(forecast.trendDirection);
      expect(['High', 'Medium']).toContain(forecast.confidence);
      expect(forecast.factors.length).toBe(3);
    });

    it('falls back to wheat historical baseline if unknown crop is requested', () => {
      // @ts-ignore - testing runtime fallback
      const fallbackForecast = getCropForecast('unknown_crop_key');
      expect(fallbackForecast).toBeDefined();
      expect(fallbackForecast.chartData.length).toBeGreaterThan(6);
    });
  });

  describe('Financial & Quantity Calculations', () => {
    it('accurately calculates order totals with multi-decimal precision', () => {
      const calculateOrderTotal = (qty: number, unitPrice: number, taxRate = 0) => {
        const subtotal = qty * unitPrice;
        const tax = subtotal * taxRate;
        return Number((subtotal + tax).toFixed(2));
      };

      expect(calculateOrderTotal(150, 2.45)).toBe(367.50);
      expect(calculateOrderTotal(1000, 0.355)).toBe(355.00);
      expect(calculateOrderTotal(50, 10.99, 0.05)).toBe(576.98);
    });

    it('accurately converts metric units (kg to Quintals and Tonnes)', () => {
      const convertKgToTonnes = (kg: number) => Number((kg / 1000).toFixed(3));
      const convertKgToQuintals = (kg: number) => Number((kg / 100).toFixed(2));

      expect(convertKgToTonnes(5000)).toBe(5.0);
      expect(convertKgToTonnes(1250)).toBe(1.25);
      expect(convertKgToQuintals(1250)).toBe(12.5);
    });

    it('calculates inventory remaining after partial order fulfillment', () => {
      const calculateRemainingInventory = (currentStock: number, orderedQuantity: number) => {
        if (orderedQuantity > currentStock) {
          throw new Error('Overdraw');
        }
        return currentStock - orderedQuantity;
      };

      expect(calculateRemainingInventory(1000, 250)).toBe(750);
      expect(calculateRemainingInventory(500, 500)).toBe(0);
      expect(() => calculateRemainingInventory(100, 150)).toThrow('Overdraw');
    });
  });
});

