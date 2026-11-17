import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

// Mock function for the API call to ml/serve.py
async function fetchPrediction(crop: string, market: string) {
  // In a real scenario, this fetches from the actual backend which proxies to the ML service.
  // We'll mock the historical data for the chart and add a single predicted point at the end.
  // For the sake of the hackathon, we simulate a latency and return mock series.
  return new Promise<any[]>((resolve, reject) => {
    setTimeout(() => {
        // Random chance of failure for UI demonstration
        if (Math.random() < 0.1) return reject(new Error("Failed to connect to ML service"));
        
        const basePrice = crop === 'Onion' ? 2500 : crop === 'Potato' ? 1800 : 3200;
        const data = [];
        const today = new Date();
        
        // Generate last 7 days of historical
        for (let i = 7; i > 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            data.push({
                date: d.toISOString().split('T')[0],
                actual: basePrice + Math.random() * 200 - 100,
                predicted: null
            });
        }
        
        // Generate tomorrow's prediction
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        data.push({
            date: tomorrow.toISOString().split('T')[0],
            actual: null,
            predicted: basePrice + Math.random() * 200 - 100
        });
        
        resolve(data);
    }, 1500);
  });
}

export function PricePredictionChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState('Onion');
  
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPrediction(crop, 'Pune');
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to fetch prediction");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [crop]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>AI Price Prediction</CardTitle>
                <CardDescription className="text-amber-600 font-medium">
                    Estimate, not a guaranteed price
                </CardDescription>
            </div>
            <select 
                value={crop} 
                onChange={(e) => setCrop(e.target.value)}
                className="w-[180px] border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="Onion">Onion</option>
                <option value="Potato">Potato</option>
                <option value="Tomato">Tomato</option>
            </select>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="h-4 w-4" />
                    Error
                </div>
                <div className="text-sm">{error}</div>
                <Button variant="outline" className="mt-2 w-fit bg-white" onClick={() => setCrop(crop)}>Retry</Button>
            </div>
        ) : loading ? (
            <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        ) : (
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    name="Historical Price" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#f59e0b" 
                    name="Predicted Price" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={{ r: 6, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
