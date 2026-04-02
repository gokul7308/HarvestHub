import priceData from '../data/priceData.json';

export type CropKey = keyof typeof priceData;

export function getCropForecast(cropKey: CropKey) {
  // 1. Get Historical Data
  const historical = priceData[cropKey] || priceData.wheat;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  
  // 2. Simple Prediction Logic (Moving Average + Trend)
  const n = historical.length;
  const lastPrice = historical[n - 1];
  const prevPrice = historical[n - 2];
  
  // Detect trend from last two periods
  const trend = lastPrice - prevPrice;
  const variation = lastPrice * 0.05; // 5% small variation
  
  // Add next 3 predicted months
  const nextPrice1 = Math.round(lastPrice + (trend * 0.8) + (Math.random() * variation - variation / 2));
  const nextPrice2 = Math.round(nextPrice1 + (trend * 0.6) + (Math.random() * variation - variation / 2));
  const nextPrice3 = Math.round(nextPrice2 + (trend * 0.4) + (Math.random() * variation - variation / 2));

  // Construct UI attributes
  const trendDirection = trend > 0 ? 'Increasing' : 'Decreasing';
  const confidence = Math.abs(trend) > 20 ? 'High' : 'Medium';
  const factors = ['Weather impact', 'Demand level', 'Seasonal variation'];

  // Build Chart Data separating historical and predicted values to style them differently
  const chartData = historical.map((price, idx) => ({
    name: months[idx],
    historicalPrice: price,
  }));

  // Append predictions using original structure for Recharts
  chartData.push({ name: months[n], historicalPrice: lastPrice, predictedPrice: lastPrice } as any);
  chartData.push({ name: months[n + 1], predictedPrice: nextPrice1 } as any);
  chartData.push({ name: months[n + 2], predictedPrice: nextPrice2 } as any);
  chartData.push({ name: months[n + 3], predictedPrice: nextPrice3 } as any);

  return {
    chartData,
    trendDirection,
    confidence,
    factors,
    lastPrice,
  };
}
