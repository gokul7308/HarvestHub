import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMarketInsights } from '../backend/functions/ai/aiService';
import { z } from 'zod';

const aiInsightsInputSchema = z.object({
  role: z.enum(['farmer', 'merchant', 'admin']).optional(),
  currentCrop: z.string().optional(),
}).passthrough();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const data = aiInsightsInputSchema.parse(req.body);
    const insights = await getMarketInsights(data);
    res.status(200).json(insights);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
}
