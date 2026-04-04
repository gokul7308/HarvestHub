import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

export interface Demand {
  id: string;
  crop: string;
  quantity: string;
  price: string;
  location?: string;
  notes?: string;
  status: string;
  buyer_id: string;
  profiles?: {
    name: string;
  };
  created_at: string;
}

interface DemandContextType {
  demands: Demand[];
  loading: boolean;
  addDemand: (demand: Omit<Demand, 'id' | 'status' | 'created_at' | 'buyer_id' | 'profiles'>) => Promise<void>;
}

const DemandContext = createContext<DemandContextType | undefined>(undefined);

export function DemandProvider({ children }: { children: React.ReactNode }) {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchDemands();
  }, []);

  const fetchDemands = async () => {
    try {
      const { data, error } = await supabase
        .from('demands')
        .select(`
          *,
          profiles (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setDemands(data.map((d: any) => ({
          ...d,
          crop: d.crop_name, // compat
          price: d.budget // compat
        })) as Demand[]);
      }
    } catch (error) {
      console.error('Error fetching demands:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDemand = async (demand: any) => {
    if (!user) {
      toast.error("You must be logged in to post a demand");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('demands')
        .insert([{
          crop_name: demand.crop,
          quantity: demand.quantity,
          budget: demand.price,
          location: demand.location,
          notes: demand.notes,
          merchant_id: user.id,
          status: 'open'
        }])
        .select(`
          *,
          profiles (name)
        `)
        .single();

      if (error) throw error;

      setDemands([data as Demand, ...demands]);
      toast.success("Demand posted successfully!");
    } catch (error) {
      console.error('Error adding demand:', error);
      toast.error("Failed to post demand");
    }
  };

  return (
    <DemandContext.Provider value={{ demands, loading, addDemand }}>
      {children}
    </DemandContext.Provider>
  );
}

export const useDemand = () => {
  const ctx = useContext(DemandContext);
  if (!ctx) throw new Error('useDemand must be used within DemandProvider');
  return ctx;
};
