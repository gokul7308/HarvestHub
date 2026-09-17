import type { VercelRequest, VercelResponse } from '@vercel/node';
import { predictCropPrice } from '../backend/functions/ai/aiService';
import { z } from 'zod';

const aiPredictionInputSchema = z.object({
  crop: z.string().optional(),
  location: z.string().optional(),
  historical_price: z.number().optional(),
  role: z.enum(['farmer', 'merchant', 'admin']).optional(),
}).passthrough();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const data = aiPredictionInputSchema.parse(req.body);
    const prediction = await predictCropPrice(data);
    res.status(200).json(prediction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
}
