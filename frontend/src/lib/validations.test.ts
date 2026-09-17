import { describe, it, expect } from 'vitest';
import { aiPredictionInputSchema, cropListingSchema, demandSchema } from './validations';

describe('Validation Schemas', () => {
  describe('cropListingSchema', () => {
    it('should validate a correct crop listing', () => {
      const validListing = {
        name: 'Organic Premium Wheat',
        price: 0.45,
        quantity: 1000,
        unit: 'kg',
        location: 'California, USA',
        description: 'High quality wheat'
      };
      
      const result = cropListingSchema.safeParse(validListing);
      expect(result.success).toBe(true);
    });

    it('should reject negative prices', () => {
      const invalidListing = {
        name: 'Organic Premium Wheat',
        price: -10,
        quantity: 1000,
        unit: 'kg',
        location: 'California, USA'
      };
      
      const result = cropListingSchema.safeParse(invalidListing);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Price must be greater than 0');
      }
    });

    it('should reject negative quantities', () => {
      const invalidListing = {
        name: 'Organic Premium Wheat',
        price: 10,
        quantity: -100,
        unit: 'kg',
        location: 'California, USA'
      };
      
      const result = cropListingSchema.safeParse(invalidListing);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Quantity must be greater than 0');
      }
    });
  });

  describe('aiPredictionInputSchema', () => {
    it('should validate a correct ai prediction input', () => {
      const validInput = {
        crop: 'Wheat',
        location: 'California, USA',
        historical_price: 3.50,
        role: 'farmer'
      };
      
      const result = aiPredictionInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should require a crop name', () => {
      const invalidInput = {
        location: 'California, USA'
      };
      
      const result = aiPredictionInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('demandSchema', () => {
    it('should validate correct demands', () => {
      const validDemand = {
        crop_name: 'Wheat',
        quantity: 100,
        budget: 500,
        location: 'USA'
      };
      const result = demandSchema.safeParse(validDemand);
      expect(result.success).toBe(true);
    });
  });
});
