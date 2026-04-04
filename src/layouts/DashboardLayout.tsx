import React from "react"
import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { useUser } from "@/context/UserContext"
import { LayoutDashboard, Store, LineChart, List, Settings, LogOut, Menu, Search, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { LanguageDropdown } from "@/components/navbar/LanguageDropdown"
import { NotificationDropdown } from "@/components/navbar/NotificationDropdown"

export default function DashboardLayout() {
  const { user, logout } = useUser()
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  if (!user) {
    return <div>{t("nav.redirecting")}</div> 
  }

  const navItems = [
    { label: t("nav.dashboard"), href: `/${user.role}-dashboard`, icon: LayoutDashboard },
    { label: t("nav.marketplace"), href: "/marketplace", icon: Store },
    { label: t("nav.analytics"), href: "/analytics", icon: LineChart },
    { label: user.role === 'merchant' ? "Active Orders" : "Listings", href: user.role === 'merchant' ? "/merchant-dashboard/orders" : "/listings", icon: List },
    ...(user.role === 'merchant' ? [{ label: "My Demands", href: "/merchant-dashboard/demands", icon: Target }] : []),
    { label: t("nav.settings"), href: "/settings", icon: Settings },
  ]

  return (
    <div className="flex bg-slate-50 dark:bg-gradient-to-br dark:from-[#020617] dark:via-[#07122a] dark:to-[#0a1f3d] min-h-screen text-slate-900 dark:text-slate-100 selection:bg-[#1B5E20]/30 selection:text-[#1B5E20] font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 dark:backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-[0_0_30px_rgba(0,230,118,0.05)] transition-transform duration-300 transform",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-20 items-center border-b border-gray-50 dark:border-white/10 px-8">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105 group">
            <div className="bg-[#1B5E20] text-white p-2 rounded-2xl shadow-lg shadow-[#1B5E20]/20 flex items-center justify-center transition-all group-hover:rotate-12">
              <Store size={24} />
            </div>
            <div className="flex flex-col -gap-1">
               <span className="text-2xl font-black font-poppins tracking-tighter text-[#1B5E20] dark:text-[#00E676]">HARVESTHUB</span>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mt-0.5">Agriculture v1.0</span>
            </div>
          </Link>
        </div>

        <div className="p-5 flex flex-col h-[calc(100vh-80px)]">
          <div className="space-y-1.5 mb-auto">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-4 mb-4">{t("nav.mainMenu")}</div>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group",
                  isActive 
                    ? "bg-[#1B5E20] text-white shadow-[#1B5E20]/30 shadow-xl border-l-[4px] border-[#00E676] dark:bg-green-500/10 dark:shadow-[0_0_30px_rgba(0,230,118,0.15)] dark:border-[#00E676] dark:text-[#00E676]" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <item.icon size={20} className={cn("transition-transform group-hover:scale-110", location.pathname === item.href ? "text-[#00E676]" : "")} />
                {item.label}
              </NavLink>
            ))}
          </div>
          
          <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
             <button 
                onClick={logout}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
              >
                <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
                {t("nav.logout")}
              </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 relative min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-white/5 dark:backdrop-blur-xl border-b border-gray-100 dark:border-white/10 h-20 flex items-center justify-between px-8 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            {((location.pathname === "/marketplace" || location.pathname.startsWith("/merchant")) && 
              !["/farmer", "/merchant", "/admin"].includes(location.pathname)) && (
              <div className="hidden md:flex relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400 group-focus-within:text-[#1B5E20]" />
                </div>
                <input 
                  type="text"
                  placeholder={t("nav.searchResources")}
                  className="pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl w-[350px] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 transition-all font-medium text-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
             <LanguageDropdown />
             <NotificationDropdown />
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10 mx-2"></div>
            <div 
              className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-1.5 pr-4 rounded-full border border-gray-100 dark:border-white/10 hover:shadow-[0_0_20px_rgba(0,230,118,0.1)] dark:hover:shadow-[0_0_20px_rgba(0,230,118,0.15)] transition-all cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=1B5E20&color=fff`}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-transparent"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-white/60 uppercase tracking-wider mt-1">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 pb-32 animate-fade-in mx-auto max-w-7xl">
           <Outlet />
        </div>
      </main>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 dark:bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-colors duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
