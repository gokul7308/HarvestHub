import { z } from 'zod';

// AI Prediction Input Schema
export const aiPredictionInputSchema = z.object({
  crop: z.string().min(1, 'Crop name is required'),
  location: z.string().optional(),
  historical_price: z.number().nonnegative('Price cannot be negative').optional(),
  season: z.string().optional(),
  weather: z.string().optional(),
  demand: z.string().optional(),
  supply: z.string().optional(),
  market_conditions: z.string().optional(),
  role: z.enum(['farmer', 'merchant', 'admin']).optional(),
});

export type AIPredictionInput = z.infer<typeof aiPredictionInputSchema>;

// Crop Listing Schema
export const cropListingSchema = z.object({
  name: z.string().min(1, 'Crop name is required'),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
});

export type CropListingInput = z.infer<typeof cropListingSchema>;

// Demand Schema
export const demandSchema = z.object({
  crop_name: z.string().min(1, 'Crop name is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  budget: z.number().positive('Budget must be greater than 0'),
  location: z.string().optional(),
});

export type DemandInput = z.infer<typeof demandSchema>;
