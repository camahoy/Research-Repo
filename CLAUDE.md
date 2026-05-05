# CLAUDE.md — Research Repository

This file tells Claude Code everything it needs to know about this project to continue development effectively.

---

## What This Is

A team research knowledge base built in React + Vite. It organizes sources across work streams, tracks updates, surfaces AI-generated digests, and exports structured data. Currently a portfolio demo. The goal is to evolve it into a live, team-facing research intelligence tool.

---

## Current State (v1 — Portfolio Demo)

### Tech Stack
- React 18 + Vite 5
- Single file: `src/App.jsx` (~900 lines)
- No backend — all state in React + localStorage
- SheetJS loaded from CDN for Excel export
- Google Fonts (IBM Plex Mono + Instrument Serif)

### Data Model
All data lives in `src/App.jsx` as constants and React state:

```
STREAMS[]         — work stream definitions (id, label, code, color, scope, digest)
INITIAL_SOURCES[] — seed source objects
```

Each source has:
```js
{
  id, streamId, title, org, url, description,
  tags[],           // array of strings e.g. ["#regulation", "#EU"]
  updates[],        // array of { date, note } — newest first
  type,             // from SOURCE_TYPES constant
  role,             // "foundational" | "supportive" | "background"
  cadence,          // e.g. "Monthly", "Static (2024)"
}
```

Each stream has:
```js
{
  id, label, code, color, dim,
  scope: { statement, inclusion[], exclusion[], searchTerms, status, lastUpdated },
  digest: { summary, signals[], generatedAt }
}
```

### localStorage
- Key: `research-repo-sources-v1`
- Stores: full sources array as JSON
- Loads on mount via `loadSources()` function
- Saves on every `sources` state change via `useEffect`

### Current Work Streams
1. **DMA Policy** (`dma`) — 12 sources
2. **Labor Markets** (`labor`) — 4 sources
3. **SHEP Interventions** (`pubmed`) — 20 sources (real PubMed research from uploaded document)

### Views
- `stream` — per-stream source cards with scope + digest panels
- `sources` — all-sources extraction table with filters + export
- `feed` — chronological update feed across all streams
- `tags` — tag explorer with cross-stream filtering

### Key Components
- `Drawer` — slide-in panel for adding sources (URL paste → auto-detect → form)
- `ResearchBrain` — main app component (exported as default)
- `parseUrl()` — maps known domains to org + source type
- `exportToExcel()` — SheetJS export function (async, loads from CDN)

---

## Immediate Next Tasks

### 1. Fix the Sources Table view (PRIORITY)
The ALL SOURCES view uses inline `useState` hooks inside a render function (`{(()=>{ const [x,setX]=useState... })()}`). This is invalid React — hooks cannot be called inside callbacks. Extract it into its own component:

```jsx
function SourcesTable({ sources, STREAMS, ROLE_LABELS, TYPE_COLORS, setActiveTag, setView }) {
  const [tblSearch, setTblSearch] = useState("");
  const [tblStream, setTblStream] = useState("all");
  const [tblRole, setTblRole] = useState("all");
  // ... rest of the table logic
}
```

Then use `<SourcesTable ... />` in the main render.

### 2. Wire up Supabase (v2 backend)
Replace localStorage with Supabase for real-time shared state.

```bash
npm install @supabase/supabase-js
```

Schema:
```sql
-- streams table (mostly static, matches STREAMS constant)
create table streams (
  id text primary key,
  label text, code text, color text, dim text,
  scope jsonb, digest jsonb,
  created_at timestamptz default now()
);

-- sources table
create table sources (
  id text primary key,
  stream_id text references streams(id),
  title text, org text, url text, description text,
  tags text[],
  type text, role text, cadence text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- updates table (append-only log)
create table source_updates (
  id uuid default gen_random_uuid() primary key,
  source_id text references sources(id) on delete cascade,
  date text, note text,
  created_at timestamptz default now()
);
```

Pattern: replace `useState(loadSources)` + localStorage with `useEffect` that fetches from Supabase on mount, and replace `setSources` mutations with Supabase upserts.

### 3. Add PubMed API integration
Allow users to search PubMed directly from within the tool and import results as sources.

```
NCBI E-utilities base URL: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
- esearch: find PMIDs by query
- efetch: get full record by PMID
```

Add a "Search PubMed" tab inside the Add Source drawer. Auto-populate title, org (journal), URL (pubmed.ncbi.nlm.nih.gov/PMID), description (abstract), tags (#PubMed-flagged), type (Peer-Reviewed Journal or Systematic Review based on pub type).

### 4. Live AI digest via Anthropic API
Replace hardcoded digests with live API calls.

```js
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `You are a research analyst. Given these sources from the "${stream.label}" work stream, write a 3-4 sentence analyst digest summarizing the current state of the research landscape, key patterns, and gaps. Sources: ${JSON.stringify(streamSources.map(s => ({ title: s.title, org: s.org, latestNote: s.updates[0]?.note, tags: s.tags })))}`
    }]
  })
});
```

Trigger on "↻ regenerate" button click. Cache the result in state to avoid repeat calls.

### 5. Web scraping layer (topic surge detection)
Use a serverless function (Vercel Edge Function) to monitor sources and detect topic surges.

```
/api/monitor.js — runs on a cron schedule via Vercel Cron
- For each source URL, fetch the page
- Compare against stored snapshot
- If new content detected, log an update to Supabase
- Count tag frequency in updates from last 7 days vs prior 7 days
- Compute surge score: (last7 / prior7) - 1
- Surface in Stream Pulse signals
```

---

## Style & Design Conventions

### Colors
```
Background:     #f4f1eb  (warm parchment)
Surface:        #faf8f3
Sidebar:        #eee9de
Border:         #e0dbd0
Text primary:   #1a1814
Text secondary: #6a6458
Text muted:     #a09888
Text faint:     #c8c2b6
Dark bg:        #1a1814  (top bar, digest panel, active states)
```

### Role colors
```
Foundational:  bg #1a1814, text #f4f1eb  (black)
Supportive:    bg #4a7c59, text #f4f1eb  (forest green)
Background:    bg #e0dbd0, text #6a6458  (grey)
```

### Fonts
- `'IBM Plex Mono'` — all UI text, monospace feel
- `'Instrument Serif'` — headings and display text only

### CSS approach
All styles are inline React styles + a single `<style>` block (variable `CSS`) for class-based styles. Class names are intentionally short (`.card`, `.chip`, `.sb`, `.rb`, `.tb`, `.fi`, `.ab`, `.nv`). Do not add a separate CSS file — keep everything in `App.jsx`.

### Component structure
Keep it as a single file (`App.jsx`) until Supabase is wired up and the file exceeds ~1200 lines. At that point split into:
```
src/
  App.jsx           — main app, routing between views
  components/
    Drawer.jsx      — add source drawer
    SourceCard.jsx  — individual source card with expansion
    SourcesTable.jsx — all sources table view
    StreamDigest.jsx — AI digest + pulse panel
    ScopePanel.jsx  — research scope panel
  lib/
    supabase.js     — supabase client
    pubmed.js       — PubMed API helpers
    export.js       — SheetJS export functions
    storage.js      — localStorage helpers (delete once Supabase is live)
  data/
    streams.js      — STREAMS constant + seed data
    sources.js      — INITIAL_SOURCES constant
```

---

## Environment Variables (for v2)

Create `.env.local`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ANTHROPIC_API_KEY=your-key  # only for local dev — proxy in production
```

---

## Known Issues to Fix

1. **SourcesTable hooks bug** — inline `useState` in IIFE render pattern is invalid React. Fix first.
2. **Digest regenerate** — currently re-animates hardcoded text. Should call Anthropic API once that's wired.
3. **Export in sources view** — the `exportToExcel` async import from SheetJS CDN occasionally fails on slow connections. Consider bundling SheetJS via npm instead.
4. **Mobile layout** — not responsive. Table view especially breaks on small screens. Out of scope until v2.

---

## Deployment

- **Platform**: Vercel (free tier)
- **Build command**: `npm run build` (auto-detected)
- **Output directory**: `dist` (auto-detected)
- **Node version**: 18+

GitHub → Vercel connection means every push to `main` triggers a redeploy automatically.
