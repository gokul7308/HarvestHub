import React from "react"
import { Link } from "react-router-dom"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 font-sans p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl shadow-slate-200 border-2 border-slate-50">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Access Denied</h1>
        <p className="text-slate-500 font-medium leading-relaxed mb-10">
          You don't have the required permissions to view this section. Please contact your administrator if you think this is a mistake.
        </p>
        <Link to="/">
          <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all">
            <ArrowLeft size={18} /> Back to Safety
          </Button>
        </Link>
      </div>
    </div>
  )
}
