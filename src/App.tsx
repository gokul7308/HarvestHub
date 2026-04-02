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

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, loading } = useUser()
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1B5E20]/20 border-t-[#1B5E20] rounded-full animate-spin"></div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Initializing HarvesttHub...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      
      <Route element={<DashboardLayout />}>
        <Route path="/farmer" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/merchant" element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <MerchantDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/merchant/demands" element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <MerchantDemandsPage />
          </ProtectedRoute>
        } />

        <Route path="/merchant/orders" element={
          <ProtectedRoute allowedRoles={['merchant']}>
            <MerchantOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
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
        
        <Route path="/farmer/*" element={<Navigate to="/farmer" />} />
        <Route path="/merchant/*" element={<Navigate to="/merchant" />} />
        <Route path="/admin/*" element={<Navigate to="/admin" />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
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
  )
}

export default App
