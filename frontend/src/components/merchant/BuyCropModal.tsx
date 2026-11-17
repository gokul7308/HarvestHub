import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useOrders } from '@/contexts/OrderContext';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { ShoppingBag, MapPin, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface BuyCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop: {
    id: string;
    name: string;
    price: number | string;
    quantity: number | string;
    unit?: string;
    location?: string;
    farmerId?: string;
    farmer_id?: string;
    farmerName?: string;
    images?: string[];
  } | null;
}

export function BuyCropModal({ isOpen, onClose, crop }: BuyCropModalProps) {
  const { addOrder } = useOrders();
  const { user } = useUser();

  const [quantity, setQuantity] = useState<number>(50);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!crop) return null;

  // Normalize numeric values
  const numericPrice = typeof crop.price === 'number' 
    ? crop.price 
    : parseFloat(String(crop.price).replace(/[^0-9.]/g, '')) || 0;

  const rawQty = typeof crop.quantity === 'number'
    ? crop.quantity
    : parseFloat(String(crop.quantity).replace(/[^0-9.]/g, '')) || 0;

  const availableQuantity = rawQty > 0 ? rawQty : 1000;
  const unit = crop.unit || 'kg';
  const sellerId = crop.farmerId || crop.farmer_id || 'demo-farmer';
  const sellerName = crop.farmerName || 'Midwest Agritech Farms';

  const totalPrice = Number((quantity * numericPrice).toFixed(2));
  const isSelfPurchase = user?.id === sellerId;
  const isQuantityExceeded = quantity > availableQuantity;
  const isInvalidQuantity = quantity <= 0 || isNaN(quantity);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to complete your purchase");
      return;
    }

    if (isSelfPurchase) {
      toast.error("Security Rule: You cannot purchase your own crop listing");
      return;
    }

    if (isInvalidQuantity) {
      toast.error("Please enter a valid quantity greater than 0");
      return;
    }

    if (isQuantityExceeded) {
      toast.error(`Requested quantity exceeds available stock (${availableQuantity} ${unit})`);
      return;
    }

    setSubmitting(true);
    try {
      await addOrder({
        crop_id: crop.id,
        crop: crop.name,
        quantity: `${quantity} ${unit}`,
        total_price: totalPrice,
        seller_id: sellerId,
        buyer_id: user.id,
        seller_name: sellerName,
        status: 'Pending'
      });

      toast.success(`Order placed successfully! ${quantity} ${unit} of ${crop.name}`, {
        description: `Total: $${totalPrice.toLocaleString()} - Pending dispatch`
      });
      onClose();
    } catch (error: any) {
      console.error("Order placement error:", error);
      toast.error(error.message || "Failed to process order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Instant Sourcing & Order" size="md">
      <form onSubmit={handleConfirmOrder} className="space-y-6">
        {/* Crop Summary Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center shrink-0 border border-emerald-100">
            <ShoppingBag size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 truncate">{crop.name}</h3>
              <span className="text-emerald-700 font-black text-base">${numericPrice.toFixed(2)} / {unit}</span>
            </div>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Building2 size={13} className="text-slate-400" />
                {sellerName}
              </span>
              {crop.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-slate-400" />
                  {crop.location}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-600">
              Available Inventory: <span className="font-black text-slate-900">{availableQuantity.toLocaleString()} {unit}</span>
            </p>
          </div>
        </div>

        {/* Self-purchase warning */}
        {isSelfPurchase && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-bold">
            <AlertCircle size={16} className="shrink-0" />
            <span>You own this listing. Self-purchase transactions are rejected by database policy.</span>
          </div>
        )}

        {/* Quantity Selection */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
            Purchase Quantity ({unit})
          </label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min={1}
              max={availableQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              className="h-12 text-lg font-bold rounded-xl"
            />
            <span className="text-sm font-bold text-slate-400 px-2">{unit}</span>
          </div>
          {isQuantityExceeded && (
            <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1">
              <AlertCircle size={13} /> Cannot exceed available quantity ({availableQuantity} {unit})
            </p>
          )}
        </div>

        {/* Quick select presets */}
        <div className="flex gap-2">
          {[25, 50, 100, 250, 500].filter(q => q <= availableQuantity).map((qty) => (
            <button
              type="button"
              key={qty}
              onClick={() => setQuantity(qty)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                quantity === qty
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {qty} {unit}
            </button>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="bg-slate-100/70 p-4 rounded-xl space-y-2 text-xs font-medium">
          <div className="flex justify-between text-slate-600">
            <span>Base Unit Price</span>
            <span>${numericPrice.toFixed(2)} / {unit}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Quantity</span>
            <span>{quantity.toLocaleString()} {unit}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Platform Escrow Fee (0%)</span>
            <span className="text-emerald-600 font-bold">Waived</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
            <span>Total Payable</span>
            <span className="text-emerald-700">${totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || isSelfPurchase || isQuantityExceeded || isInvalidQuantity}
            className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing Order...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Confirm Order (${totalPrice.toLocaleString()})
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

