# Klimba Blog SSR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Klimba blog from a React SPA (HashRouter) into a high-performance Astro SSR website deployed on Cloudflare Pages, reading posts from Supabase as a CMS.

**Architecture:** Build with Astro in Server-Side Rendering (SSR) mode using the Cloudflare Pages adapter. Port core UI components to Astro/HTML to eliminate client-side JavaScript overhead for SEO. Query Supabase directly on the server for each page request using secure runtime environment variables.

**Tech Stack:** Astro, Tailwind CSS, TypeScript, Supabase JS SDK, Cloudflare Pages/Workers.

---

### Task 1: Setup Astro and Project Dependencies

**Files:**
- Modify: `package.json`
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `src/env.d.ts`
- Create: `tsconfig.json`

- [ ] **Step 1: Update package.json dependencies**
  Modify dependencies to include Astro, `@astrojs/cloudflare`, `@astrojs/tailwind`, `@astrojs/react`, and React 19. Ensure `scripts` are updated for Astro.
  
- [ ] **Step 2: Create astro.config.mjs**
  Create `astro.config.mjs` configuring server mode with the `@astrojs/cloudflare` adapter and `@astrojs/tailwind` integration:
  ```javascript
  import { defineConfig } from 'astro/config';
  import cloudflare from '@astrojs/cloudflare';
  import tailwind from '@astrojs/tailwind';

  export default defineConfig({
    output: 'server',
    adapter: cloudflare(),
    integrations: [tailwind()]
  });
  ```

- [ ] **Step 3: Create tailwind.config.mjs**
  Define the Klimba theme parameters: colors (`primary`, `secondary`, etc.), typography (Plus Jakarta Sans, Manrope), and border-radius styles matching the original branding.

- [ ] **Step 4: Create src/env.d.ts**
  ```typescript
  /// <reference types="astro/client" />
  ```

- [ ] **Step 5: Configure tsconfig.json**
  Update `tsconfig.json` to extend `astro/tsconfigs/strict`.

- [ ] **Step 6: Run local build test**
  Verify configuration compiles via `npm run build`.

---

### Task 2: Supabase Integration & blogService Setup

**Files:**
- Create: `src/types.ts` (copy and refine from root `types.ts`)
- Create: `src/services/blogService.ts` (adapted for SSR and environmental variables)

- [ ] **Step 1: Create src/types.ts**
  Ensure correct types for `BlogPost`, `Category`, `Author`, and `PageInfo` are established.

- [ ] **Step 2: Create src/services/blogService.ts**
  Replace standard Web browser variables with Astro's server env:
  ```typescript
  import { createClient } from '@supabase/supabase-js';
  const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_KEY || process.env.SUPABASE_KEY;
  // Initialize supabase client
  ```
  Implement `getAllPosts`, `getPostBySlug`, `getAuthorById`, and `getPostsByCategory` fetching from Supabase with proper error boundaries.

- [ ] **Step 3: Validate database connection compile**
  Confirm the compiler resolves all types and env parameters.

---

### Task 3: Base Layout & Layout Components (Header/Footer)

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create Header.astro**
  Port the Header markup from `components/Layout.tsx` using Astro components. Leverage CSS variables or Tailwind for the Klimba colors.

- [ ] **Step 2: Create Footer.astro**
  Port the Footer markup from `components/Layout.tsx` using Astro components, including dynamic current year rendering.

- [ ] **Step 3: Create Layout.astro**
  Create the master HTML layout. Receive title, description, and preview image as props (`Astro.props`) to dynamically output HTML meta tags (OpenGraph, Twitter Cards, SEO canonical URLs) directly in SSR. Ensure Tailwind utility classes and fonts are imported.

---

### Task 4: Porting Pages (Index/Home & Dynamic Post Routing)

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/pages/post/[slug].astro`

- [ ] **Step 1: Implement Dynamic Post Pages (`src/pages/post/[slug].astro`)**
  Create dynamic routing with dynamic slug parsing:
  ```astro
  ---
  import Layout from '../../layouts/Layout.astro';
  import { blogService } from '../../services/blogService';
  const { slug } = Astro.params;
  const post = await blogService.getPostBySlug(slug);
  if (!post) return Astro.redirect('/404');
  const author = await blogService.getAuthorById(post.authorId);
  ---
  ```
  Ensure visual rendering matches the premium style of `PostPage.tsx` with optimized HTML/CSS.

- [ ] **Step 2: Implement Home Page (`src/pages/index.astro`)**
  Render the homepage layout in Astro. Parse query parameters (`Astro.url.searchParams`) for `category` and `search` to perform filtering and searching on the server:
  - If a category parameter exists, fetch using `getPostsByCategory`.
  - If search query exists, query Supabase using `searchPosts`.
  - Fetch featured posts and list items directly in SSR.
  Replace dynamic React filters with static href links (`?category=TRAZER_CLIENTES` etc.) for fast rendering and search engine crawlability.

---

### Task 5: Advanced SEO (Sitemaps & Structured Data)

**Files:**
- Modify: `astro.config.mjs`
- Create: `src/pages/sitemap.xml.astro` (or configure `@astrojs/sitemap`)
- Modify: `src/layouts/Layout.astro` (for JSON-LD Injection)

- [ ] **Step 1: Add JSON-LD Structured Data**
  Inject structured schema data in `Layout.astro` when viewing single posts to yield Google Rich Results:
  ```html
  <script type="application/ld+json" is:inline>
    // JSON-LD dynamic payload
  </script>
  ```

- [ ] **Step 2: Configure Sitemap Generation**
  Install `@astrojs/sitemap` and update configuration to output sitemaps dynamically containing static routes and dynamic blog articles.

---

### Task 6: Cloudflare Configuration & Local Verification

**Files:**
- Create: `wrangler.toml`

- [ ] **Step 1: Create wrangler.toml**
  Define target environment variables and compatibility settings:
  ```toml
  name = "klimba-blog"
  compatibility_date = "2024-03-01"
  compatibility_flags = ["nodejs_compat"]
  ```

- [ ] **Step 2: Verify production build locally**
  Compile the final bundle:
  Run: `npm run build`
  Expected: Successful completion of compilation with output ready for deployment to Cloudflare Pages.
