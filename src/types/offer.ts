export type OfferStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Countered';

export interface Offer {
  id: string;
  listingId: string;
  buyerName: string;
  buyerAvatar?: string;
  price: number;
  quantity: number;
  message: string;
  status: OfferStatus;
  createdAt: string;
}
