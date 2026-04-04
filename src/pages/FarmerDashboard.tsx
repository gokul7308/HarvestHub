import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@/context/UserContext"
import { useListings } from "@/context/ListingContext"
import { useNegotiations } from "@/context/NegotiationContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CloudRain, Leaf, TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Activity, MapPin, Plus, ShoppingBag, Check, X as CloseIcon, Handshake } from "lucide-react"
import { Listing } from "@/types/listing"
import { EditListingModal } from "@/components/crops/EditListingModal"
import { AddCropModal } from "@/components/crops/AddCropModal"
import { OffersModal } from "@/components/offers/OffersModal"
import { useTranslation } from "react-i18next"
import { getCropForecast, CropKey } from "@/lib/forecast"
import { useNavigate } from "react-router-dom"

export default function FarmerDashboard() {
  const { user } = useUser()
  const { listings } = useListings()
  const { negotiations, acceptNegotiation, rejectNegotiation } = useNegotiations()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [addingCrop, setAddingCrop] = useState(false)
  const [viewingOffers, setViewingOffers] = useState<Listing | null>(null)

  const [selectedCrop, setSelectedCrop] = useState<CropKey>('wheat')
  const forecast = useMemo(() => getCropForecast(selectedCrop), [selectedCrop])

  const pendingNegotiations = negotiations.filter(n => n.status === 'Pending' && n.seller_name === user?.name)

  const formatCurrency = (value: number) => `$${value}`

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-[#1B5E20]/30 selection:text-[#1B5E20]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold font-poppins text-slate-900 tracking-tight">
            {t("dashboard.welcomeBack")}, {user?.name.split(' ')[0]} 🌱
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 font-medium">{t("dashboard.summary")}</p>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/marketplace')}
              className="text-[#1B5E20] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 h-8 px-4 hover:bg-[#F0FDF4] rounded-full transition-all"
            >
              View Marketplace <ArrowRight size={14} />
            </Button>
          </div>
        </div>
        <Button 
          className="bg-[#1B5E20] hover:bg-[#144917] rounded-2xl shadow-xl shadow-[#1B5E20]/20 text-white h-14 px-8 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          onClick={() => setAddingCrop(true)}
        >
          <Plus size={20} /> {t("dashboard.addNewCrop")}
        </Button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white border-0 shadow-2xl relative overflow-hidden rounded-[32px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <TrendingUp size={24} />
              </div>
              <Badge className="bg-white text-[#1B5E20] border-0 font-black text-[10px] flex items-center gap-1 shadow-xl px-2.5 py-1">
                +12% <ArrowRight size={12} className="-rotate-45" />
              </Badge>
            </div>
            <h3 className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{t("dashboard.estimatedCropValue")}</h3>
            <p className="text-4xl font-black mt-2 font-poppins tracking-tighter">$42,500</p>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all bg-white group border-2">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-[#F0FDF4] group-hover:text-[#1B5E20] transition-colors">
                <Leaf size={24} />
              </div>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t("dashboard.activeCrops")}</h3>
            <p className="text-4xl font-black mt-2 text-slate-900 font-poppins tracking-tighter">{listings.length} <span className="text-xs text-slate-300 font-black uppercase tracking-widest">{t("dashboard.fields")}</span></p>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all bg-white group border-2">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <CloudRain size={24} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm animate-pulse">{t("dashboard.rainExpected")}</span>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t("dashboard.localWeather")}</h3>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-4xl font-black text-slate-900 font-poppins tracking-tighter">72°F</p>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">60% {t("dashboard.humidity")}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">2mm {t("dashboard.precip")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all bg-white group border-2">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-[#00E676]/10 group-hover:text-[#1B5E20] transition-colors">
                <Activity size={24} />
              </div>
              {pendingNegotiations.length > 0 && (
                <Badge className="bg-amber-100 text-amber-700 font-black text-[9px] uppercase tracking-widest border-0">
                  {pendingNegotiations.length} Pending
                </Badge>
              )}
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t("dashboard.marketDemand")}</h3>
            <p className="text-4xl font-black mt-2 text-[#1B5E20] font-poppins tracking-tighter uppercase">{pendingNegotiations.length > 3 ? 'High' : 'Normal'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] bg-white border-2 flex flex-col">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 border-b border-slate-50 gap-4">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none flex border-b-transparent gap-3 items-center">
                  {t("dashboard.cropPriceForecast")}
                  <Badge className={forecast.trendDirection === 'Increasing' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {forecast.trendDirection === 'Increasing' ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                    {forecast.trendDirection}
                  </Badge>
                  <Badge className="bg-blue-50 text-blue-600 ml-2">Conf: {forecast.confidence}</Badge>
                </CardTitle>
                <p className="text-sm text-slate-400 mt-2 font-medium">{t("dashboard.predictedSellingPrices")}</p>
              </div>
              <select 
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value as CropKey)}
                className="border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2.5 outline-none focus:bg-white focus:border-[#1B5E20] transition-all cursor-pointer"
              >
                <option value="wheat">Wheat</option>
                <option value="tomato">Tomato</option>
                <option value="soybean">Soybean</option>
                <option value="rice">Rice</option>
                <option value="corn">Corn</option>
              </select>
            </CardHeader>
            <CardContent className="p-8 flex-1 flex flex-col">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">All prices are per kilogram ($/kg)</p>
              <div style={{ height: "300px", width: "100%" }} className="mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1B5E20" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                      tickFormatter={formatCurrency}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value: any, name: any) => [`$${value} / kg`, name === "historicalPrice" ? "Historical Price ($/kg)" : "Predicted Price ($/kg)"]}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                      itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                      labelStyle={{ fontWeight: '900', color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-bold text-slate-500 ml-1">{value === "historicalPrice" ? "Historical Price ($/kg)" : "Predicted Price ($/kg)"}</span>}
                    />
                    <Area type="monotone" name="historicalPrice" dataKey="historicalPrice" stroke="#1B5E20" strokeWidth={4} fillOpacity={1} fill="url(#colorHistorical)" />
                    <Area type="monotone" name="predictedPrice" dataKey="predictedPrice" stroke="#eab308" strokeWidth={4} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pending Negotiations Section */}
          {pendingNegotiations.length > 0 && (
            <div>
              <h2 className="text-2xl font-black font-poppins text-slate-900 tracking-tight mb-6">Pending Negotiations</h2>
              <div className="grid gap-4">
                {pendingNegotiations.map(n => (
                  <Card key={n.id} className="rounded-3xl border-2 border-amber-100 bg-amber-50/20 overflow-hidden">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                          <Handshake size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900">{n.crop_name}</h4>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Offer from {n.buyer_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proposed Price</div>
                          <div className="text-xl font-black text-[#1B5E20] leading-none">{n.price}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" onClick={() => acceptNegotiation(n.id, n.crop_id)} className="bg-[#1B5E20] hover:bg-[#144917] h-10 w-10 rounded-xl shadow-lg shadow-[#1B5E20]/10">
                            <Check size={18} />
                          </Button>
                          <Button size="icon" onClick={() => rejectNegotiation(n.id)} variant="ghost" className="bg-red-50 text-red-500 hover:bg-red-100 h-10 w-10 rounded-xl">
                            <CloseIcon size={18} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Insights & Alerts */}
        <div className="space-y-8">
          <Card className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] bg-white border-2">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.8)] animate-pulse"></div> 
                {t("dashboard.aiRecommendations")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="p-5 rounded-3xl bg-[#F0FDF4] border border-[#1B5E20]/10 flex gap-4 items-start shadow-sm hover:shadow-md transition-all">
                <div className="bg-[#1B5E20] text-white p-2.5 rounded-xl shadow-lg shadow-[#1B5E20]/20 shrink-0"><TrendingUp size={18} /></div>
                <div>
                  <h4 className="font-black text-[#1B5E20] text-sm tracking-tight mb-1">{t("dashboard.holdWheatSales")}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{t("dashboard.predictedSurge")}</p>
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4 items-start shadow-sm hover:shadow-md transition-all">
                <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-lg shadow-amber-500/20 shrink-0"><AlertTriangle size={18} /></div>
                <div>
                  <h4 className="font-black text-amber-900 text-sm tracking-tight mb-1">{t("dashboard.irrigationFocus")}</h4>
                  <p className="text-xs text-amber-700 leading-relaxed font-medium">{t("dashboard.criticalDrySpell")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Crops List */}
      <div className="pt-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black font-poppins text-slate-900 tracking-tight">{t("dashboard.myListedCrops")}</h2>
          <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-[#1B5E20] hover:bg-[#F0FDF4] rounded-full px-6">{t("dashboard.viewAll")}</Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {listings.map((crop, i) => {
              const pendingOffers = crop.offers.filter(o => o.status === 'Pending').length;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                  key={crop.id}
                >
                  <Card className="overflow-hidden border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all group rounded-[40px] bg-white h-full flex flex-col border-2">
                    <div className="h-48 overflow-hidden relative cursor-pointer" onClick={() => setEditingListing(crop)}>
                      <img src={crop.images[0]} alt={crop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        <Badge className={`shadow-xl font-black text-[9px] uppercase tracking-widest px-3 py-1.5 border-none ${crop.status === 'Draft' ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-900'}`}>{crop.status}</Badge>
                        {pendingOffers > 0 && (
                          <Badge className="bg-[#00E676] text-[#1B5E20] px-3 py-1.5 shadow-xl font-black text-[9px] uppercase tracking-widest border-none animate-pulse">
                             {pendingOffers} {t("dashboard.newOffers")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-black text-xl text-slate-900 tracking-tight leading-none truncate pr-4">{crop.name}</h3>
                        <div className="flex flex-col items-end">
                           <span className="font-black text-[#1B5E20] text-xl tracking-tighter">${crop.price.toFixed(2)}</span>
                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">{t("dashboard.perUnit", { unit: crop.unit })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-4 mb-8">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><MapPin size={14} className="text-amber-500" /> <span className="truncate w-24 text-slate-900">{crop.location}</span></span>
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><ShoppingBag size={14} className="text-[#1B5E20]" /> <span className="text-slate-900">{crop.quantity} {crop.unit}</span></span>
                      </div>
                      <div className="flex gap-4 mt-auto pt-8 border-t border-slate-50">
                        <Button variant="outline" className="flex-1 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest border-2 border-slate-50 text-slate-500 hover:bg-slate-50 transition-all" onClick={() => setEditingListing(crop)}>
                          {t("dashboard.editListing")}
                        </Button>
                        <Button className="flex-1 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-black transition-all shadow-xl shadow-slate-200" onClick={() => setViewingOffers(crop)}>
                          {t("dashboard.viewOffers")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Editing Modal */}
      <EditListingModal 
        listing={editingListing} 
        isOpen={!!editingListing} 
        onClose={() => setEditingListing(null)} 
      />

      {/* Offers Modal */}
      <OffersModal 
        listing={viewingOffers}
        isOpen={!!viewingOffers}
        onClose={() => setViewingOffers(null)}
      />

      {/* Adding Modal */}
      <AddCropModal 
        isOpen={addingCrop}
        onClose={() => setAddingCrop(false)}
      />

    </div>
  )
}
