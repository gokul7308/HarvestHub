import { Offer } from './offer';

export type ListingStatus = 'Active' | 'Pending' | 'Draft' | 'Sold';

export interface Listing {
  id: string;
  name: string;
  price: number; 
  quantity: number; 
  unit: string;
  location: string;
  description: string;
  images: string[];
  status: ListingStatus;
  offers: Offer[];
  createdAt: string;
}
