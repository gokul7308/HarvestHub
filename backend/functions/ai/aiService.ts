import { GoogleGenAI } from '@google/genai';

// Initialize the client. This will throw if AI_API_KEY is missing.
// It will automatically use the GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text() || '{}');
  } catch (error) {
    console.error('AI Price Prediction Error:', error);
    throw new Error('Failed to generate AI estimate.');
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text() || '{}');
  } catch (error) {
    console.error('AI Market Insights Error:', error);
    throw new Error('Failed to generate market insights.');
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return { response: response.text() };
  } catch (error) {
    console.error('AI Assistant Error:', error);
    throw new Error('Failed to generate assistant response.');
  }
}
