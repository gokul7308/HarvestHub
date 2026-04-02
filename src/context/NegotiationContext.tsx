import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

export interface Negotiation {
  id: string;
  crop_name: string;
  buyer_name: string;
  seller_name: string;
  price: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  listing_id: string;
}

interface NegotiationContextType {
  negotiations: Negotiation[];
  loading: boolean;
  addNegotiation: (negotiation: { listing_id: string, price: number, quantity: number, message?: string }) => Promise<void>;
  acceptNegotiation: (id: string, listingId: string) => Promise<void>;
  rejectNegotiation: (id: string) => Promise<void>;
}

const NegotiationContext = createContext<NegotiationContextType | undefined>(undefined);

export function NegotiationProvider({ children }: { children: React.ReactNode }) {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchNegotiations();
  }, [user]);

  const fetchNegotiations = async () => {
    if (!user) {
      setNegotiations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          crops (name, farmer_id, profiles!crops.farmer_id_fkey(name)),
          buyer:buyer_id(name)
        `)
        .or(`buyer_id.eq.${user.id},crops.farmer_id.eq.${user.id}`);

      if (error) throw error;
      
      if (data) {
        setNegotiations(data.map((o: any) => ({
          id: o.id,
          crop_name: o.crops?.name,
          buyer_name: o.buyer?.name,
          seller_name: o.crops?.profiles?.name,
          price: `$${o.price} / kg`,
          status: o.status as any,
          listing_id: o.listing_id
        })));
      }
    } catch (error) {
      console.error('Error fetching negotiations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNegotiation = async (offer: { listing_id: string, price: number, quantity: number, message?: string }) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('offers')
        .insert([{
          ...offer,
          buyer_id: user.id,
          status: 'Pending'
        }]);

      if (error) throw error;
      toast.success("Negotiation initiated");
      fetchNegotiations();
    } catch (error) {
      console.error('Error adding negotiation:', error);
      toast.error("Failed to start negotiation");
    }
  };

  const acceptNegotiation = async (id: string, listingId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'Accepted' })
        .eq('id', id);

      if (error) throw error;
      
      // Also maybe update listing status if needed
      
      toast.success("Negotiation accepted");
      fetchNegotiations();
    } catch (error) {
      console.error('Error accepting negotiation:', error);
    }
  };

  const rejectNegotiation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'Rejected' })
        .eq('id', id);

      if (error) throw error;
      toast.info("Negotiation rejected");
      fetchNegotiations();
    } catch (error) {
      console.error('Error rejecting negotiation:', error);
    }
  };

  return (
    <NegotiationContext.Provider value={{ negotiations, loading, addNegotiation, acceptNegotiation, rejectNegotiation }}>
      {children}
    </NegotiationContext.Provider>
  );
}

export function useNegotiations() {
  const context = useContext(NegotiationContext);
  if (!context) throw new Error("useNegotiations must be used within NegotiationProvider");
  return context;
}
