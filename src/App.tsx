import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './context/UserContext'
import { SettingsProvider } from './context/SettingsContext'
import { ListingProvider } from './context/ListingContext'
import { DemandProvider } from './context/DemandContext'
import { OrderProvider } from './context/OrderContext'
import { NegotiationProvider } from './context/NegotiationContext'
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'sonner'

import DashboardLayout from './layouts/DashboardLayout'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OTPLogin from './pages/auth/OTPLogin'
import FarmerDashboard from './pages/FarmerDashboard'
import MerchantDashboard from './pages/MerchantDashboard'
import AdminDashboard from './pages/AdminDashboard'
import MarketplacePage from './pages/MarketplacePage'
import SettingsPage from './pages/SettingsPage'
import ListingsPage from './pages/ListingsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SystemSettings from './pages/admin/SystemSettings'
import FarmersPage from './pages/admin/FarmersPage'
import MerchantsPage from './pages/admin/MerchantsPage'
import AdminListingsPage from './pages/admin/AdminListingsPage'
import RevenuePage from './pages/admin/RevenuePage'
import MerchantDemandsPage from './pages/merchant/MerchantDemandsPage'
import MerchantOrdersPage from './pages/merchant/MerchantOrdersPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, loading } = useUser()
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1B5E20]/20 border-t-[#1B5E20] rounded-full animate-spin"></div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Initializing HarvestHub...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/otp" element={<OTPLogin />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      <Route element={<DashboardLayout />}>
        <Route path="/farmer-dashboard" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/merchant-dashboard" element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <MerchantDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/merchant-dashboard/demands" element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <MerchantDemandsPage />
          </ProtectedRoute>
        } />

        <Route path="/merchant-dashboard/orders" element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <MerchantOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/system-settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SystemSettings />
          </ProtectedRoute>
        } />

        <Route path="/admin/farmers" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FarmersPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/merchants" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MerchantsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/listings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminListingsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/revenue" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <RevenuePage />
          </ProtectedRoute>
        } />

        <Route path="/marketplace" element={
          <ProtectedRoute>
             <MarketplacePage />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute>
             <AnalyticsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/listings" element={
          <ProtectedRoute>
             <ListingsPage />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
             <SettingsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/farmer/*" element={<Navigate to="/farmer-dashboard" />} />
        <Route path="/merchant/*" element={<Navigate to="/merchant-dashboard" />} />
        <Route path="/admin/*" element={<Navigate to="/admin-dashboard" />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: any) { console.error("HarvestHub Error Boundary:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-red-50 p-8 text-center font-sans">
          <div className="max-w-md bg-white rounded-3xl p-10 shadow-2xl shadow-red-100 border-2 border-red-50">
            <h1 className="text-4xl mb-4 font-black text-red-600">Something went wrong.</h1>
            <p className="text-slate-500 font-medium mb-6">The application failed to initialize. This is often caused by missing Supabase environment variables on Netlify.</p>
            <pre className="text-[10px] text-left bg-slate-50 p-4 rounded-xl overflow-auto border border-slate-100 mb-6 max-h-40">
              {this.state.error?.message}
            </pre>
            <button onClick={() => window.location.reload()} className="w-full h-12 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-100">Try Again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  React.useEffect(() => {
    console.log("🚀 HarvestHub Initializing...");
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <SettingsProvider>
            <ListingProvider>
              <DemandProvider>
                <OrderProvider>
                  <NegotiationProvider>
                    <BrowserRouter>
                      <AppRoutes />
                      <Toaster position="top-right" richColors theme="light" />
                    </BrowserRouter>
                  </NegotiationProvider>
                </OrderProvider>
              </DemandProvider>
            </ListingProvider>
          </SettingsProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
