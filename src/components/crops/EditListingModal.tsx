import React, { useState, useEffect } from 'react';
import { useListings } from '@/context/ListingContext';
import { Listing } from '@/types/listing';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditListingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditListingModal({ listing, isOpen, onClose }: EditListingModalProps) {
  const { updateListing } = useListings();
  const [formData, setFormData] = useState<Partial<Listing>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (listing) {
      setFormData({
        name: listing.name,
        price: listing.price,
        quantity: listing.quantity,
        location: listing.location,
        unit: listing.unit
      });
    }
  }, [listing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;
    setLoading(true);
    try {
      await updateListing(listing.id, formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Crop Listing">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Crop Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
            required
            className="h-12 rounded-xl bg-white border-slate-200 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/5 transition-all text-sm font-bold"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($/{formData.unit || 'kg'})</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price || ''}
              onChange={(e: any) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
              className="h-12 rounded-xl bg-white border-slate-200 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/5 transition-all text-sm font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity ({formData.unit || 'kg'})</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity || ''}
              onChange={(e: any) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              required
              className="h-12 rounded-xl bg-white border-slate-200 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/5 transition-all text-sm font-bold"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e: any) => setFormData({ ...formData, location: e.target.value })}
            required
            className="h-12 rounded-xl bg-white border-slate-200 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/5 transition-all text-sm font-bold"
          />
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
          <Button type="button" variant="outline" onClick={onClose} className="border-slate-200 font-bold h-11 px-6 rounded-xl hover:bg-slate-50">Cancel</Button>
          <Button type="submit" disabled={loading} className="bg-[#1B5E20] hover:bg-[#144917] text-white font-black text-[10px] uppercase tracking-widest h-11 px-8 rounded-xl shadow-lg shadow-[#1B5E20]/20 transition-all">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
