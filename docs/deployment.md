# Deployment Guide

## Supabase (Database + Auth)

1. Create a project at https://supabase.com
2. In **SQL Editor**, run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/seed/001_foods.sql`
   - `supabase/seed/002_aliases.sql`
3. In **Authentication > Settings**:
   - Set **Site URL** to your Vercel frontend URL
   - Enable **Email** provider
   - Disable **Confirm email** if you want immediate access after invite (or keep enabled)
4. In **Storage**, create a bucket named `food-images` with public access.
5. Copy your **Project URL**, **Anon Key**, and **Service Role Key** from Settings > API.

## Backend — Render

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Settings:
   - **Root directory**: `apps/api`
   - **Build command**: `npm install && npm run build`
   - **Start command**: `npm start`
   - **Node version**: 18
4. Add all environment variables from `apps/api/.env.example`
5. Set `FRONTEND_URL` to your Vercel URL

## Frontend — Vercel

1. Import the repository in [Vercel](https://vercel.com)
2. Settings:
   - **Root directory**: `apps/web`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Node version**: 18
3. Add environment variables:
   - `VITE_API_BASE_URL` → your Render backend URL + `/api`
   - `VITE_SUPABASE_URL` → Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → Supabase anon key
4. Deploy and copy the URL
5. Go back to Render backend and update `FRONTEND_URL` to the Vercel URL
6. Go to Supabase Auth Settings and update **Site URL** to the Vercel URL
