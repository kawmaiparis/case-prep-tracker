# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal case interview tracker for a Consulting Manager at Accenture Bangkok preparing for BCG and Bain interviews. Web app replacing a Python CLI — phone + multi-device access via a bookmarked URL.

Single user now; schema includes `user_id` everywhere for future multi-user support without migration pain.

## Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (Postgres) with Row Level Security
- **Auth**: Supabase magic link (email, no passwords)
- **Deploy**: Vercel via GitHub

## Running locally

```
npm run dev       # start dev server on localhost:3000
npm run build     # production build
npm run lint      # ESLint
```

## Architecture

```
app/                        — Next.js App Router pages and API routes
  layout.tsx                — root layout (font, providers, bottom nav)
  page.tsx                  — redirect to /dashboard or /login
  login/page.tsx            — magic link login form
  auth/callback/route.ts    — Supabase OAuth callback handler
  dashboard/page.tsx        — weak dimension, sessions this week, quick log CTA
  log/page.tsx              — log session form
  sessions/page.tsx         — filterable/sortable sessions list
  drills/page.tsx           — drill plan based on weakest dimension

components/
  layout/
    BottomNav.tsx           — mobile tab bar (Dashboard / Log / Sessions / Drills)
    Header.tsx
  sessions/
    SessionForm.tsx         — form with partner/case-type dropdowns, sliders, notes
    SessionTable.tsx        — filterable/sortable table
  dashboard/
    WeakDimCard.tsx
  ui/                       — reusable primitives (Button, Input, Slider, etc.)

lib/
  supabase/
    client.ts               — browser Supabase client (singleton)
    server.ts               — server-side Supabase client (per-request cookies)
    middleware.ts           — session refresh logic
  queries/
    sessions.ts             — type-safe session CRUD
    partners.ts             — type-safe partner CRUD
  reports.ts                — drill-plan logic (ported from Python reports.py)

middleware.ts               — auth guard: redirect unauthenticated users to /login
types/
  database.ts               — Supabase-generated or manual DB types
```

## Schema

Three tables. All user-owned rows carry `user_id` referencing `auth.users`. RLS enabled on all tables.

**sessions** — one row per practice session. Scores 1–5 across five dimensions: structure, math, creativity, communication, data_analysis (exhibit reading, finding insights).

**partners** — lookup for autocomplete; `is_paid_coach` flag distinguishes Annika from peers.

**case_types** — static lookup (no `user_id`); shared across all users.

See `supabase/schema.sql` for the full DDL.

## Practice partners (seed data)

Annika (paid coach), Robbie, Adam, Mix, Noon, Poomer (peers), and others ad hoc.

## Environment variables

See `.env.local.example`. Never commit `.env.local` or any file containing real keys.
Required vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Mobile-first

Design every component for a 375 px viewport first, then enhance for desktop with Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Bottom tab bar is the primary nav on mobile; a sidebar is acceptable on `lg:` and above.

## Security

- RLS policies lock every row to `auth.uid() = user_id` — do not bypass with service-role keys in client code.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- All DB access from server components uses the server Supabase client; browser components use the anon client and rely on RLS.

## Legacy CLI (v1)

The original Python CLI lives in `legacy/`. It is not maintained but is kept for reference while migrating data.
```
legacy/
  main.py
  tracker/db.py, models.py, reports.py, cli.py
  requirements.txt
```
