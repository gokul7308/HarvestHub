import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vbyitwdmxjeadswsbutd.supabase.co'
const supabaseAnonKey = 'sb_publishable_yhgC5FWe4FZ6zL-gF-wEIA_nxPpGcCx'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
