import '@testing-library/jest-dom';

// Ensure test runner provides deterministic mock Supabase parameters to prevent unhandled constructor throws
if (typeof process !== 'undefined') {
  process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://test-project.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key-placeholder';
}
