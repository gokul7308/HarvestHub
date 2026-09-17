import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/App.css'
import { UserProvider } from './contexts/UserContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { ListingProvider } from './contexts/ListingContext'
import { DemandProvider } from './contexts/DemandContext'
import { OrderProvider } from './contexts/OrderContext'
import { NegotiationProvider } from './contexts/NegotiationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from 'sonner'

import DashboardLayout from './layouts/DashboardLayout'
import LandingPage from './pages/LandingPage'
import OTPLogin from './pages/auth/OTPLogin'

const FarmerDashboard = React.lazy(() => import('./pages/FarmerDashboard'))
const MerchantDashboard = React.lazy(() => import('./pages/MerchantDashboard'))
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))
const MarketplacePage = React.lazy(() => import('./pages/MarketplacePage'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'))
const ListingsPage = React.lazy(() => import('./pages/ListingsPage'))
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'))
const SystemSettings = React.lazy(() => import('./pages/admin/SystemSettings'))
const FarmersPage = React.lazy(() => import('./pages/admin/FarmersPage'))
const MerchantsPage = React.lazy(() => import('./pages/admin/MerchantsPage'))
const AdminListingsPage = React.lazy(() => import('./pages/admin/AdminListingsPage'))
const RevenuePage = React.lazy(() => import('./pages/admin/RevenuePage'))
const MerchantDemandsPage = React.lazy(() => import('./pages/merchant/MerchantDemandsPage'))
const MerchantOrdersPage = React.lazy(() => import('./pages/merchant/MerchantOrdersPage'))

import { ProtectedRoute } from './components/ProtectedRoute'
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<OTPLogin />} />
      <Route path="/login" element={<OTPLogin />} />
      
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
                    <React.Suspense fallback={
                      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-[#1B5E20]/20 border-t-[#1B5E20] rounded-full animate-spin"></div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading HarvestHub...</p>
                        </div>
                      </div>
                    }>
                      <AppRoutes />
                    </React.Suspense>
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
