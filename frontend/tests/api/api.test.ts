import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const aiPredictionInputSchema = z.object({
  crop: z.string().min(1, "Crop is required"),
  location: z.string().min(1, "Location is required"),
  historical_price: z.number().positive("Historical price must be positive").optional(),
  role: z.enum(['farmer', 'merchant', 'admin']).optional(),
}).strict();

describe('API Validation - Predict endpoint', () => {
  it('accepts valid input', () => {
    const valid = { crop: 'Onion', location: 'Pune', historical_price: 25.5, role: 'farmer' };
    expect(aiPredictionInputSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty crop', () => {
    const invalid = { crop: '', location: 'Pune' };
    expect(aiPredictionInputSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects negative historical price', () => {
    const invalid = { crop: 'Onion', location: 'Pune', historical_price: -10 };
    expect(aiPredictionInputSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects unknown fields (strict)', () => {
    const invalid = { crop: 'Onion', location: 'Pune', unknownField: true };
    expect(aiPredictionInputSchema.safeParse(invalid).success).toBe(false);
  });
});
