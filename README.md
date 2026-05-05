# Research Repository

A team knowledge base for organizing research sources, tracking developments, and surfacing insights across work streams.

Built with React + Vite. Deployable to Vercel in under 5 minutes.

## Live Demo

[research-repository.vercel.app](https://research-repository.vercel.app) <!-- update with your URL -->

## Features

- **Work Streams** — organize sources into research domains (DMA Policy, Labor Markets, SHEP Interventions)
- **Source Cards** — store URL, description, role (Foundational / Supportive / Background), type, cadence, and a running update log
- **Research Scope** — formal inclusion/exclusion criteria and search strings per stream
- **AI Digest** — analyst summary per stream with topic pulse signals
- **All Sources Table** — full extraction view across all streams with filters
- **Cross-stream tagging** — tag sources and filter across all streams instantly
- **Feed view** — latest updates across all streams chronologically
- **Smart URL input** — paste a URL and the tool auto-detects org and source type from 30+ known domains
- **Export to Excel** — one-click XLSX export per stream or all sources
- **localStorage persistence** — data survives page refresh

## Getting Started

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Vercel auto-detects Vite — click Deploy
4. Live URL ready in ~60 seconds

## Stack

- React 18
- Vite 5
- IBM Plex Mono + Instrument Serif (Google Fonts)
- SheetJS (Excel export, CDN)
- localStorage (persistence)
- No other external dependencies

## Roadmap

See `CLAUDE.md` for the full development scope.

### v2 (planned)
- Supabase backend — real-time shared state across team members
- Web scraping layer — automated source monitoring and topic surge detection
- Live AI digest — Anthropic API integration for generated summaries
- PubMed API integration — direct search and import from within the tool
- Stream-level permissions — read/write roles per team member
