import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test rendering error');
};

describe('React Error Boundary', () => {
  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Normal Content</div>
      </ErrorBoundary>
    );
    expect(getByText('Normal Content')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    // Suppress console.error for this expected error throw
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(getByText('Something went wrong')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
