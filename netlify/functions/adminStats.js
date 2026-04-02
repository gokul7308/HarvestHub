const { createClient } = require('@supabase/supabase-js')

// Admin-level Supabase client (uses service key stored only server-side)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    // Fetch platform-wide stats for admin dashboard
    const [
      { count: totalFarmers },
      { count: totalMerchants },
      { count: totalCrops },
      { count: totalOrders },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'merchant'),
      supabase.from('crops').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
    ])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        stats: {
          totalFarmers,
          totalMerchants,
          totalCrops,
          totalOrders,
        }
      }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message }),
    }
  }
}
