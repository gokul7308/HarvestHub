import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserProvider } from './UserContext';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock the UserContext hook
vi.mock('./UserContext', async () => {
  const actual = await vi.importActual('./UserContext');
  return {
    ...actual,
    useUser: vi.fn(),
  };
});

import { useUser } from './UserContext';

describe('ProtectedRoute', () => {
  it('should show loading spinner when loading', () => {
    (useUser as any).mockReturnValue({ loading: true, user: null });
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('should render children if user has allowed role', () => {
    (useUser as any).mockReturnValue({ loading: false, user: { role: 'farmer' } });
    
    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['farmer']}>
          <div data-testid="protected-content">Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeDefined();
  });

  it('should redirect if user does not have allowed role', () => {
    (useUser as any).mockReturnValue({ loading: false, user: { role: 'merchant' } });
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <div data-testid="protected-content">Content</div>
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={<div data-testid="unauthorized">Unauthorized</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.getByTestId('unauthorized')).toBeDefined();
  });
});
