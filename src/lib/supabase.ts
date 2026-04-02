/**
 * src/lib/supabase.ts
 *
 * Single export point for the Supabase client used throughout the app.
 * Points to the @supabase/ssr browser client in utils/supabase/client.ts.
 *
 * Usage in React components/contexts:
 *   import { supabase } from '@/lib/supabase'
 *
 * For Netlify functions, import from utils/supabase/server.ts directly.
 */
import { createClient } from "@/utils/supabase/client";

// Singleton browser client — safe to share across the whole React app.
export const supabase = createClient();
