/**
 * HarvestHub API Service
 * Wraps Netlify serverless function calls.
 * In dev, Vite proxies /.netlify/* to the local dev server.
 */

const BASE = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'   // netlify dev
  : '/.netlify/functions'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// ── Crops ──────────────────────────────────────────────────────────────────
export interface CropFromAPI {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  location: string
  status: string
  images: string[]
  created_at: string
  profiles?: { name: string }
}

export async function fetchCropsFromAPI(): Promise<CropFromAPI[]> {
  const data = await apiFetch<{ success: boolean; crops: CropFromAPI[] }>('getCrops')
  return data.crops ?? []
}

// ── Demands ────────────────────────────────────────────────────────────────
export interface DemandFromAPI {
  id: string
  crop_name: string
  quantity: number
  budget: number
  location: string
  status: string
  merchant_id: string
  created_at: string
  profiles?: { name: string }
}

export async function fetchDemandsFromAPI(): Promise<DemandFromAPI[]> {
  const data = await apiFetch<{ success: boolean; demands: DemandFromAPI[] }>('getDemands')
  return data.demands ?? []
}

// ── Admin Stats ────────────────────────────────────────────────────────────
export interface AdminStats {
  totalFarmers: number
  totalMerchants: number
  totalCrops: number
  totalOrders: number
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const data = await apiFetch<{ success: boolean; stats: AdminStats }>('adminStats')
  return data.stats
}
