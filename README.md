# 🌾 HarvestHub

**AI-Powered Smart Agriculture Platform** — connecting Farmers, Merchants, and Market Intelligence.

> Built with React + TypeScript + Vite + Supabase + Netlify Functions

---

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/gokul7308/HarvestHub.git
cd HarvestHub
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```
Fill in your `.env` with:
```
VITE_SUPABASE_URL=https://vbyitwdmxjeadswsbutd.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key   # server-side only
```

### 3. Set Up Supabase Database
Run the SQL schema in your Supabase SQL Editor:
```
supabase_init.sql
```

### 4. Run Development Server
**Option A — Vite only (no Netlify functions)**
```bash
npm run dev
```
App available at `http://localhost:5173`

**Option B — With Netlify functions (full stack)**
```bash
npm run netlify:dev
```
App + functions available at `http://localhost:8888`

---

## 🏗️ Architecture

```
HarvestHub/
├── src/
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client (auth + DB)
│   │   └── api.ts              # Netlify function API service
│   ├── context/
│   │   ├── UserContext.tsx     # Auth session + role management
│   │   ├── ListingContext.tsx  # Crop listings (Supabase)
│   │   ├── DemandContext.tsx   # Sourcing demands (Supabase)
│   │   ├── OrderContext.tsx    # Orders (Supabase)
│   │   └── NegotiationContext.tsx # Offers / negotiations (Supabase)
│   └── pages/
│       ├── auth/OTPLogin.tsx   # Email OTP authentication
│       ├── FarmerDashboard.tsx
│       ├── MerchantDashboard.tsx
│       └── AdminDashboard.tsx
├── netlify/
│   └── functions/
│       ├── getCrops.js         # GET /crops (public)
│       ├── getDemands.js       # GET /demands (public)
│       └── adminStats.js       # Admin platform stats
├── netlify.toml                # Netlify build config
└── supabase_init.sql           # Full DB schema + RLS
```

---

## 🔐 Authentication

HarvestHub supports two login methods:

| Method | Route |
|--------|-------|
| Email + Password | `/auth` |
| Email OTP (magic code) | `/auth/otp` |

After login, users are redirected based on their role:
- **Farmer** → `/farmer`
- **Merchant** → `/merchant`
- **Admin** → `/admin`

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User identity + role |
| `crops` | Farmer crop listings |
| `demands` | Merchant sourcing requests |
| `orders` | Completed transactions |
| `offers` | Negotiation / price offers |

All tables have **Row Level Security (RLS)** enabled.

---

## ⚙️ Netlify Functions (Serverless Backend)

| Endpoint | Description |
|----------|-------------|
| `/.netlify/functions/getCrops` | Fetch active crop listings |
| `/.netlify/functions/getDemands` | Fetch open demands |
| `/.netlify/functions/adminStats` | Platform-wide admin statistics |

---

## 🌐 Deployment

### Netlify (Recommended)
1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

Or deploy manually:
```bash
npm run netlify:deploy
```

---

## 🛡️ Security

- ✅ RLS enabled on all Supabase tables
- ✅ `.env` excluded from Git
- ✅ Service role key only in server-side functions
- ✅ User data scoped per role

---

## 📝 License

MIT © 2026 HarvestHub
