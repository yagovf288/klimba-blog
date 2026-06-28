# Plano de Implementação: Painel Administrativo & Analytics Klimba Blog

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a secure Admin Panel (`/admin`) and a lightweight Analytics Tracking System using a dedicated `analytics` schema in Supabase.

**Architecture:** Create an Astro Middleware to intercept and authorize access to `/admin` routes using Supabase Auth. Build a client-side tracking script injected into the Layout to capture user context, events, and duration, pushing payloads to an Astro API handler (`/api/analytics/track`) that records events to the database.

**Tech Stack:** Astro SSR, React (for admin components/charts), Supabase (Auth + Analytics Schema), Tailwind CSS.

---

### Task 1: Analytics Database & Services Setup

**Files:**
- Create: `src/services/analyticsService.ts`

- [ ] **Step 1: Execute SQL Migration**
  Exponha a migration SQL do arquivo de design para o usuário executar no console do Supabase Editor SQL para criar o schema `analytics` e suas tabelas (`page_views`, `sessions`, `clicks`).

- [ ] **Step 2: Implement analyticsService.ts**
  Create `src/services/analyticsService.ts` to manage inserts into the `analytics` schema:
  ```typescript
  import { createClient } from '@supabase/supabase-js';
  // Connect to Supabase with schema 'analytics'
  const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'analytics' } });
  
  export const analyticsService = {
    async logPageView(data: any) { ... },
    async logSessionDuration(sessionId: string, duration: number) { ... },
    async logClick(data: any) { ... }
  };
  ```

---

### Task 2: Analytics API Routes & Client-Side Tracker

**Files:**
- Create: `src/pages/api/analytics/track.ts`
- Create: `src/components/AnalyticsTracker.astro`
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Create API Endpoint `/api/analytics/track`**
  Build an API handler in Astro to route incoming telemetry data (pageviews, heartbeats, clicks) to the `analyticsService`.

- [ ] **Step 2: Create AnalyticsTracker.astro Component**
  Write client-side javascript to check or generate a session ID (`sessionStorage.getItem('klimba_sid')`), send the pageview payload on load, bind click event listeners to track links/buttons, and setup a 15-second heartbeat interval to track page duration using `navigator.sendBeacon`.

- [ ] **Step 3: Inject Tracker into Layout.astro**
  Add `<AnalyticsTracker />` inside the main layout so it runs automatically on every page.

---

### Task 3: Admin Middleware & Authentication Gate

**Files:**
- Create: `src/middleware.ts`
- Create: `src/pages/admin/login.astro`

- [ ] **Step 1: Implement Astro Middleware**
  Create `src/middleware.ts` to check if a user is trying to access `/admin`. If so, check for a session token cookie. If not present or invalid, redirect to `/admin/login`.

- [ ] **Step 2: Create login.astro Page**
  Create a login page with a form (e.g. Email and Password) that calls Supabase Auth on submit. On success, store the session token in cookies and redirect to `/admin`.

---

### Task 4: Admin Panel Interface & Post Editor

**Files:**
- Create: `src/pages/admin/index.astro`
- Create: `src/pages/admin/new.astro`
- Create: `src/pages/admin/edit/[id].astro`
- Create: `src/pages/admin/logout.astro`

- [ ] **Step 1: Build Admin Dashboard (`src/pages/admin/index.astro`)**
  Display a list of posts with options to edit or delete, and query the `analytics` schema to render metric summaries (Total Views, Unique Visitors, Average Read Time).

- [ ] **Step 2: Build Post Editor Form (`src/pages/admin/new.astro` and `edit/[id].astro`)**
  Provide a form to create/edit blog posts in Supabase, using standard input controls and textarea for markdown article bodies.
