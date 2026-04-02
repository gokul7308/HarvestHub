import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useListings } from '@/context/ListingContext';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ImageUploader } from '../common/ImageUploader';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const listingSchema = z.object({
  name: z.string().min(3, "Title must be at least 3 characters"),
  price: z.number().positive("Price must be greater than 0"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  location: z.string().min(3, "Location is required"),
  description: z.string().max(500, "Description is too long"),
  images: z.array(z.string())
});

type ListingFormValues = z.infer<typeof listingSchema>;

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCropModal({ isOpen, onClose }: AddCropModalProps) {
  const { addListing } = useListings();
  const { t } = useTranslation();

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      name: '',
      price: 0,
      quantity: 0,
      unit: 'kg',
      location: '',
      description: '',
      images: []
    }
  });

  const onSubmit = async (data: ListingFormValues) => {
    await addListing(data);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Crop Listing" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-900">Crop Media</label>
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <ImageUploader images={field.value} onChange={field.onChange} maxIter={4} />
            )}
          />
          {errors.images && <p className="text-red-500 text-xs font-bold mt-1 text-red-500">{errors.images.message}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-900">Crop Name / Title</label>
            <Input {...register('name')} className="bg-white border-gray-200" placeholder="e.g. Organic Premium Wheat" />
            {errors.name && <p className="text-red-500 text-xs font-bold mt-1 text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Price per Unit ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="bg-white pl-8 border-gray-200" />
            </div>
            {errors.price && <p className="text-red-500 text-xs font-bold mt-1 text-red-500">{errors.price.message}</p>}
          </div>

          <div className="space-y-2">
             <label className="text-sm font-semibold text-slate-900">Available Quantity & Unit</label>
             <div className="flex gap-2">
               <Input type="number" {...register('quantity', { valueAsNumber: true })} className="bg-white border-gray-200 flex-1" />
               <select {...register('unit')} className="w-24 bg-white border border-gray-200 rounded-xl px-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none">
                 <option value="kg">kg</option>
                 <option value="tons">tons</option>
                 <option value="lbs">lbs</option>
               </select>
             </div>
             {errors.quantity && <p className="text-red-500 text-xs font-bold mt-1 text-red-500">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-900">Farm Location</label>
            <Input {...register('location')} className="bg-white border-gray-200" placeholder="e.g. California, USA" />
            {errors.location && <p className="text-red-500 text-xs font-bold mt-1 text-red-500">{errors.location.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-900">Description</label>
            <textarea 
              {...register('description')} 
              rows={4} 
              className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] resize-none"
              placeholder="Detail your crop's quality, harvest date, and certifications."
            />
            {errors.description && <p className="text-red-500 text-xs font-bold mt-1 text-red-500">{errors.description.message}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl border-gray-200 h-11 w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-[var(--color-primary)] hover:brightness-110 text-white shadow-md transition-all h-11 w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Add Listing
          </Button>
        </div>
      </form>
    </Modal>
  );
}
