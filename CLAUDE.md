# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal case interview tracker for a Consulting Manager at Accenture Bangkok preparing for BCG and Bain interviews. Web app replacing a Python CLI — phone + multi-device access via a bookmarked URL.

Single user now; schema includes `user_id` everywhere for future multi-user support without migration pain.

## Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (Postgres) with Row Level Security
- **Auth**: Supabase magic link (email, no passwords) + demo password gate
- **Charts**: Recharts
- **Theming**: next-themes (dark default, light toggle)
- **Deploy**: Vercel via GitHub

## Running locally

```
npm run dev       # start dev server on localhost:3000
npm run build     # production build
npm run lint      # ESLint
```

## Architecture

```
app/
  layout.tsx                — root layout (Inter font, Providers wrapper, BottomNav)
  page.tsx                  — redirect to /diagnostic
  providers.tsx             — next-themes ThemeProvider (defaultTheme="dark")
  gate/page.tsx             — password gate landing page (demo access)
  about/page.tsx            — placeholder ("Coming in Week 3")
  diagnostic/
    page.tsx                — performance diagnostic (server component, Recharts charts)
    DiagnosticCharts.tsx    — client component: 3 Recharts charts
  sessions/page.tsx         — filterable sessions list (server component)
  log/page.tsx              — log session form
  auth/callback/route.ts    — Supabase OAuth callback handler
  login/page.tsx            — magic link login form
  api/gate/check/route.ts   — POST: validates demo password, sets demo_access cookie

components/
  layout/
    BottomNav.tsx           — mobile tab bar; hidden on /gate and /about
    Header.tsx              — optional header with ThemeToggle
    ThemeToggle.tsx         — sun/moon SVG toggle (useTheme, mounted guard)
  sessions/
    SessionForm.tsx         — form with partner/case-type dropdowns, sliders, notes
    SessionTable.tsx        — filterable list with expandable score bars
  ui/
    Button.tsx              — forwardRef, primary/secondary/ghost, rounded (4px)
    Input.tsx               — forwardRef Input/Textarea/Select, rounded-md (6px)
    Card.tsx                — Card + CardHeader + CardBody, bg-surface border-divider
    Badge.tsx               — default/success/warning/danger variants
    Heading.tsx             — h1–h4 via `as` prop
    Text.tsx                — size xs/sm/base, muted boolean
    Skeleton.tsx            — animate-pulse loading placeholder
    ScoreSlider.tsx         — ScoreSlider (log form) + ScoreBar (session detail)

lib/
  supabase/
    client.ts               — browser Supabase client (singleton)
    server.ts               — server-side Supabase client (per-request cookies)
    middleware.ts           — session refresh logic
  queries/
    sessions.ts             — type-safe session CRUD
    partners.ts             — type-safe partner CRUD
  reports.ts                — drill-plan logic (ported from Python reports.py)

middleware.ts               — checks Supabase owner session OR demo_access cookie;
                              redirects to /gate if neither. Public routes: /gate,
                              /about, /api/gate, /auth, /login.

supabase/
  schema.sql                — DDL (do not modify)
  seed_dev.sql              — 30 dev sessions across 8 weeks (Mar–May 2026)
```

## v2 Design System

Dark mode by default. Aesthetic reference: Stripe Dashboard + Linear.

**CSS variables** (defined in `app/globals.css`, consumed by Tailwind):

| Token          | Dark value  | Light value |
|----------------|-------------|-------------|
| `bg-page`      | `#0A0A0B`   | `#FAFAF9`   |
| `bg-surface`   | `#141416`   | `#FFFFFF`   |
| `bg-surface-hover` | `#1C1C20` | `#F3F3F1` |
| `border-divider` | `#26262A` | `#E5E5E5`  |
| `text-primary` | `#FAFAF9`   | `#0A0A0B`   |
| `text-muted`   | `#8B8B93`   | `#737373`   |
| `text-accent`  | `#3B82F6`   | `#1E40AF`   |

**Tailwind config**: `darkMode: "class"`, custom color tokens map to these vars.
**Font**: Inter via `next/font` (`variable: "--font-inter"`, weights 400/500/700).
**Border radius**: 4px (`rounded`) for buttons, 6px (`rounded-md`) for cards/inputs.
**Motion**: no continuous animation; shake keyframe for wrong password; skeleton pulse for loading.

## Three user states

1. **Anonymous** → redirected to `/gate`
2. **Demo viewer** (valid `demo_access` cookie) → read-only access to all pages
3. **Owner** (Supabase session) → full access

Demo cookie is a SHA-256 hash of `demo_access_v1:${password}` computed with Web Crypto API (Edge-compatible). Cookie is httpOnly, 30-day maxAge.

## Schema

Three tables. All user-owned rows carry `user_id` referencing `auth.users`. RLS enabled on all tables.

**sessions** — one row per practice session. Scores 1–5 across five dimensions: structure, math, creativity, communication, data_analysis.

**partners** — lookup; `is_paid_coach` flag distinguishes Annika from peers.

**case_types** — static lookup (no `user_id`); shared across all users.

**RLS policies added for demo access** (run in Supabase SQL editor, not in schema.sql):
- `public read owner sessions` — allows anon reads where `user_id = OWNER_ID`
- `public read owner partners` — allows anon reads where `user_id = OWNER_ID`
- `anon can read case types` — allows anon reads on the static lookup

See `supabase/schema.sql` for DDL. Do not modify that file.

## Supabase project

ID: `wqltfxkfjyvvgumslvlb`
Owner UUID: `3b47bcbd-5cd7-4b0f-af46-78e1d54e3311` (hardcoded in `app/diagnostic/page.tsx`)

## Environment variables

Never commit `.env.local` or any file containing real keys.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DEMO_ACCESS_PASSWORD=          # password for the /gate demo access page
```

## Known type system quirk

postgrest-js v2 `RejectExcessProperties` breaks generic inference.
Fix: no `<Database>` generic on `createServerClient`/`createBrowserClient`.
Insert calls use `(supabase as any).from("sessions").insert(row)` with an explicit typed row variable.
Do not revert this pattern.

## Mobile-first

Design every component for a 375 px viewport first, then enhance for desktop with Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Bottom tab bar is the primary nav on mobile.

## Security

- RLS policies lock every row to `auth.uid() = user_id` — do not bypass with service-role keys in client code.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- All DB access from server components uses the server Supabase client; browser components use the anon client and rely on RLS.

## Legacy CLI (v1)

The original Python CLI lives in `legacy/`. It is not maintained but is kept for reference.
```
legacy/
  main.py
  tracker/db.py, models.py, reports.py, cli.py
  requirements.txt
```
