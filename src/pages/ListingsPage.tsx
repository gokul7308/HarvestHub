import React, { useState } from "react"
import { useUser } from "@/context/UserContext"
import { useListings } from "@/context/ListingContext"
import { useTranslation } from "react-i18next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Plus, MapPin } from "lucide-react"
import { EditListingModal } from "@/components/crops/EditListingModal"
import { Listing } from "@/types/listing"

export default function ListingsPage() {
  const { user } = useUser()
  const { listings, deleteListing } = useListings()
  const { t } = useTranslation()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const farmerListings = listings // since we don't track farmerId natively yet, list everything for prototype
  // In production: listings.filter(l => l.farmerId === user?.id)

  const handleDelete = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this crop?")) {
       await deleteListing(id)
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 font-sans selection:bg-[#1B5E20]/30 selection:text-[#1B5E20]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold font-poppins text-slate-900 dark:text-white tracking-tight">Active Listings</h1>
          <p className="text-slate-500 dark:text-white/60 mt-1 font-medium">Manage your crop listings across the active marketplace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {farmerListings.map(listing => (
            <Card key={listing.id} className="overflow-hidden group">
               <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                 {listing.images && listing.images.length > 0 ? (
                   <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                 )}
                 <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#1B5E20] dark:text-green-400 shadow-sm">
                   {listing.status}
                 </div>
               </div>
               
               <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <CardTitle className="mb-1">{listing.name}</CardTitle>
                     <div className="flex items-center gap-1 text-slate-500 dark:text-white/60 text-xs font-medium">
                       <MapPin size={12} /> {listing.location}
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">${listing.price.toFixed(2)}<span className="text-[10px] text-slate-500 dark:text-white/50 tracking-widest uppercase">/{listing.unit}</span></div>
                     <div className="text-xs font-bold text-emerald-600 dark:text-green-400 mt-0.5">{listing.quantity} {listing.unit} available</div>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
                    <Button 
                      onClick={() => { setEditingListing(listing); setIsEditModalOpen(true); }}
                      variant="outline" 
                      className="flex-1 h-10 border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-slate-600 rounded-xl"
                    >
                      <Edit size={14} className="mr-2" /> Edit
                    </Button>
                    <Button 
                      onClick={() => handleDelete(listing.id)}
                      variant="outline" 
                      className="h-10 px-4 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:border-red-500/30 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </Button>
                 </div>
               </CardContent>
            </Card>
         ))}
         
         {farmerListings.length === 0 && (
           <div className="col-span-full py-20 text-center bg-white dark:bg-white/5 backdrop-blur-xl rounded-[32px] border-2 border-slate-100 dark:border-white/10">
              <p className="text-slate-500 dark:text-white/60 font-bold">You have no active listings at the moment.</p>
           </div>
         )}
      </div>
 
      <EditListingModal 
        listing={editingListing} 
        isOpen={isEditModalOpen} 
        onClose={() => { setEditingListing(null); setIsEditModalOpen(false); }} 
      />
    </div>
  )
}
