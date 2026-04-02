/**
 * utils/supabase/client.ts
 *
 * Browser-side Supabase client using @supabase/ssr's createBrowserClient.
 * This is the Vite/React equivalent of the Next.js client utility.
 * Use this in React components, hooks, and context providers.
 */
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

/**
 * Creates a Supabase browser client with cookie-based session handling.
 * @supabase/ssr automatically manages auth tokens in cookies for you.
 */
export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabaseKey!);
