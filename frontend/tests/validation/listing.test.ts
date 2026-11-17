import { describe, it, expect } from 'vitest';
import { listingSchema } from '../../src/components/crops/AddCropModal';

describe('Listing Validation', () => {
  it('should accept a valid crop listing', () => {
    const validData = {
      name: 'Organic Tomatoes',
      price: 2.50,
      quantity: 100,
      unit: 'kg',
      location: 'California',
      description: 'Fresh organic tomatoes.',
      images: []
    };
    const result = listingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing crop name', () => {
    const invalidData = {
      price: 2.50,
      quantity: 100,
      unit: 'kg',
      location: 'California',
      description: 'Fresh',
      images: []
    };
    const result = listingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty crop name', () => {
    const invalidData = {
      name: '',
      price: 2.50,
      quantity: 100,
      unit: 'kg',
      location: 'California',
      description: 'Fresh',
      images: []
    };
    const result = listingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject negative price', () => {
    const invalidData = {
      name: 'Tomatoes',
      price: -5,
      quantity: 100,
      unit: 'kg',
      location: 'California',
      description: 'Fresh',
      images: []
    };
    const result = listingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject zero/invalid quantity', () => {
    const invalidData = {
      name: 'Tomatoes',
      price: 2.50,
      quantity: 0,
      unit: 'kg',
      location: 'California',
      description: 'Fresh',
      images: []
    };
    const result = listingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid location if empty', () => {
    const invalidData = {
      name: 'Tomatoes',
      price: 2.50,
      quantity: 100,
      unit: 'kg',
      location: '',
      description: 'Fresh',
      images: []
    };
    const result = listingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
