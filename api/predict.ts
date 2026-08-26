import type { VercelRequest, VercelResponse } from '@vercel/node';
import { predictCropPrice } from '../backend/functions/ai/aiService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const data = req.body;
    const prediction = await predictCropPrice(data);
    res.status(200).json(prediction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
