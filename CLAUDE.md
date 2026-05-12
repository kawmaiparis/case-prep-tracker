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
  layout.tsx                — root layout (Inter font, Providers wrapper, AppShell)
  page.tsx                  — redirect to /diagnostic
  providers.tsx             — next-themes ThemeProvider (defaultTheme="dark")
  gate/page.tsx             — password gate landing page (demo access)
  about/page.tsx            — placeholder
  diagnostic/
    page.tsx                — performance diagnostic (server component); computes all
                              chart data + analytical subtitles + Focus Area recs
    DiagnosticCharts.tsx    — client component: 7 Recharts charts + WeekStripCalendar;
                              exports ChartSubtitles type
  sessions/page.tsx         — filterable sessions list (server component)
  log/page.tsx              — log session form
  auth/callback/route.ts    — Supabase OAuth callback handler
  login/page.tsx            — magic link login form
  api/gate/check/route.ts   — POST: validates demo password, sets demo_access cookie

components/
  layout/
    AppShell.tsx            — client wrapper: sidebar collapse state + localStorage
                              persistence; syncs content paddingLeft with sidebar width
    SidebarNav.tsx          — collapsible desktop sidebar (w-14 / w-52) + mobile overlay
                              drawer; active state: cyan 3px left border + accent-bg tint
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

## v3 Design System

Dark mode by default. Aesthetic reference: neon analytics dashboard (Stripe + Linear + dark-mode chart tools).

**CSS variables** (defined in `app/globals.css`, consumed by Tailwind):

| Token               | Dark value            | Light value           |
|---------------------|-----------------------|-----------------------|
| `--bg`              | `#0A0A0F`             | `#FAFAFA`             |
| `--surface`         | `#14141B`             | `#FFFFFF`             |
| `--surface-elevated`| `#1F1F2A`             | `#F4F4F5`             |
| `--border`          | `#27272F`             | `#E4E4E7`             |
| `--text-primary`    | `#FAFAFA`             | `#18181B`             |
| `--text-muted`      | `#71717A`             | `#71717A`             |
| `--accent`          | `#06B6D4` (cyan)      | `#0891B2`             |
| `--positive`        | `#10F4B1` (mint)      | `#059669`             |
| `--warning`         | `#F43F5E` (coral red) | `#E11D48`             |
| `--highlight`       | `#A78BFA` (violet)    | `#7C3AED`             |

**5-series chart palette** (Dimension Trends): cyan → mint → coral → violet → amber. All unique.

**Color discipline**: `--warning` (coral) = weakest dimension bar, lowest case-type/industry bar. `--highlight` (violet) = Progress Over Time last dot only. `--accent` (cyan) = default positive metric color.

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

Design every component for a 375 px viewport first, then enhance for desktop with Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).

**Responsive breakpoints used:**
- `md:` (768px) — sidebar appears (hamburger hidden), KPI strip goes 2→4 cols, charts go 2-col
- `lg:` (1024px) — chart column ratios refine (5/7 and 7/5 splits)
- `xl:` (1280px) — diagnostic page max-width expands from `max-w-6xl` to `max-w-7xl`

**Navigation**: collapsible sidebar (AppShell + SidebarNav) is the primary nav. Mobile uses a hamburger button (fixed top-left) that opens a 64px overlay drawer. Bottom tab bar (BottomNav.tsx) is superseded in v3 — kept in repo but not used.

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

## Current Status (v3 — branch: diagnostic-v3-redesign)

**Completed:**
- V3-A: Collapsible sidebar (AppShell + SidebarNav) replaces BottomNav
- V3-B: Diagnostic page restructured to 12-column CSS grid
- V3-C: 7 charts — Skill Profile, Progress Over Time, Dimension Trends, Sessions/Week, By Case Type, By Industry, Session Calendar (WeekStripCalendar)
- Fix pass: coral red warning color, 5-series palette uniqueness, color discipline (violet max 2 uses), Focus Area analytical copy, week-strip calendar, data-driven chart subtitles
- V3-D: Responsive breakpoints (768/1024/1280), spacing tightened, CLAUDE.md updated

**Diagnostic page data flow:**
- Server component (`page.tsx`) fetches sessions, computes all chart data and `ChartSubtitles` in one pass
- Client component (`DiagnosticCharts.tsx`) receives data as props; owns theme-aware color resolution via `useChartColors()`
- Focus Area cards computed server-side: Top Priority gets 3px coral left border + warning-bg tint

**Not yet started:** Sessions page v3, Log page v3, Drills page v3
