import React, { useState } from 'react';
import { useListings } from '@/context/ListingContext';
import { Listing } from '@/types/listing';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, X, Tag, Loader2, MessageSquare, Clock } from 'lucide-react';

interface OffersModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OffersModal({ listing, isOpen, onClose }: OffersModalProps) {
  const { updateOfferStatus } = useListings();
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!listing) return null;

  const handleAction = async (offerId: string, action: 'Accepted' | 'Rejected') => {
    setProcessingId(offerId);
    await updateOfferStatus(listing.id, offerId, action);
    setProcessingId(null);
  };

  const pendingOffers = listing.offers.filter(o => o.status === 'Pending').sort((a,b) => b.price - a.price);
  const resolvedOffers = listing.offers.filter(o => o.status !== 'Pending');
  
  const allOffers = [...pendingOffers, ...resolvedOffers];
  const bestOfferId = pendingOffers.length > 0 ? pendingOffers[0].id : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Offers for ${listing.name}`} size="lg">
      <div className="space-y-6">
        
        {/* Listing Summary */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
             <img src={listing.images[0]} alt="Crop" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
             <h3 className="font-bold text-slate-900 leading-tight">{listing.name}</h3>
             <p className="text-sm text-slate-500 mt-0.5">Your Asking: <span className="font-semibold text-slate-900">${listing.price}/{listing.unit}</span> for {listing.quantity}{listing.unit}</p>
          </div>
          <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 border-transparent font-bold px-3 py-1">
            {listing.offers.length} Offer{listing.offers.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {allOffers.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Tag size={28} className="text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">No offers yet</h3>
             <p className="text-slate-500 max-w-sm mt-1">When merchants make an offer on your crop listing, it will appear here for you to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allOffers.map((offer) => {
               const isBest = offer.id === bestOfferId && offer.status === 'Pending';
               return (
                 <div key={offer.id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${isBest ? 'border-[var(--color-primary)] shadow-md' : 'border-gray-200 shadow-sm'}`}>
                    {isBest && (
                      <div className="bg-[#E8F5E9] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider py-1.5 px-4 flex items-center gap-2">
                        <Tag size={12} /> Best Current Offer
                      </div>
                    )}
                    <div className="p-5 flex flex-col md:flex-row gap-5">
                       
                       <div className="flex items-start gap-3 w-full md:w-1/3 shrink-0">
                         <img src={offer.buyerAvatar || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200 shadow-sm bg-gray-50" />
                         <div>
                           <p className="font-bold text-slate-900 leading-tight truncate">{offer.buyerName}</p>
                           <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={12} /> {new Date(offer.createdAt).toLocaleDateString()}</p>
                         </div>
                       </div>

                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex flex-wrap gap-x-8 gap-y-2 mb-3">
                             <div>
                               <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Offered Price</p>
                               <p className={`text-xl font-bold font-poppins ${offer.price >= listing.price ? 'text-[var(--color-primary)]' : offer.price < listing.price * 0.9 ? 'text-amber-600' : 'text-slate-900'}`}>
                                 ${offer.price.toFixed(2)}<span className="text-sm font-normal text-slate-500">/{listing.unit}</span>
                               </p>
                             </div>
                             <div>
                               <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Quantity Rev.</p>
                               <p className="text-lg font-semibold text-slate-900">{offer.quantity} {listing.unit}</p>
                             </div>
                          </div>

                          {offer.message && (
                            <div className="bg-gray-50 text-slate-600 text-sm p-3 rounded-xl border border-gray-100 flex items-start gap-2 relative">
                               <MessageSquare size={14} className="shrink-0 mt-0.5 text-blue-500" />
                               <p className="italic leading-relaxed">{offer.message}</p>
                            </div>
                          )}
                       </div>

                       <div className="w-full md:w-auto shrink-0 flex flex-row md:flex-col gap-2 justify-center border-t border-gray-100 md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-5">
                          {offer.status === 'Pending' ? (
                            <>
                              <Button 
                                className="flex-1 bg-[var(--color-primary)] hover:brightness-110 text-white shadow-sm"
                                disabled={processingId !== null}
                                onClick={() => handleAction(offer.id, 'Accepted')}
                              >
                                {processingId === offer.id ? <Loader2 className="animate-spin" size={16} /> : <Check className="mr-1" size={16} />} 
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1 border-gray-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                disabled={processingId !== null}
                                onClick={() => handleAction(offer.id, 'Rejected')}
                              >
                                <X className="mr-1" size={16} /> Reject
                              </Button>
                            </>
                          ) : (
                            <div className="flex w-full h-full items-center justify-center">
                              <Badge variant={offer.status === 'Accepted' ? 'success' : 'destructive'} className="w-full justify-center py-1.5 text-sm uppercase tracking-wide">
                                {offer.status}
                              </Badge>
                            </div>
                          )}
                       </div>

                    </div>
                 </div>
               );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
