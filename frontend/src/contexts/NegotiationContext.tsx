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

const defaultMockNegotiations: Negotiation[] = [
  {
    id: "NEG-101",
    crop_name: "Organic Premium Wheat",
    buyer_name: "Demo Merchant",
    seller_name: "Demo Farmer",
    price: "$0.42 / kg",
    status: "Pending",
    listing_id: "LIST-992A"
  },
  {
    id: "NEG-102",
    crop_name: "Golden Soybeans",
    buyer_name: "Demo Merchant",
    seller_name: "Demo Farmer",
    price: "$0.32 / kg",
    status: "Accepted",
    listing_id: "LIST-881B"
  }
];

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

    if (user.id.startsWith('demo-')) {
      setNegotiations(defaultMockNegotiations);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          crops:listing_id (name, farmer_id, profiles:farmer_id(name)),
          buyer:buyer_id(name)
        `);

      if (error) throw error;
      
      if (data) {
        setNegotiations(data.map((o: any) => ({
          id: o.id,
          crop_name: o.crops?.name || 'Crop',
          buyer_name: o.buyer?.name || 'Buyer',
          seller_name: o.crops?.profiles?.name || 'Seller',
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
    if (user.id.startsWith('demo-')) {
      const newNeg: Negotiation = {
        id: `NEG-${Date.now().toString().slice(-4)}`,
        crop_name: "Selected Crop",
        buyer_name: user.name || "Demo Buyer",
        seller_name: "Midwest Agritech",
        price: `$${offer.price} / kg`,
        status: "Pending",
        listing_id: offer.listing_id
      };
      setNegotiations(prev => [newNeg, ...prev]);
      toast.success("Negotiation initiated (Demo Mode)");
      return;
    }
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
    if (user?.id.startsWith('demo-')) {
      setNegotiations(prev => prev.map(n => n.id === id ? { ...n, status: 'Accepted' } : n));
      toast.success("Negotiation accepted (Demo Mode)");
      return;
    }
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'Accepted' })
        .eq('id', id);

      if (error) throw error;
      toast.success("Negotiation accepted");
      fetchNegotiations();
    } catch (error) {
      console.error('Error accepting negotiation:', error);
    }
  };

  const rejectNegotiation = async (id: string) => {
    if (user?.id.startsWith('demo-')) {
      setNegotiations(prev => prev.map(n => n.id === id ? { ...n, status: 'Rejected' } : n));
      toast.info("Negotiation rejected (Demo Mode)");
      return;
    }
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
