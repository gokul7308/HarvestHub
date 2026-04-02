/// <reference types="node" />
/**
 * utils/supabase/middleware.ts
 *
 * In Next.js this runs on every request edge to refresh the user's
 * Supabase session cookie automatically.
 *
 * In Vite + React SPA, there is no server-side middleware — session
 * refresh is handled client-side by @supabase/ssr's createBrowserClient
 * and by our UserContext's onAuthStateChange listener.
 *
 * This file provides:
 *  1. A session refresh utility you can call inside Netlify functions.
 *  2. A React hook (useSessionRefresh) that mirrors what Next.js middleware
 *     does server-side, but runs in the browser.
 */
import { createBrowserClient } from "@supabase/ssr";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const supabaseUrl: string =
  (typeof import.meta !== "undefined"
    ? (import.meta as any).env?.VITE_SUPABASE_URL
    : process.env.VITE_SUPABASE_URL) ?? ""

const supabaseKey: string =
  (typeof import.meta !== "undefined"
    ? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
    : process.env.VITE_SUPABASE_ANON_KEY) ?? ""

/**
 * React hook — keeps the session alive and redirects unauthenticated users.
 * Drop into your router layout or App.tsx.
 *
 * @param protectedPaths - Array of path prefixes that require login
 *
 * @example
 * useSessionRefresh(['/farmer', '/merchant', '/admin'])
 */
export function useSessionRefresh(protectedPaths: string[] = []) {
  const navigate = useNavigate();

  useEffect(() => {
    const supabase = createBrowserClient(supabaseUrl, supabaseKey);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (
          !session &&
          protectedPaths.some(p => window.location.pathname.startsWith(p))
        ) {
          // Unauthenticated on a protected route → send to login
          navigate("/auth/otp", { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, protectedPaths]);
}

/**
 * Netlify function helper — checks and refreshes a session from request cookies.
 * Equivalent to what Next.js middleware does on the edge.
 *
 * @param cookieHeader - The raw Cookie header string from the request
 * @returns { user, supabase }
 */
export async function refreshSessionFromCookies(cookieHeader: string) {
  const { createServerClient } = await import("@supabase/ssr");

  const parsedCookies = cookieHeader
    .split(";")
    .map(c => c.trim().split("="))
    .filter(p => p.length === 2)
    .map(([name, value]) => ({ name: name.trim(), value: decodeURIComponent(value) }));

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => parsedCookies,
      setAll: () => {}, // Can't set cookies in a function response easily; handled by client
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  return { user, supabase };
}
