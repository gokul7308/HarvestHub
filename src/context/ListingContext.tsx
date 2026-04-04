import React, { createContext, useContext, useEffect, useState } from 'react';
import { Listing } from '../types/listing';
import { Offer, OfferStatus } from '../types/offer';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

interface ListingContextType {
  listings: Listing[];
  loading: boolean;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'offers' | 'status'>) => Promise<void>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  getOffersByListing: (listingId: string) => Offer[];
  updateOfferStatus: (listingId: string, offerId: string, status: OfferStatus) => Promise<void>;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export function ListingProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data: cropsData, error: cropsError } = await supabase
        .from('crops')
        .select(`
          *,
          offers (*)
        `)
        .order('created_at', { ascending: false });

      if (cropsError) throw cropsError;
      
      if (cropsData) {
        setListings(cropsData.map(l => ({
          ...l,
          name: l.crop_name, // Map for frontend compat
          offers: (l.offers || []).map((o: any) => ({
            ...o,
            status: o.status as OfferStatus
          }))
        })));
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addListing = async (listing: any) => {
    if (!user) {
      toast.error("You must be logged in to add a listing");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('crops')
        .insert([{
          crop_name: listing.name,
          price: listing.price,
          quantity: listing.quantity,
          location: listing.location,
          farmer_id: user.id,
          status: 'Active'
        }])
        .select()
        .single();

      if (error) throw error;

      const newListing = { ...data, offers: [] } as Listing;
      setListings([newListing, ...listings]);
      toast.success("Crop Listing Added Successfully!");
    } catch (error) {
      console.error('Error adding listing:', error);
      toast.error("Failed to add listing");
    }
  };

  const updateListing = async (id: string, updates: Partial<Listing>) => {
    try {
      const { error } = await supabase
        .from('crops')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setListings(listings.map(l => l.id === id ? { ...l, ...updates } : l));
      toast.success("Listing Updated");
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error("Failed to update listing");
    }
  };

  const deleteListing = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crops')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setListings(listings.filter(l => l.id !== id));
      toast.success("Listing Deleted");
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error("Failed to delete listing");
    }
  };

  const getOffersByListing = (listingId: string) => {
    return listings.find(l => l.id === listingId)?.offers || [];
  };

  const updateOfferStatus = async (listingId: string, offerId: string, status: OfferStatus) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status })
        .eq('id', offerId);

      if (error) throw error;

      const newListings = listings.map(l => {
        if (l.id !== listingId) return l;
        return {
          ...l,
          offers: l.offers.map(o => o.id === offerId ? { ...o, status } : o)
        };
      });
      setListings(newListings);
      
      if (status === 'Accepted') toast.success("Offer Accepted!");
      if (status === 'Rejected') toast.info("Offer Rejected");
    } catch (error) {
      console.error('Error updating offer status:', error);
      toast.error("Failed to update offer");
    }
  };

  return (
    <ListingContext.Provider value={{ listings, loading, addListing, updateListing, deleteListing, getOffersByListing, updateOfferStatus }}>
      {children}
    </ListingContext.Provider>
  );
}

export function useListings() {
  const ctx = useContext(ListingContext);
  if (!ctx) throw new Error("useListings must be used within ListingProvider");
  return ctx;
}
