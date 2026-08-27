import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    if (!process.env.AI_API_KEY) {
      throw new Error('AI service is currently unavailable. Please try again later.');
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
  }
  return aiClient;
}

export async function predictCropPrice(data: any) {
  const prompt = `
    Analyze the following crop data and predict the price.
    Data: ${JSON.stringify(data)}
    Return a JSON response with:
    {
      "estimated_price": number,
      "min_price": number,
      "max_price": number,
      "trend": "up" | "down" | "stable",
      "demand": "high" | "medium" | "low",
      "confidence": number,
      "recommendation": string
    }
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const rawText = response.text || '{}';
    const jsonText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('AI Price Prediction Error:', error);
    throw new Error('AI service is currently unavailable. Please try again later.');
  }
}

export async function getMarketInsights(data: any) {
  const prompt = `
    Analyze the following market data and provide insights.
    Data: ${JSON.stringify(data)}
    Return a JSON response with:
    {
      "trending_crops": string[],
      "falling_crops": string[],
      "stable_crops": string[],
      "high_demand_crops": string[],
      "supply_demand_trend": string,
      "ai_recommendations": string[]
    }
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const rawText = response.text || '{}';
    const jsonText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('AI Market Insights Error:', error);
    throw new Error('AI service is currently unavailable. Please try again later.');
  }
}

export async function askAssistant(query: string, contextData: any) {
  const prompt = `
    You are the HarvestHub AI Assistant. You help farmers, merchants, and admins understand the marketplace.
    Here is the current marketplace context:
    ${JSON.stringify(contextData)}
    
    Answer the user's question concisely based on this data. Do not invent statistics.
    Question: ${query}
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return { response: response.text };
  } catch (error) {
    console.error('AI Assistant Error:', error);
    throw new Error('AI service is currently unavailable. Please try again later.');
  }
}
