export async function getAiPricePrediction(data: any) {
  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch AI price prediction');
  }
  
  return response.json();
}

export async function getAiMarketInsights(data: any) {
  const response = await fetch('/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch AI market insights');
  }
  
  return response.json();
}

export async function askAiAssistant(query: string, contextData: any) {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, contextData }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch AI assistant response');
  }
  
  return response.json();
}
