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
  const role = data?.role || 'farmer';
  const roleContext = role === 'merchant'
    ? 'You are providing buying price analysis for an agricultural merchant.'
    : role === 'admin'
    ? 'You are providing platform pricing benchmarks for a platform administrator.'
    : 'You are providing crop price predictions and selling advice for a farmer.';

  const prompt = `
    ${roleContext}
    Analyze the following crop data and predict price metrics.
    Input Data: ${JSON.stringify(data)}

    Return a valid JSON object strictly matching this schema:
    {
      "estimated_price": number,
      "min_price": number,
      "max_price": number,
      "trend": "up" | "down" | "stable",
      "demand": "high" | "medium" | "low",
      "confidence": number,
      "recommendation": string,
      "buying_insight": string,
      "prediction_metadata": {
        "methodology": "Generative AI Prototype (Not a trained ML model)",
        "timestamp": string,
        "input_factors": string[]
      }
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
    const result = JSON.parse(jsonText);
    
    // Ensure metadata exists in case the model failed to generate it
    if (!result.prediction_metadata) {
      result.prediction_metadata = {
        methodology: "Generative AI Prototype (Not a trained ML model)",
        timestamp: new Date().toISOString(),
        input_factors: Object.keys(data)
      };
    }
    
    return result;
  } catch (error) {
    console.error('AI Price Prediction Error:', error);
    throw new Error('AI service is currently unavailable. Please try again later.');
  }
}

export async function getMarketInsights(data: any) {
  const role = data?.role || 'farmer';
  const roleContext = role === 'merchant'
    ? 'You are an agricultural market intelligence advisor providing purchasing and demand insights for a merchant.'
    : role === 'admin'
    ? 'You are an agricultural platform analytics advisor providing operational, volume, and risk insights for a platform administrator.'
    : 'You are an agricultural advisor providing market demand and selling insights for a farmer.';

  const prompt = `
    ${roleContext}
    Analyze the following market and application data:
    Data: ${JSON.stringify(data)}

    Return a valid JSON object strictly matching this schema:
    {
      "trending_crops": string[],
      "falling_crops": string[],
      "stable_crops": string[],
      "high_demand_crops": string[],
      "low_demand_crops": string[],
      "supply_demand_trend": string,
      "ai_recommendations": string[],
      "purchasing_opportunities": string[],
      "anomalies": string[]
    }
    
    IMPORTANT for anomalies: If role is admin, inspect for unusual volume, price spikes, or activity spikes. Do NOT label users as fraudulent. Use cautious phrasing such as "Potential anomaly detected" or "Requires admin review".
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
  const role = contextData?.role || 'farmer';
  
  let systemPersona = 'You are the HarvestHub AI Assistant helping an agricultural marketplace user.';
  if (role === 'farmer') {
    systemPersona = 'You are an agricultural marketplace assistant helping a farmer with crop prices, harvesting advice, demand trends, and listing decisions. Speak supportively and practically about farming and selling.';
  } else if (role === 'merchant') {
    systemPersona = 'You are an agricultural marketplace assistant helping a merchant with crop procurement, demand evaluation, price comparisons, and buying decisions. Focus on supply availability, favorable pricing, and market ROI.';
  } else if (role === 'admin') {
    systemPersona = 'You are an agricultural marketplace analytics assistant helping a platform administrator with system overview, platform metrics, user activity, marketplace health, and anomaly monitoring.';
  }

  const prompt = `
    ${systemPersona}
    
    Current Marketplace & System Context:
    ${JSON.stringify(contextData)}

    User Question: ${query}

    Instructions: Answer the user question concisely, professionally, and accurately based on the provided context data. Do not fabricate fake metrics. If specific data is not available, state that clearly and offer general guidance appropriate for a ${role}.
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
