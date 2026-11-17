import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMarketInsights } from '../backend/functions/ai/aiService';
import { z } from 'zod';

const aiInsightsInputSchema = z.object({
  role: z.enum(['farmer', 'merchant', 'admin']),
  currentCrop: z.string().max(100, "Crop name too long").optional(),
  totalFarmers: z.number().optional(),
  totalMerchants: z.number().optional(),
  activeListings: z.number().optional(),
  revenue: z.number().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' });
  }
  
  try {
    const data = aiInsightsInputSchema.parse(req.body);
    const insights = await getMarketInsights(data);
    res.status(200).json(insights);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.errors });
    }
    console.error('API Error:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'An unexpected error occurred processing insights.' });
  }
}
