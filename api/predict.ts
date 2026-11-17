import type { VercelRequest, VercelResponse } from '@vercel/node';
import { predictCropPrice } from '../backend/functions/ai/aiService';
import { z } from 'zod';

const aiPredictionInputSchema = z.object({
  crop: z.string().min(1, "Crop is required").max(100, "Crop too long"),
  location: z.string().max(100, "Location too long").optional().default("General Market"),
  historical_price: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)]).optional(),
  currentPrice: z.union([z.number(), z.string()]).optional(),
  current_price: z.union([z.number(), z.string()]).optional(),
  quantity: z.union([z.number(), z.string()]).optional(),
  season: z.string().optional(),
  weather: z.string().optional(),
  demand: z.string().optional(),
  supply: z.string().optional(),
  market_conditions: z.string().optional(),
  role: z.enum(['farmer', 'merchant', 'admin']).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' });
  }
  
  try {
    const data = aiPredictionInputSchema.parse(req.body);
    const prediction = await predictCropPrice(data);
    res.status(200).json(prediction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.errors });
    }
    console.error('API Error:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'An unexpected error occurred processing your prediction.' });
  }
}
