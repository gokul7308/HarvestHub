import type { VercelRequest, VercelResponse } from '@vercel/node';
import { askAssistant } from '../backend/functions/ai/aiService';
import { z } from 'zod';

const assistantInputSchema = z.object({
  query: z.string().min(1, "Query is required").max(1000, "Query is too long"),
  contextData: z.record(z.any()).optional()
}).strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' });
  }
  
  try {
    const { query, contextData } = assistantInputSchema.parse(req.body);
    const response = await askAssistant(query, contextData);
    res.status(200).json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.errors });
    }
    console.error('API Error:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'An unexpected error occurred processing your query.' });
  }
}
