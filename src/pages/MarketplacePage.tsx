import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { marketplaceListings } from "@/data/mock"
import { Search, Filter, MapPin, Building2, ShoppingBag } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useListings } from "@/context/ListingContext"
import { useDemand } from "@/context/DemandContext"
import { useUser } from "@/context/UserContext"
import { useNegotiations } from "@/context/NegotiationContext"
import { Listing } from "@/types/listing"

export default function MarketplacePage() {
  const { t } = useTranslation()
  const { listings } = useListings()
  const { demands } = useDemand()
  const { user } = useUser()
  const { addNegotiation } = useNegotiations()

  const [searchQuery, setSearchQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const categories = [
    { id: 'cereals', label: t("categories.cereals") },
    { id: 'fruits', label: t("categories.fruits") },
    { id: 'pulse', label: t("categories.pulses") },
    { id: 'cash', label: t("categories.cash") }
  ]

  const filteredListings = useMemo(() => {
    const all = [...listings.map(l => ({ ...l, cropName: l.name, farmerName: 'Local Farmer', image: l.images[0], isDynamic: true })), ...marketplaceListings.map(l => ({ ...l, isDynamic: false }))]
    
    return all.filter(item => {
      const name = item.isDynamic ? (item as any).name : (item as any).cropName
      const location = item.location
      const seller = item.isDynamic ? 'Local Farmer' : (item as any).farmerName
      
      const matchesSearch = !searchQuery || 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.toLowerCase().includes(searchQuery.toLowerCase())

      // Price check (parsing "$2.50 / kg" or 2.50)
      const priceNum = item.isDynamic ? (item as any).price : parseFloat((item as any).price.replace('$', '').split('/')[0])
      const matchesMinPrice = !minPrice || priceNum >= parseFloat(minPrice)
      const matchesMaxPrice = !maxPrice || priceNum <= parseFloat(maxPrice)

      return matchesSearch && matchesMinPrice && matchesMaxPrice
    })
  }, [listings, searchQuery, minPrice, maxPrice])

  return (
    <div className="max-w-7xl mx-auto space-y-6 selection:bg-[#1B5E20]/30 selection:text-[#1B5E20]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold font-poppins text-slate-900 tracking-tight">
            {t("marketplace.exchangeMarketplace")} 🌾
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{t("marketplace.discoverPremium")}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <Card className="w-full lg:w-72 shrink-0 h-fit bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24 rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Filter size={16} className="text-[#1B5E20]" /> {t("marketplace.filters")}
            </h3>
            
            <div className="space-y-8">
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-widest block mb-4">{t("marketplace.cropCategory")}</label>
                <div className="space-y-3">
                  {categories.map((c, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="rounded-lg text-[#1B5E20] focus:ring-[#1B5E20]/20 border-slate-200 w-5 h-5 cursor-pointer transition-all" /> 
                      <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-widest block mb-4">{t("marketplace.priceRange")}</label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-[#1B5E20] transition-all" 
                  />
                  <span className="text-slate-300 font-bold">—</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-[#1B5E20] transition-all" 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-widest block mb-4">{t("marketplace.locationRadius")}</label>
                <select className="w-full border-2 border-slate-50 rounded-xl text-sm font-bold bg-slate-50 px-4 py-3 outline-none focus:bg-white focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/5 transition-all appearance-none cursor-pointer">
                  <option>{t("marketplace.withinMiles", { count: 50 })}</option>
                  <option>{t("marketplace.withinMiles", { count: 100 })}</option>
                  <option>{t("marketplace.anywhereGlobal")}</option>
                </select>
              </div>

              <Button className="w-full h-12 bg-slate-900 text-white hover:bg-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200">
                {t("marketplace.applyFilters")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4">
             <div className="relative flex-1 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1B5E20] transition-colors" size={20} />
               <Input 
                 placeholder={t("marketplace.searchPlaceholder")} 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-12 h-14 bg-white text-base shadow-sm border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#1B5E20]/5 focus:border-[#1B5E20] transition-all" 
               />
             </div>
             <Button variant="outline" className="h-14 border-slate-100 bg-white text-slate-600 font-bold px-8 rounded-2xl hidden sm:flex hover:bg-slate-50">
               {t("marketplace.sortRelevant")}
             </Button>
          </div>

          {/* Active Demands Section */}
          {demands.length > 0 && (
             <div className="mb-8 pt-4">
               <h2 className="text-xl font-black font-poppins text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                 Active Market Demands
               </h2>
               <div className="grid md:grid-cols-2 gap-4">
                 {demands.map(d => (
                   <Card key={d.id} className="rounded-[24px] border-2 border-blue-100 bg-blue-50/30 overflow-hidden hover:shadow-[0_10px_30px_rgb(37,99,235,0.1)] transition-all cursor-pointer">
                     <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                           <div>
                             <h3 className="font-black text-lg text-slate-900 leading-none">{d.crop}</h3>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Buyer: {d.profiles?.name || 'Authorized Buyer'}</p>
                           </div>
                           <Badge className="bg-blue-100 text-blue-700 font-black text-[9px] uppercase tracking-widest border-0">Requested</Badge>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                           <div className="text-sm font-bold text-slate-700">Quantity: <span className="text-slate-900 font-black">{d.quantity} Tons</span></div>
                           <div className="text-right">
                             <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Budget</div>
                             <div className="font-black text-xl text-blue-600 leading-none">${d.price}/Ton</div>
                           </div>
                        </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </div>
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredListings.map((item: any, i) => {
              const isDynamic = item.isDynamic
              const name = isDynamic ? item.name : item.cropName
              const price = isDynamic ? `$${item.price.toFixed(2)}` : item.price
              const image = isDynamic ? item.images[0] : item.image
              const location = item.location
              const seller = isDynamic ? "Green Farm Co." : item.farmerName
              const quantity = isDynamic ? `${item.quantity} ${item.unit}` : item.quantity

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 6) * 0.05 }}
                  key={i}
                >
                  <Card className="overflow-hidden border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all group rounded-[32px] bg-white cursor-pointer h-full flex flex-col border-2">
                    <div className="h-52 overflow-hidden relative">
                      <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                         <Badge className="shadow-xl bg-white text-[#1B5E20] font-black uppercase text-[10px] tracking-widest px-3 py-1.5 border-none">{t("common.premium")}</Badge>
                         {i % 2 === 0 && <Badge className="shadow-xl bg-[#1B5E20] text-white font-black uppercase text-[10px] tracking-widest px-3 py-1.5 border-none">{t("common.verified")}</Badge>}
                      </div>
                    </div>
                    <CardContent className="p-8 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-black text-xl text-slate-900 tracking-tight leading-none truncate pr-4">{name}</h3>
                        <span className="font-black text-[#1B5E20] text-xl tracking-tighter whitespace-nowrap">{price}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2 mb-6">
                        {isDynamic ? item.description : t("marketplace.highQualitySustainably")}
                      </p>
                      
                      <div className="space-y-2.5 mt-auto">
                        <div className="flex items-center justify-between bg-slate-50/50 px-4 py-3 rounded-2xl border border-slate-50 group/row hover:bg-white hover:border-slate-100 transition-all">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/row:text-amber-500 transition-colors"><MapPin size={14} /> {t("marketplace.location")}</span>
                          <span className="text-xs font-black text-slate-900 truncate w-32 text-right" title={location}>{location}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50/50 px-4 py-3 rounded-2xl border border-slate-50 group/row hover:bg-white hover:border-slate-100 transition-all">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/row:text-[#1B5E20] transition-colors"><Building2 size={14} /> {t("marketplace.seller")}</span>
                          <span className="text-xs font-black text-slate-900 truncate text-right">{seller}</span>
                        </div>
                         <div className="flex items-center justify-between bg-slate-50/50 px-4 py-3 rounded-2xl border border-slate-50 group/row hover:bg-white hover:border-slate-100 transition-all">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/row:text-blue-500 transition-colors"><ShoppingBag size={14} /> {t("marketplace.available")}</span>
                          <span className="text-xs font-black text-slate-900 text-right">{quantity}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mt-8">
                        <Button className="flex-1 h-12 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all">
                           {t("marketplace.buyNow")}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            addNegotiation({
                              crop_id: item.id || 'mock-id',
                              price: typeof item.price === 'number' ? item.price : parseFloat(item.price.replace(/[^0-9.]/g, '')),
                               quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity.replace(/[^0-9.]/g, '')),
                              message: `Interest in ${name}`
                            });
                          }}
                          className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-50 text-slate-500 hover:bg-slate-50 hover:border-slate-100 transition-all"
                        >
                          Negotiate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

