/// <reference types="node" />
/**
 * utils/supabase/server.ts
 *
 * In Next.js, this file uses `next/headers` to create a server-side
 * Supabase client. Since this is a Vite React SPA (no server), we
 * export a lightweight server-compatible helper for use in Netlify
 * serverless functions and any Node.js contexts.
 *
 * For React components, use `utils/supabase/client.ts` instead.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const supabaseUrl: string =
  (process.env.VITE_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL) ?? ""

const supabaseKey: string =
  (process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) ?? ""

/**
 * Creates a server-side Supabase client.
 * Call from Netlify Functions, Node scripts, or any non-browser context.
 *
 * Accepts a simple cookie store interface — pass your request/response
 * cookie handles here, just like the Next.js pattern.
 *
 * @param cookieStore - Object with getAll() and setAll() cookie methods
 */
export const createClient = (cookieStore: {
  getAll: () => { name: string; value: string }[];
  set: (name: string, value: string, options?: CookieOptions) => void;
}) => {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a context where cookies cannot be set (read-only).
          // This is safe to ignore when session refresh middleware handles it.
        }
      },
    },
  });
};

/**
 * Simplified factory — no cookie store required.
 * Useful for Netlify functions that don't need session tracking.
 */
export const createServiceClient = () =>
  createServerClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_KEY ?? supabaseKey,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
