import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock UserContext with controllable state
let mockUser: any = { id: '123', role: 'farmer', name: 'Test Farmer' };
let mockLoading = false;

vi.mock('../../src/contexts/UserContext', () => ({
  useUser: () => ({
    user: mockUser,
    loading: mockLoading
  })
}));

describe('RBAC Frontend Route Enforcement', () => {
  const renderWithRouter = (initialPath: string, allowedRoles?: ('farmer' | 'merchant' | 'admin')[]) => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/farmer" element={
            <ProtectedRoute allowedRoles={allowedRoles || ['farmer']}>
              <div>Farmer Dashboard View</div>
            </ProtectedRoute>
          } />
          <Route path="/merchant" element={
            <ProtectedRoute allowedRoles={allowedRoles || ['merchant']}>
              <div>Merchant Dashboard View</div>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={allowedRoles || ['admin']}>
              <div>Admin Control View</div>
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={<div>Access Denied View</div>} />
          <Route path="/auth" element={<div>Login View</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('allows farmer role to access farmer routes', () => {
    mockUser = { id: 'farmer-1', role: 'farmer', name: 'Ramesh' };
    mockLoading = false;
    renderWithRouter('/farmer', ['farmer']);
    expect(screen.getByText('Farmer Dashboard View')).toBeInTheDocument();
  });

  it('redirects farmer trying to access merchant routes to unauthorized', () => {
    mockUser = { id: 'farmer-1', role: 'farmer', name: 'Ramesh' };
    mockLoading = false;
    renderWithRouter('/merchant', ['merchant']);
    expect(screen.queryByText('Merchant Dashboard View')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied View')).toBeInTheDocument();
  });

  it('redirects merchant trying to access admin routes to unauthorized', () => {
    mockUser = { id: 'merchant-1', role: 'merchant', name: 'Kisan Traders' };
    mockLoading = false;
    renderWithRouter('/admin', ['admin']);
    expect(screen.queryByText('Admin Control View')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied View')).toBeInTheDocument();
  });

  it('allows admin role to access administrative views', () => {
    mockUser = { id: 'admin-1', role: 'admin', name: 'Platform Superadmin' };
    mockLoading = false;
    renderWithRouter('/admin', ['admin']);
    expect(screen.getByText('Admin Control View')).toBeInTheDocument();
  });

  it('redirects unauthenticated visitor to login route', () => {
    mockUser = null;
    mockLoading = false;
    renderWithRouter('/farmer', ['farmer']);
    expect(screen.queryByText('Farmer Dashboard View')).not.toBeInTheDocument();
    expect(screen.getByText('Login View')).toBeInTheDocument();
  });

  it('renders loading spinner while authentication state is resolving', () => {
    mockUser = null;
    mockLoading = true;
    renderWithRouter('/farmer', ['farmer']);
    expect(screen.queryByText('Farmer Dashboard View')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
