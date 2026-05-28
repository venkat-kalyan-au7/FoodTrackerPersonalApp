# 🍛 Personal Indian Food Calorie Tracker

A mobile-first, invite-only calorie tracking web app focused on Indian and South Indian cuisine.

## Features

- 🔒 Invite-only access (admin sends email invitations via Supabase Auth)
- 🍲 50+ pre-loaded Indian/South Indian foods with NIN-reference calories
- 🔍 6-tier food search (personal recipes → favourites → recents → global catalogue → aliases → USDA fallback)
- 🤖 Optional AI food normalization (Telugu/regional names → English) via Gemini
- 📖 Custom recipe builder with per-100g and per-serving calorie calculation
- 📊 Daily dashboard with meal breakdown and calorie progress
- ⭐ Favourites and recent foods
- 📱 PWA installable on mobile
- 🛡️ Row-Level Security (RLS) — every user sees only their own data

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, TanStack Query, React Hook Form |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI (optional) | Google Gemini 2.5 Flash Lite |
| Deployment | Vercel (frontend), Render (backend), Supabase free tier |

## Project Structure

```
calorie-tracker/
├── apps/
│   ├── api/          # Express backend
│   └── web/          # React frontend
├── packages/
│   └── shared/       # Shared TypeScript types, Zod schemas, constants
└── supabase/
    ├── migrations/   # SQL schema + RLS policies
    └── seed/         # Indian food catalogue + aliases
```

## Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/venkat-kalyan-au7/FoodTrackerPersonalApp.git
cd FoodTrackerPersonalApp
npm install
```

### 2. Configure backend environment

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in `apps/api/.env`:

```env
PORT=4000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
USDA_FDC_API_KEY=your-usda-key        # optional — get from https://fdc.nal.usda.gov/api-key-signup
ENABLE_AI_FOOD_MATCHING=false          # set true if you have Gemini key
GEMINI_API_KEY=                        # optional
```

### 3. Configure frontend environment

```bash
cp apps/web/.env.example apps/web/.env
```

Fill in `apps/web/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up Supabase database

In your Supabase project, go to **SQL Editor** and run in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/seed/001_foods.sql`
4. `supabase/seed/002_aliases.sql`

### 5. Create your admin user

In Supabase **Authentication > Users**, create your account manually (or use the invite flow after setting up the first admin). Then in **SQL Editor**:

```sql
UPDATE profiles SET role = 'ADMIN' WHERE id = 'your-user-uuid';
```

### 6. Run the app

```bash
npm run dev
```

This starts both the backend (port 4000) and frontend (port 5173) concurrently.

Open http://localhost:5173 in your browser.

## Deployment

See [docs/deployment.md](docs/deployment.md) for full deployment instructions.

## Environment Variables Reference

### Backend (`apps/api/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default 4000) |
| `FRONTEND_URL` | Yes | CORS origin for frontend |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (admin ops only) |
| `USDA_FDC_API_KEY` | No | USDA FoodData Central API key (food fallback search) |
| `ENABLE_AI_FOOD_MATCHING` | No | `true`/`false` — enable Gemini AI (default false) |
| `GEMINI_API_KEY` | If AI enabled | Google Gemini API key |
| `AI_MODEL` | No | Gemini model for normalization (default `gemini-2.5-flash-lite`) |
| `AI_ADVANCED_MODEL` | No | Gemini model for recipe extraction (default `gemini-2.5-flash`) |

### Frontend (`apps/web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API base URL |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key |

## License

Private — personal use only.
