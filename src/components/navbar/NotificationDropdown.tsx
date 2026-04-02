import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, ShoppingCart, TrendingUp, MapPin, Check, Trash2, BellOff } from "lucide-react"
import { useTranslation } from "react-i18next"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: 'order' | 'price' | 'demand'
  read: boolean
}

export function NotificationDropdown() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: t("notifications.interestWheat"),
      description: t("notifications.interestWheatDesc"),
      time: t("notifications.timeAgo", { duration: "2 mins" }),
      type: 'order',
      read: false
    },
    {
      id: '2',
      title: t("notifications.priceAlertRice"),
      description: t("notifications.priceAlertRiceDesc"),
      time: t("notifications.timeAgo", { duration: "1 hour" }),
      type: 'price',
      read: false
    },
    {
      id: '3',
      title: t("notifications.localDemandPosted"),
      description: t("notifications.localDemandPostedDesc"),
      time: t("notifications.timeAgo", { duration: "3 hours" }),
      type: 'demand',
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart size={16} className="text-[#1B5E20]" />
      case 'price': return <TrendingUp size={16} className="text-blue-600" />
      case 'demand': return <MapPin size={16} className="text-orange-500" />
      default: return <Bell size={16} className="text-slate-400" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900">{t("notifications.notifications")}</h3>
              <div className="flex gap-4">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] font-black uppercase tracking-widest text-[#1B5E20] hover:opacity-70 transition-opacity">
                    {t("notifications.markRead")}
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 flex gap-4 transition-colors hover:bg-slate-50 cursor-pointer ${notif.read ? 'opacity-70' : 'bg-[#F0FDF4]/30'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.type === 'order' ? 'bg-[#F0FDF4]' : notif.type === 'price' ? 'bg-blue-50' : 'bg-orange-50'
                      }`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                           <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{notif.title}</h4>
                           <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal line-clamp-2">{notif.description}</p>
                        <div className="flex gap-4 pt-1">
                           {!notif.read && (
                             <button 
                               onClick={(e) => markAsRead(notif.id, e)}
                               className="text-[10px] font-bold text-[#1B5E20] hover:underline flex items-center gap-1"
                             >
                               <Check size={10} /> {t("notifications.markRead")}
                             </button>
                           )}
                           <button 
                             onClick={(e) => removeNotification(notif.id, e)}
                             className="text-[10px] font-bold text-red-400 hover:text-red-500 flex items-center gap-1"
                           >
                              <Trash2 size={10} /> {t("notifications.remove")}
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                   <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <BellOff size={32} />
                   </div>
                   <p className="text-sm font-bold text-slate-500">{t("notifications.noNew")}</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                 <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                    {t("notifications.viewAllHistory")}
                 </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
