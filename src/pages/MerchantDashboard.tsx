import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@/context/UserContext"
import { useDemand } from "@/context/DemandContext"
import { useNegotiations } from "@/context/NegotiationContext"
import { useNavigate } from "react-router-dom"
import { PostDemandModal } from "@/components/merchant/PostDemandModal"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ShoppingCart, TrendingUp, Handshake, Target, ArrowRight, Search, MapPin, Building2, ShoppingBag, Clock, CheckCircle2, XCircle } from "lucide-react"
import { marketplaceListings } from "@/data/mock"
import { useTranslation } from "react-i18next"

const categoryData = [
  { name: 'Wheat', value: 4000 },
  { name: 'Corn', value: 3000 },
  { name: 'Rice', value: 2000 },
  { name: 'Soy', value: 2780 },
  { name: 'Barley', value: 1890 },
]

export default function MerchantDashboard() {
  const { user } = useUser()
  const { t } = useTranslation()
  const { negotiations } = useNegotiations()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const myNegotiations = negotiations.filter(n => n.buyer_name === user?.name)
  const pendingCount = myNegotiations.filter(n => n.status === 'Pending').length

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-blue-600/10 selection:text-blue-600">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold font-poppins text-slate-900 tracking-tight">{t("merchant.portal")} 📈</h1>
          <p className="text-slate-500 mt-1 font-medium">{t("merchant.manageSupply")}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-600/20 text-white h-14 px-8 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
          <Target size={20} /> {t("merchant.postDemand")}
        </Button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all bg-white group border-2">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <ShoppingCart size={24} />
              </div>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t("merchant.totalPurchases")}</h3>
            <p className="text-4xl font-black mt-2 text-slate-900 font-poppins tracking-tighter">$142,500</p>
          </CardContent>
        </Card>

        <Card onClick={() => navigate("/merchant/orders")} className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all bg-white group border-2 cursor-pointer">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-[#F0FDF4] group-hover:text-[#1B5E20] transition-colors">
                <ShoppingBag size={24} />
              </div>
              <Badge className="bg-[#1B5E20] text-white border-0 font-black text-[9px] uppercase tracking-widest">2 {t("merchant.inTransit")}</Badge>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t("merchant.activeOrders")}</h3>
            <p className="text-4xl font-black mt-2 text-slate-900 font-poppins tracking-tighter">8</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-2xl relative overflow-hidden rounded-[32px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <TrendingUp size={24} />
              </div>
            </div>
            <h3 className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{t("merchant.estimatedRoi")}</h3>
            <p className="text-4xl font-black mt-2 font-poppins tracking-tighter">+18.4%</p>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all bg-white group border-2">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                <Handshake size={24} />
              </div>
              {pendingCount > 0 && <Badge className="bg-amber-100 text-amber-700 font-black text-[9px] uppercase tracking-widest border-0">{pendingCount} Pending</Badge>}
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t("merchant.pendingNegotiations")}</h3>
            <p className="text-4xl font-black mt-2 text-slate-900 font-poppins tracking-tighter">{myNegotiations.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid xl:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          {/* My Negotiations Section */}
          {myNegotiations.length > 0 && (
            <div>
              <h2 className="text-2xl font-black font-poppins text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                Your Negotiations
              </h2>
              <div className="grid gap-4">
                {myNegotiations.map(n => (
                  <Card key={n.id} className="rounded-3xl border-2 border-slate-50 bg-white shadow-sm overflow-hidden group hover:border-blue-100 transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${
                          n.status === 'Accepted' ? 'bg-green-50 text-green-600' :
                          n.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {n.status === 'Accepted' ? <CheckCircle2 size={24} /> :
                           n.status === 'Rejected' ? <XCircle size={24} /> :
                           <Clock size={24} />}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900">{n.crop_name}</h4>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seller: {n.seller_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Offer</div>
                          <div className="text-xl font-black text-blue-600 leading-none">{n.price}</div>
                        </div>
                        <Badge className={`${
                          n.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                          n.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        } font-black text-[9px] uppercase tracking-widest border-0 px-3 py-1.5`}>
                          {n.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Find */}
          <Card className="rounded-[40px] border-slate-100 shadow-xl p-2 bg-white border-2">
            <div className="flex items-center bg-slate-50/50 rounded-[32px] group focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-600/5 transition-all">
              <Search className="text-slate-300 ml-6 group-focus-within:text-blue-600 transition-colors" size={24} />
              <input 
                type="text" 
                placeholder={t("marketplace.searchPlaceholder")}
                className="flex-1 h-16 bg-transparent border-0 ring-0 focus:ring-0 px-6 text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none" 
              />
              <Button onClick={() => navigate('/marketplace')} className="m-2 rounded-[24px] bg-slate-900 hover:bg-black text-white px-10 h-12 font-black text-[10px] uppercase tracking-widest shadow-lg">
                {t("common.search")}
              </Button>
            </div>
          </Card>

          {/* Target Listings */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black font-poppins text-slate-900 tracking-tight">{t("merchant.recommendedDeals")}</h2>
              <button 
                onClick={() => navigate('/marketplace')}
                className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform"
              >
                {t("merchant.viewMarketplace")} <ArrowRight size={16} />
              </button>
            </div>
            
            <div className="grid gap-6">
              {marketplaceListings.slice(0, 3).map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="bg-white rounded-[32px] p-6 border-2 border-slate-50 flex flex-col sm:flex-row items-center gap-8 hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)] hover:border-slate-100 transition-all group cursor-pointer"
                >
                  <div className="w-full sm:w-40 h-32 rounded-[24px] overflow-hidden shrink-0 border-2 border-slate-50">
                    <img src={item.image} alt={item.cropName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                  </div>
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <h3 className="font-black text-xl text-slate-900 tracking-tight truncate leading-none mb-1">{item.cropName}</h3>
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-amber-500" /> {item.location}</span>
                            <span className="flex items-center gap-1.5"><Building2 size={12} className="text-blue-500" /> {item.farmerName}</span>
                          </div>
                       </div>
                       <div className="text-right shrink-0">
                         <div className="font-black text-2xl text-blue-600 tracking-tighter leading-none">{item.price}</div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{t("dashboard.quantity")}: {item.quantity}</div>
                       </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                       <Button onClick={() => navigate('/marketplace')} className="bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl flex-1 shadow-lg shadow-slate-200">
                         {t("marketplace.buyNow")}
                       </Button>
                       <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl text-slate-500 border-2 border-slate-50 hover:bg-slate-50 hover:border-slate-100 flex-1 transition-all">
                         {t("merchant.negotiate")}
                       </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        <div className="space-y-8">
          <Card className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] bg-white border-2 flex flex-col h-[400px]">
            <CardHeader className="p-8 border-b border-slate-50 shrink-0">
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none">{t("merchant.procurementBySpend")}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-10 flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc', rx: 20}} 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                    itemStyle={{ color: '#2563eb', fontWeight: '900', fontSize: '12px' }}
                    labelStyle={{ fontWeight: '900', color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[12, 12, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      <PostDemandModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
