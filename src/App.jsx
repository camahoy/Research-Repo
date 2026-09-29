import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const STREAMS = [
  { id: "dma",      label: "DMA Research",      code: "DMA", color: "#A3C4E8", dim: "#1e2d3a" },
  { id: "econ",     label: "Global Economic",    code: "ECO", color: "#A3E8B8", dim: "#1a3a28" },
  { id: "comm",     label: "Commercial",         code: "COM", color: "#E8D5A3", dim: "#3a3020" },
  { id: "polling",  label: "Political Polling",  code: "POL", color: "#D4A3E8", dim: "#2d1e3a" },
  { id: "aipolicy", label: "AI Policy",          code: "AIP", color: "#F4C6A0", dim: "#3a2010" },
];

const SOURCE_TYPES = ["News", "Poll", "Social/X", "Paper", "Manual", "Report", "RSS Feed", "Policy Document", "Think Tank"];

const TYPE_COLORS = {
  "News":            "#E8A3A3",
  "Poll":            "#D4A3E8",
  "Social/X":        "#A3D4E8",
  "Paper":           "#A3E8B8",
  "Manual":          "#E8E8A3",
  "Report":          "#E8D5A3",
  "RSS Feed":        "#C4E8A3",
  "Policy Document": "#F4C6A0",
  "Think Tank":      "#C6D4F4",
};

// ─── MOCK RSS FEED ITEMS ─────────────────────────────────────────────────────
// Simulates items that would arrive from watch-mode scrapers

const MOCK_FEED_ITEMS = [
  {
    id: "mock-1", streamId: "dma",
    title: "EC Issues First DMA Non-Compliance Finding Against Meta",
    source: "Reuters", url: "https://reuters.com/mock-dma-meta",
    type: "News",
    rawSummary: "The European Commission has issued its first formal non-compliance decision under the Digital Markets Act, targeting Meta's 'pay or consent' model for Facebook and Instagram. Meta faces fines of up to 10% of global turnover.",
    keywords: ["DMA", "Meta", "enforcement", "EC", "non-compliance", "gatekeeper"],
    date: "2026-05-12",
  },
  {
    id: "mock-2", streamId: "dma",
    title: "USTR Doubles Down on DMA as Trade Barrier",
    source: "Politico Europe", url: "https://politico.eu/mock-ustr",
    type: "News",
    rawSummary: "US Trade Representative formally expands its 2026 review of the Digital Markets Act as a potential non-tariff trade barrier, signaling escalation ahead of G7 digital economy talks.",
    keywords: ["DMA", "USTR", "trade", "US-EU", "tech regulation"],
    date: "2026-05-11",
  },
  {
    id: "mock-3", streamId: "polling",
    title: "FiveThirtyEight: Generic Ballot Average — May 2026",
    source: "FiveThirtyEight", url: "https://fivethirtyeight.com/mock-generic-ballot",
    type: "Poll",
    rawSummary: "Democrats hold a +3.2 point advantage on the generic congressional ballot as of May 2026, a slight improvement from April's +2.8. Suburban voters remain the swing group. Sample: 12 polls, 24,000+ respondents.",
    keywords: ["generic ballot", "polling", "2026 midterms", "Democrats", "Republicans", "suburban voters"],
    date: "2026-05-13",
  },
  {
    id: "mock-4", streamId: "polling",
    title: "RealClearPolitics: Presidential Approval Tracker",
    source: "RealClearPolitics", url: "https://realclearpolitics.com/mock-approval",
    type: "Poll",
    rawSummary: "Presidential job approval sits at 43.1% approve / 52.4% disapprove in the RCP average. Economy-focused approval is weakest (38%), while national security approval holds at 46%. Data aggregated from 8 active pollsters.",
    keywords: ["presidential approval", "polling", "economy", "national security", "RCP"],
    date: "2026-05-13",
  },
  {
    id: "mock-5", streamId: "econ",
    title: "IMF Downgrades Global Growth Forecast to 2.8%",
    source: "IMF World Economic Outlook", url: "https://imf.org/mock-weo",
    type: "Report",
    rawSummary: "The IMF revised its 2026 global growth forecast down to 2.8% from 3.1%, citing persistent trade fragmentation, tighter financial conditions, and slowing momentum in China. Advanced economies average 1.4%; emerging markets 4.1%.",
    keywords: ["IMF", "global growth", "GDP", "trade fragmentation", "China", "forecast"],
    date: "2026-05-10",
  },
  {
    id: "mock-6", streamId: "econ",
    title: "Fed Holds Rates; Signals Two Cuts by Year-End",
    source: "Federal Reserve", url: "https://federalreserve.gov/mock-fomc",
    type: "News",
    rawSummary: "The FOMC voted unanimously to hold the federal funds rate at 4.25–4.50% at its May meeting. Chair Powell's statement signals the committee expects two 25bp cuts in H2 2026, contingent on continued disinflation progress.",
    keywords: ["Federal Reserve", "interest rates", "FOMC", "monetary policy", "inflation", "rate cuts"],
    date: "2026-05-07",
  },
  {
    id: "mock-7", streamId: "comm",
    title: "S&P 500 Sector Rotation: Tech Cedes Ground to Industrials",
    source: "Bloomberg", url: "https://bloomberg.com/mock-sector",
    type: "News",
    rawSummary: "YTD sector performance shows industrials (+14.2%) and energy (+11.8%) leading while tech (-2.1%) lags on regulatory headwinds and AI capex concerns. Healthcare flat at +0.4%. Analysts flag defensive rotation as macro uncertainty persists.",
    keywords: ["S&P 500", "sector rotation", "industrials", "tech", "energy", "equities"],
    date: "2026-05-12",
  },
  {
    id: "mock-8", streamId: "comm",
    title: "Consumer Confidence Falls to 7-Month Low",
    source: "Conference Board", url: "https://conference-board.org/mock-cc",
    type: "Report",
    rawSummary: "The Conference Board Consumer Confidence Index declined to 98.3 in May from 103.1 in April, the lowest reading since October 2025. Present Situation Index fell sharply; Expectations Index dipped below the recession-signal threshold of 80.",
    keywords: ["consumer confidence", "Conference Board", "recession", "expectations", "sentiment"],
    date: "2026-05-13",
  },
  {
    id: "mock-9", streamId: "dma",
    title: "Apple's DMA Compliance Plan Rejected by EC for Second Time",
    source: "The Verge", url: "https://theverge.com/mock-apple-dma",
    type: "News",
    rawSummary: "The European Commission rejected Apple's revised interoperability compliance plan under DMA Article 6, citing insufficient access for third-party developers to NFC and notification APIs. Apple has 30 days to submit a new plan or face proceedings.",
    keywords: ["DMA", "Apple", "interoperability", "EC", "NFC", "gatekeeper", "compliance"],
    date: "2026-05-09",
  },
  {
    id: "mock-10", streamId: "polling",
    title: "YouGov/Economist: Voter Trust in Institutions — May 2026",
    source: "YouGov/Economist", url: "https://economist.com/mock-trust",
    type: "Poll",
    rawSummary: "Only 27% of Americans express trust in Congress (down 4pts from Jan), while 61% trust local government. Trust in the Supreme Court is 38%. Partisan split is largest on federal executive: 78% of Democrats distrust vs. 31% of Republicans.",
    keywords: ["institutional trust", "Congress", "Supreme Court", "polling", "partisanship", "YouGov"],
    date: "2026-05-08",
  },
  {
    id: "mock-aip-1", streamId: "aipolicy",
    title: "Senate AI Working Group Releases Bipartisan Policy Roadmap",
    source: "Politico Tech", url: "https://politico.com/technology",
    type: "News",
    rawSummary: "The bipartisan Senate AI Working Group released a 33-page roadmap calling for sector-specific AI legislation rather than a horizontal framework, targeted investments in government AI capacity, and mandatory reporting for frontier model developers. Stops short of endorsing a standalone AI regulatory agency.",
    keywords: ["Senate", "AI legislation", "bipartisan", "frontier models", "US AI policy", "regulatory agency"],
    date: "2026-09-15",
  },
  {
    id: "mock-aip-2", streamId: "aipolicy",
    title: "EU AI Act: High-Risk System Obligations Now Enforceable",
    source: "EURACTIV", url: "https://euractiv.com/section/digital/artificial-intelligence",
    type: "News",
    rawSummary: "As of August 2026, EU AI Act provisions for high-risk systems under Annex III are now enforceable. National market surveillance authorities have begun first-wave audits. Legal experts flag significant ambiguity in conformity assessment procedures for foundation models used in downstream high-risk applications.",
    keywords: ["EU AI Act", "high-risk", "enforcement", "Annex III", "conformity assessment", "market surveillance"],
    date: "2026-09-10",
  },
  {
    id: "mock-aip-3", streamId: "aipolicy",
    title: "AI Now Institute: 2026 Annual Report — Power and Accountability",
    source: "AI Now Institute", url: "https://ainowinstitute.org",
    type: "Report",
    rawSummary: "AI Now's 2026 report argues that AI governance frameworks have systematically failed to constrain industry power concentration. Key findings: 70% of public AI contracts awarded to three companies; civil society excluded from 89% of regulatory consultations; worker harms from automated decision systems remain unaddressed in all major frameworks.",
    keywords: ["AI Now", "power concentration", "accountability", "procurement", "civil society", "workers"],
    date: "2026-09-01",
  },
  {
    id: "mock-aip-4", streamId: "aipolicy",
    title: "GSMA: AI Infrastructure Investment Gap in Sub-Saharan Africa",
    source: "GSMA", url: "https://gsma.com/solutions-and-impact/technologies/ai",
    type: "Report",
    rawSummary: "GSMA report quantifies a $47B AI infrastructure investment gap across Sub-Saharan Africa through 2030. Compute capacity is 0.3% of US levels; 68% of mobile AI applications rely on cloud inference routed through European data centres. Policy recommendations include regional compute pooling and spectrum allocation reform.",
    keywords: ["GSMA", "Africa", "AI infrastructure", "compute", "Global South", "investment gap"],
    date: "2026-08-20",
  },
  {
    id: "mock-aip-5", streamId: "aipolicy",
    title: "Frontier Model Forum: Updated Incident Reporting Framework",
    source: "Frontier Model Forum", url: "https://frontier-model-forum.org",
    type: "Report",
    rawSummary: "The Frontier Model Forum released v2 of its voluntary AI incident reporting framework, expanding coverage to include near-misses and agentic system failures. Anthropic, Google, Microsoft, and OpenAI are signatories. Critics note the framework is voluntary and lacks a shared public database — disclosures go only to member companies.",
    keywords: ["Frontier Model Forum", "incident reporting", "agentic AI", "self-governance", "voluntary", "transparency"],
    date: "2026-09-05",
  },
];

// ─── SEED BRAIN ENTRIES ───────────────────────────────────────────────────────

const SEED_BRAIN_ENTRIES = [
  {
    id: "brain-1", streamId: "dma",
    source: "EC DMA Enforcement Dashboard", sourceType: "Manual",
    url: "https://ec.europa.eu/digital-markets-act",
    summary: "Official EC tracker for DMA gatekeeper designations and enforcement proceedings. Six gatekeepers designated (Alphabet, Amazon, Apple, ByteDance, Meta, Microsoft). Proceedings open against all six as of Q1 2026.",
    keywords: ["DMA", "EC", "gatekeeper", "enforcement", "official"],
    date: "2026-04-01",
  },
  {
    id: "brain-2", streamId: "dma",
    source: "ECIPE/Ipsos — Consumer Attitudes to DMA (CEE)", sourceType: "Report",
    url: "https://ecipe.org/mock-cee-survey",
    summary: "Survey of 8,000 consumers across 6 CEE countries. 64% support DMA goals; 41% aware of gatekeeper concept. Strongest support in Poland and Czech Republic. Key gap: no equivalent study for Western EU or non-EU comparators.",
    keywords: ["DMA", "consumer attitudes", "CEE", "public opinion", "survey"],
    date: "2026-03-15",
  },
  {
    id: "brain-3", streamId: "polling",
    source: "FiveThirtyEight Generic Ballot Tracker", sourceType: "Poll",
    url: "https://fivethirtyeight.com/generic-ballot",
    summary: "Aggregated polling average for 2026 congressional generic ballot. Democrats +3.2 as of May 2026. Historical context: Dems need +5–6 to flip House based on 2024 geographic efficiency gap.",
    keywords: ["generic ballot", "House", "2026", "FiveThirtyEight", "polling average"],
    date: "2026-05-01",
  },
  {
    id: "brain-4", streamId: "econ",
    source: "World Bank Global Economic Prospects 2026", sourceType: "Report",
    url: "https://worldbank.org/mock-gep",
    summary: "World Bank projects global growth at 2.7% for 2026, slowest since 2008 excluding pandemic. Developing economies face compounding headwinds: dollar strength, debt burden, commodity volatility. Report flags elevated recession probability for 15 countries.",
    keywords: ["World Bank", "global growth", "recession", "developing economies", "forecast"],
    date: "2026-01-10",
  },
  {
    id: "brain-aip-1", streamId: "aipolicy",
    source: "EU AI Act — Official Text & Implementation Tracker", sourceType: "Manual",
    url: "https://artificialintelligenceact.eu",
    summary: "Primary reference for EU AI Act obligations, timelines, and prohibited practices. High-risk system provisions apply from Aug 2026; GPAI model rules (including systemic risk thresholds) now in force. Key tracker for compliance obligations affecting frontier labs operating in the EU.",
    keywords: ["EU AI Act", "GPAI", "high-risk", "compliance", "prohibited practices", "frontier AI"],
    date: "2026-09-01",
  },
  {
    id: "brain-aip-2", streamId: "aipolicy",
    source: "NIST AI Risk Management Framework (AI RMF 1.0)", sourceType: "Report",
    url: "https://nist.gov/artificial-intelligence",
    summary: "NIST's voluntary framework for managing AI risks across govern, map, measure, manage functions. Widely adopted as de facto US standard in the absence of federal legislation. Companion profiles for generative AI published Q4 2023. Reference for US federal procurement and contractor requirements.",
    keywords: ["NIST", "AI RMF", "risk management", "US", "federal", "generative AI"],
    date: "2026-01-15",
  },
  {
    id: "brain-aip-3", streamId: "aipolicy",
    source: "CSET — Georgetown Center for Security and Emerging Technology", sourceType: "Report",
    url: "https://cset.georgetown.edu/publications",
    summary: "Leading US think tank on AI and national security. Key publications cover: AI talent flows, compute governance, China AI capabilities, export controls, and federal AI acquisition policy. Regular congressional testimony. Strongest US source for AI-national security intersection.",
    keywords: ["CSET", "AI security", "export controls", "compute governance", "China", "national security"],
    date: "2026-06-01",
  },
  {
    id: "brain-aip-4", streamId: "aipolicy",
    source: "Anthropic — Responsible Scaling Policy (RSP)", sourceType: "Manual",
    url: "https://anthropic.com/news",
    summary: "Anthropic's commitments framework linking model capability evaluations to deployment decisions. ASL-3 threshold now active; ASL-4 criteria under development. Key primary source for how a frontier lab operationalizes safety commitments. Compare against OpenAI's Preparedness Framework and Google DeepMind's Frontier Safety Framework.",
    keywords: ["Anthropic", "RSP", "responsible scaling", "ASL", "frontier AI", "safety commitments"],
    date: "2026-09-01",
  },
  {
    id: "brain-aip-5", streamId: "aipolicy",
    source: "CIPESA — Collaboration on International ICT Policy for East and Southern Africa", sourceType: "Report",
    url: "https://cipesa.org",
    summary: "Primary source for African AI governance landscape. Covers national AI strategies across East/Southern Africa, digital rights, platform regulation, and Global South policy divergence from EU/US frameworks. Essential for any comparative or Africa-focused AI policy analysis.",
    keywords: ["CIPESA", "Africa", "AI governance", "Global South", "digital rights", "ICT policy"],
    date: "2026-07-01",
  },
  {
    id: "brain-aip-6", streamId: "aipolicy",
    source: "OECD AI Policy Observatory", sourceType: "Manual",
    url: "https://oecd.ai/en/dashboards",
    summary: "Live dashboard of AI policies, national strategies, and regulatory developments across 60+ countries. Tracks adoption of OECD AI Principles (42 adherents). Useful for cross-jurisdictional comparative analysis and monitoring divergence between EU, US, UK, and Global South approaches.",
    keywords: ["OECD", "AI principles", "national strategies", "comparative", "global", "dashboard"],
    date: "2026-08-01",
  },
  {
    id: "brain-aip-7", streamId: "aipolicy",
    source: "Partnership on AI — Publications & Reports", sourceType: "Report",
    url: "https://partnershiponai.org",
    summary: "Multi-stakeholder body (includes Anthropic, Google, Meta, Microsoft, Amazon, civil society orgs). Key outputs: synthetic media framework, responsible AI deployment norms, foundation model transparency guidance. Useful for tracking industry-led self-governance positions.",
    keywords: ["Partnership on AI", "multi-stakeholder", "synthetic media", "transparency", "self-governance"],
    date: "2026-05-01",
  },
  {
    id: "brain-aip-8", streamId: "aipolicy",
    source: "International AI Safety Report 2025 (Bengio et al.)", sourceType: "Report",
    url: "https://internationalaisafetyreport.org",
    summary: "State-of-science report commissioned by 30 governments for the AI Safety Summit process. Covers capability trajectories, risk categories (misuse, structural, loss of control), and governance gaps. Primary scientific reference for international AI safety policy. Lead author: Yoshua Bengio.",
    keywords: ["AI safety", "international", "Bengio", "capability", "risk", "AI Safety Summit"],
    date: "2025-05-01",
  },
  {
    id: "brain-5", streamId: "comm",
    source: "Goldman Sachs US Equity Outlook 2026", sourceType: "Report",
    url: "https://goldmansachs.com/mock-outlook",
    summary: "GS forecasts S&P 500 at 5,800 by year-end 2026 (from ~5,200 current). Bull case driven by Fed easing + AI productivity uplift. Bear case (5,100) triggered by tariff escalation. Sector overweights: financials, industrials, energy.",
    keywords: ["S&P 500", "Goldman Sachs", "equity outlook", "AI", "tariffs", "sectors"],
    date: "2026-01-05",
  },
];

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────

const LS_BRAIN = "research-brain-entries-v1";
const LS_QUEUE = "research-brain-queue-v1";
const LS_WATCH = "research-brain-watch-v1";

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f4f1eb; font-family: 'IBM Plex Mono', monospace; color: #1a1814; font-size: 13px; }
  button { font-family: inherit; cursor: pointer; border: none; background: none; }
  input, textarea, select { font-family: inherit; font-size: 13px; }
  a { color: inherit; }

  .app { display: flex; flex-direction: column; min-height: 100vh; }

  /* Top bar */
  .topbar { background: #1a1814; color: #f4f1eb; display: flex; align-items: center; gap: 16px; padding: 0 20px; height: 48px; flex-shrink: 0; border-bottom: 1px solid #333; }
  .topbar-logo { font-family: 'Instrument Serif', serif; font-size: 18px; letter-spacing: -0.3px; }
  .topbar-sub { color: #a09888; font-size: 11px; margin-left: 4px; }
  .topbar-spacer { flex: 1; }
  .topbar-nav { display: flex; gap: 2px; }
  .tnav-btn { padding: 6px 12px; border-radius: 4px; font-size: 12px; color: #a09888; transition: all 0.15s; }
  .tnav-btn:hover { color: #f4f1eb; background: #2a2520; }
  .tnav-btn.active { color: #f4f1eb; background: #2a2520; }

  /* Stream filter bar */
  .streambar { background: #eee9de; border-bottom: 1px solid #e0dbd0; display: flex; align-items: center; gap: 8px; padding: 8px 20px; flex-wrap: wrap; }
  .stream-chip { padding: 4px 10px; border-radius: 20px; font-size: 11px; border: 1.5px solid transparent; cursor: pointer; transition: all 0.15s; }
  .stream-chip:hover { opacity: 0.8; }
  .stream-chip.active { border-color: #1a1814; }

  /* Watch mode toggles */
  .watch-bar { background: #f4f1eb; border-bottom: 1px solid #e0dbd0; display: flex; align-items: center; gap: 16px; padding: 8px 20px; }
  .watch-item { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #6a6458; }
  .watch-label { }
  .watch-toggle { position: relative; width: 36px; height: 20px; }
  .watch-toggle input { opacity: 0; width: 0; height: 0; }
  .watch-slider { position: absolute; inset: 0; border-radius: 20px; background: #c8c2b6; transition: 0.2s; cursor: pointer; }
  .watch-slider::before { content: ''; position: absolute; width: 14px; height: 14px; left: 3px; top: 3px; border-radius: 50%; background: white; transition: 0.2s; }
  input:checked + .watch-slider { background: #4a7c59; }
  input:checked + .watch-slider::before { transform: translateX(16px); }
  .watch-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #4a7c59; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* Main layout */
  .main { flex: 1; display: flex; flex-direction: column; }
  .content { flex: 1; padding: 20px; max-width: 1200px; width: 100%; margin: 0 auto; }

  /* Cards */
  .card { background: #faf8f3; border: 1px solid #e0dbd0; border-radius: 6px; padding: 16px; }
  .card + .card { margin-top: 10px; }
  .card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
  .card-title { font-size: 13px; font-weight: 600; line-height: 1.4; }
  .card-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
  .card-source { font-size: 11px; color: #6a6458; }
  .card-date { font-size: 11px; color: #a09888; }
  .card-body { font-size: 12px; color: #4a4438; line-height: 1.6; }
  .card-footer { display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-wrap: wrap; }

  /* Type chip */
  .type-chip { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; letter-spacing: 0.3px; }
  .stream-badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }

  /* Keyword chips */
  .kw-chip { padding: 2px 7px; background: #e0dbd0; border-radius: 3px; font-size: 10px; color: #6a6458; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; transition: all 0.15s; }
  .btn-primary { background: #1a1814; color: #f4f1eb; }
  .btn-primary:hover { background: #2a2520; }
  .btn-approve { background: #4a7c59; color: white; }
  .btn-approve:hover { background: #3d6b4a; }
  .btn-reject { background: #e0dbd0; color: #6a6458; }
  .btn-reject:hover { background: #c8c2b6; color: #1a1814; }
  .btn-edit { background: #f4f1eb; border: 1px solid #c8c2b6; color: #1a1814; }
  .btn-edit:hover { background: #e0dbd0; }
  .btn-outline { background: transparent; border: 1px solid #c8c2b6; color: #6a6458; }
  .btn-outline:hover { border-color: #1a1814; color: #1a1814; }
  .btn-sm { padding: 4px 8px; font-size: 11px; }
  .btn-danger { background: #c0392b; color: white; }
  .btn-danger:hover { background: #a93226; }

  /* Queue stats bar */
  .stats-bar { display: flex; align-items: center; gap: 16px; padding: 10px 0; margin-bottom: 16px; border-bottom: 1px solid #e0dbd0; }
  .stat-item { display: flex; flex-direction: column; gap: 1px; }
  .stat-num { font-size: 20px; font-weight: 700; }
  .stat-label { font-size: 10px; color: #a09888; text-transform: uppercase; letter-spacing: 0.5px; }
  .stats-bar .divider { width: 1px; height: 32px; background: #e0dbd0; }

  /* Section header */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-size: 14px; font-weight: 600; }
  .section-sub { font-size: 11px; color: #a09888; margin-top: 2px; }

  /* Empty state */
  .empty { text-align: center; padding: 48px 20px; color: #a09888; }
  .empty-icon { font-size: 32px; margin-bottom: 12px; }
  .empty-text { font-size: 13px; margin-bottom: 4px; }
  .empty-sub { font-size: 11px; }

  /* Drawer overlay */
  .overlay { position: fixed; inset: 0; background: rgba(26,24,20,0.4); z-index: 100; }
  .drawer { position: fixed; right: 0; top: 0; bottom: 0; width: 520px; background: #faf8f3; border-left: 1px solid #e0dbd0; z-index: 101; display: flex; flex-direction: column; overflow: hidden; }
  .drawer-header { background: #1a1814; color: #f4f1eb; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .drawer-title { font-size: 14px; font-weight: 600; }
  .drawer-body { flex: 1; overflow-y: auto; padding: 20px; }
  .drawer-footer { padding: 16px 20px; border-top: 1px solid #e0dbd0; display: flex; gap: 8px; background: #faf8f3; flex-shrink: 0; }

  /* Form */
  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 11px; font-weight: 600; color: #6a6458; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .form-input { width: 100%; padding: 8px 10px; border: 1px solid #e0dbd0; border-radius: 4px; background: white; color: #1a1814; outline: none; transition: border 0.15s; }
  .form-input:focus { border-color: #1a1814; }
  .form-textarea { width: 100%; padding: 8px 10px; border: 1px solid #e0dbd0; border-radius: 4px; background: white; color: #1a1814; outline: none; resize: vertical; line-height: 1.5; min-height: 80px; transition: border 0.15s; }
  .form-textarea:focus { border-color: #1a1814; }
  .form-select { width: 100%; padding: 8px 10px; border: 1px solid #e0dbd0; border-radius: 4px; background: white; color: #1a1814; outline: none; }

  /* Output view */
  .output-box { background: #1a1814; color: #f4f1eb; border-radius: 6px; padding: 20px; margin-bottom: 16px; }
  .output-section { margin-bottom: 16px; }
  .output-label { font-size: 10px; color: #a09888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .output-text { font-size: 13px; line-height: 1.7; color: #e0dbd0; }
  .output-themes { display: flex; flex-wrap: wrap; gap: 6px; }
  .output-theme { padding: 4px 10px; background: #2a2520; border-radius: 4px; font-size: 11px; color: #c8c2b6; }
  .citation-item { font-size: 12px; color: #c8c2b6; line-height: 1.5; padding: 8px 0; border-bottom: 1px solid #2a2520; display: flex; gap: 8px; }
  .citation-num { color: #6a6458; flex-shrink: 0; }
  .citation-source { color: #a09888; }

  /* Search / filter row */
  .filter-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .filter-input { flex: 1; min-width: 200px; padding: 7px 10px; border: 1px solid #e0dbd0; border-radius: 4px; background: white; color: #1a1814; outline: none; }
  .filter-input:focus { border-color: #1a1814; }
  .filter-select { padding: 7px 10px; border: 1px solid #e0dbd0; border-radius: 4px; background: white; color: #1a1814; outline: none; }

  /* Edit inline */
  .edit-panel { background: #f4f1eb; border: 1px solid #c8c2b6; border-radius: 6px; padding: 14px; margin-top: 10px; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #c8c2b6; border-radius: 3px; }

  /* Queue item actions */
  .queue-actions { display: flex; gap: 6px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0dbd0; }
  .queue-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: 600; }
  .queue-badge.auto { background: #e0f0e8; color: #2d6a48; }
  .queue-badge.manual { background: #e8e8e0; color: #4a4438; }

  /* Brain entry */
  .brain-entry { background: #faf8f3; border: 1px solid #e0dbd0; border-radius: 6px; padding: 16px; }
  .brain-entry + .brain-entry { margin-top: 10px; }
  .brain-entry:hover { border-color: #c8c2b6; }

  /* Tab row in drawer */
  .tab-row { display: flex; border-bottom: 1px solid #e0dbd0; margin-bottom: 16px; }
  .tab-btn { padding: 8px 16px; font-size: 12px; color: #a09888; border-bottom: 2px solid transparent; transition: all 0.15s; }
  .tab-btn.active { color: #1a1814; border-bottom-color: #1a1814; }

  /* Loading shimmer */
  @keyframes shimmer { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
  .shimmer { animation: shimmer 1.5s infinite; }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function streamById(id) { return STREAMS.find(s => s.id === id); }

function uid() { return Math.random().toString(36).slice(2, 10); }

function today() { return new Date().toISOString().slice(0, 10); }

function generateOutput(entries) {
  if (!entries.length) return null;
  const byStream = {};
  entries.forEach(e => {
    if (!byStream[e.streamId]) byStream[e.streamId] = [];
    byStream[e.streamId].push(e);
  });
  const streamSummaries = Object.entries(byStream).map(([sid, items]) => {
    const st = streamById(sid);
    const kws = [...new Set(items.flatMap(i => i.keywords))].slice(0, 6);
    return `${st?.label}: ${items.length} source${items.length !== 1 ? "s" : ""} covering ${kws.slice(0, 3).join(", ")}.`;
  });
  const allKws = entries.flatMap(e => e.keywords);
  const kwFreq = {};
  allKws.forEach(k => { kwFreq[k] = (kwFreq[k] || 0) + 1; });
  const themes = Object.entries(kwFreq).sort((a,b) => b[1]-a[1]).slice(0, 8).map(([k]) => k);
  const summary = `This research corpus spans ${entries.length} approved entries across ${Object.keys(byStream).length} stream${Object.keys(byStream).length !== 1 ? "s" : ""}. ${streamSummaries.join(" ")} Key recurring themes are ${themes.slice(0, 4).join(", ")}, with particular concentration in ${themes[0] || "multiple areas"}. Coverage reflects a mix of primary sources (polls, official regulatory documents) and synthesized analysis (reports, news).`;
  return { summary, themes, entries };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function TypeChip({ type }) {
  return (
    <span className="type-chip" style={{ background: TYPE_COLORS[type] || "#e0dbd0", color: "#1a1814" }}>
      {type}
    </span>
  );
}

function StreamBadge({ streamId }) {
  const st = streamById(streamId);
  if (!st) return null;
  return (
    <span className="stream-badge" style={{ background: st.color, color: "#1a1814" }}>
      {st.code}
    </span>
  );
}

function KwChips({ keywords }) {
  return keywords.slice(0, 6).map((k, i) => (
    <span key={i} className="kw-chip">{k}</span>
  ));
}

// ─── QUEUE ITEM ───────────────────────────────────────────────────────────────

function QueueItem({ item, onApprove, onReject }) {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(item.rawSummary);
  const [keywords, setKeywords] = useState(item.keywords.join(", "));

  function handleApprove() {
    onApprove(item.id, { summary, keywords: keywords.split(",").map(k => k.trim()).filter(Boolean) });
  }

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <StreamBadge streamId={item.streamId} />
            <TypeChip type={item.type} />
            <span className={`queue-badge ${item.isManual ? "manual" : "auto"}`}>
              {item.isManual ? "Manual" : "Auto-ingested"}
            </span>
          </div>
          <div className="card-title">{item.title}</div>
        </div>
        <div style={{ fontSize: 11, color: "#a09888", whiteSpace: "nowrap" }}>{item.date}</div>
      </div>
      <div style={{ fontSize: 11, color: "#6a6458", marginBottom: 8 }}>
        {item.source} {item.url && <span>· <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#4a7c59" }}>↗</a></span>}
      </div>
      {!editing ? (
        <>
          <div className="card-body">{summary}</div>
          <div className="card-footer">
            <KwChips keywords={keywords.split(",").map(k => k.trim())} />
          </div>
        </>
      ) : (
        <div className="edit-panel">
          <div className="form-group">
            <label className="form-label">Summary</label>
            <textarea className="form-textarea" value={summary} onChange={e => setSummary(e.target.value)} rows={4} />
          </div>
          <div className="form-group">
            <label className="form-label">Keywords (comma-separated)</label>
            <input className="form-input" value={keywords} onChange={e => setKeywords(e.target.value)} />
          </div>
        </div>
      )}
      <div className="queue-actions">
        <button className="btn btn-approve btn-sm" onClick={handleApprove}>✓ Approve</button>
        <button className="btn btn-edit btn-sm" onClick={() => setEditing(e => !e)}>
          {editing ? "✕ Cancel" : "✎ Edit"}
        </button>
        <button className="btn btn-reject btn-sm" onClick={() => onReject(item.id)}>✗ Reject</button>
      </div>
    </div>
  );
}

// ─── BRAIN ENTRY CARD ─────────────────────────────────────────────────────────

function BrainEntryCard({ entry, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="brain-entry">
      <div className="card-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <StreamBadge streamId={entry.streamId} />
            <TypeChip type={entry.sourceType} />
          </div>
          <div className="card-title">{entry.source}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <span style={{ fontSize: 11, color: "#a09888" }}>{entry.date}</span>
          <button className="btn btn-edit btn-sm" onClick={() => onEdit(entry)}>✎</button>
          <button className="btn btn-reject btn-sm" style={{ color: "#c0392b" }} onClick={() => onDelete(entry.id)}>✗</button>
        </div>
      </div>
      {entry.url && (
        <div style={{ fontSize: 11, color: "#6a6458", marginBottom: 8 }}>
          <a href={entry.url} target="_blank" rel="noreferrer" style={{ color: "#4a7c59" }}>{entry.url}</a>
        </div>
      )}
      <div className="card-body" style={{ marginBottom: 10 }}>
        {expanded ? entry.summary : entry.summary.length > 200 ? entry.summary.slice(0, 200) + "…" : entry.summary}
        {entry.summary.length > 200 && (
          <button onClick={() => setExpanded(e => !e)} style={{ color: "#4a7c59", marginLeft: 6, fontSize: 11 }}>
            {expanded ? "less" : "more"}
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        <KwChips keywords={entry.keywords} />
      </div>
    </div>
  );
}

// ─── MANUAL ADD DRAWER ────────────────────────────────────────────────────────

function AddDrawer({ onClose, onAdd, editEntry }) {
  const isEdit = !!editEntry;
  const [form, setForm] = useState(isEdit ? {
    source: editEntry.source,
    url: editEntry.url || "",
    streamId: editEntry.streamId,
    sourceType: editEntry.sourceType,
    summary: editEntry.summary,
    keywords: editEntry.keywords.join(", "),
    date: editEntry.date,
  } : {
    source: "",
    url: "",
    streamId: STREAMS[0].id,
    sourceType: "Manual",
    summary: "",
    keywords: "",
    date: today(),
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit() {
    if (!form.source.trim() || !form.summary.trim()) return;
    onAdd({
      id: isEdit ? editEntry.id : uid(),
      source: form.source.trim(),
      url: form.url.trim(),
      streamId: form.streamId,
      sourceType: form.sourceType,
      summary: form.summary.trim(),
      keywords: form.keywords.split(",").map(k => k.trim()).filter(Boolean),
      date: form.date || today(),
    });
    onClose();
  }

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <span className="drawer-title">{isEdit ? "Edit Entry" : "Add to Brain"}</span>
          <button onClick={onClose} style={{ color: "#a09888", fontSize: 18 }}>✕</button>
        </div>
        <div className="drawer-body">
          <div className="form-group">
            <label className="form-label">Source / Title *</label>
            <input className="form-input" value={form.source} onChange={e => set("source", e.target.value)} placeholder="e.g. Reuters — DMA Enforcement Article" />
          </div>
          <div className="form-group">
            <label className="form-label">URL</label>
            <input className="form-input" value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://…" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Stream</label>
              <select className="form-select" value={form.streamId} onChange={e => set("streamId", e.target.value)}>
                {STREAMS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Source Type</label>
              <select className="form-select" value={form.sourceType} onChange={e => set("sourceType", e.target.value)}>
                {SOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Summary *</label>
            <textarea className="form-textarea" value={form.summary} onChange={e => set("summary", e.target.value)} rows={5} placeholder="Analyst-ready summary of this source…" />
          </div>
          <div className="form-group">
            <label className="form-label">Keywords (comma-separated)</label>
            <input className="form-input" value={form.keywords} onChange={e => set("keywords", e.target.value)} placeholder="DMA, enforcement, Meta…" />
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Add to Brain"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </>
  );
}

// ─── QUEUE VIEW ───────────────────────────────────────────────────────────────

function QueueView({ queue, activeStream, onApprove, onReject, onApproveAll }) {
  const filtered = activeStream === "all" ? queue : queue.filter(i => i.streamId === activeStream);

  if (!filtered.length) return (
    <div className="empty">
      <div className="empty-icon">✓</div>
      <div className="empty-text">Queue is empty</div>
      <div className="empty-sub">All items have been reviewed. New items from watch-mode sources will appear here.</div>
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Ingestion Queue</div>
          <div className="section-sub">{filtered.length} item{filtered.length !== 1 ? "s" : ""} pending review</div>
        </div>
        <button className="btn btn-approve" onClick={() => onApproveAll(filtered.map(i => i.id))}>
          ✓ Approve All ({filtered.length})
        </button>
      </div>
      {filtered.map(item => (
        <QueueItem key={item.id} item={item} onApprove={onApprove} onReject={onReject} />
      ))}
    </div>
  );
}

// ─── BRAIN VIEW ───────────────────────────────────────────────────────────────

function BrainView({ entries, activeStream, onDelete, onEdit, onAdd }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = entries
    .filter(e => activeStream === "all" || e.streamId === activeStream)
    .filter(e => typeFilter === "all" || e.sourceType === typeFilter)
    .filter(e => {
      if (!search) return true;
      const q = search.toLowerCase();
      return e.source.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q) || e.keywords.some(k => k.toLowerCase().includes(q));
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const typesInUse = [...new Set(entries.map(e => e.sourceType))];

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Research Brain</div>
          <div className="section-sub">{entries.length} approved entr{entries.length !== 1 ? "ies" : "y"} — unified encyclopedia</div>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>+ Add Entry</button>
      </div>
      <div className="filter-row">
        <input className="filter-input" placeholder="Search entries…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All types</option>
          {typesInUse.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {!filtered.length ? (
        <div className="empty">
          <div className="empty-icon">◎</div>
          <div className="empty-text">No entries match</div>
          <div className="empty-sub">Try a different filter or add your first entry.</div>
        </div>
      ) : (
        filtered.map(entry => (
          <BrainEntryCard key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} />
        ))
      )}
    </div>
  );
}

// ─── OUTPUT VIEW ──────────────────────────────────────────────────────────────

function OutputView({ entries, activeStream }) {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);

  const scopeEntries = activeStream === "all" ? entries : entries.filter(e => e.streamId === activeStream);

  function generate() {
    setLoading(true);
    setOutput(null);
    setTimeout(() => {
      setOutput(generateOutput(scopeEntries));
      setLoading(false);
    }, 900);
  }

  const streamLabel = activeStream === "all" ? "All Streams" : streamById(activeStream)?.label;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Output — {streamLabel}</div>
          <div className="section-sub">Generate summary + themes + citations from {scopeEntries.length} approved entr{scopeEntries.length !== 1 ? "ies" : "y"}</div>
        </div>
        <button className="btn btn-primary" onClick={generate} disabled={loading || !scopeEntries.length}>
          {loading ? <span className="shimmer">Generating…</span> : "↻ Generate"}
        </button>
      </div>

      {!output && !loading && (
        <div className="empty">
          <div className="empty-icon">◈</div>
          <div className="empty-text">No output yet</div>
          <div className="empty-sub">Click Generate to produce a summary, themes, and citations from the Brain.</div>
        </div>
      )}

      {loading && (
        <div className="output-box">
          <div className="shimmer" style={{ color: "#6a6458" }}>Synthesizing {scopeEntries.length} entries…</div>
        </div>
      )}

      {output && (
        <>
          <div className="output-box">
            <div className="output-section">
              <div className="output-label">Summary</div>
              <div className="output-text">{output.summary}</div>
            </div>
            <div className="output-section">
              <div className="output-label">Key Themes</div>
              <div className="output-themes">
                {output.themes.map((t, i) => <span key={i} className="output-theme">{t}</span>)}
              </div>
            </div>
          </div>
          <div className="section-header" style={{ marginTop: 16 }}>
            <div className="section-title">Citations ({output.entries.length})</div>
          </div>
          {output.entries.map((e, i) => (
            <div key={e.id} className="citation-item">
              <span className="citation-num">[{i + 1}]</span>
              <div>
                <div>{e.source}</div>
                <div className="citation-source">
                  {streamById(e.streamId)?.label} · {e.sourceType} · {e.date}
                  {e.url && <> · <a href={e.url} target="_blank" rel="noreferrer" style={{ color: "#4a7c59" }}>↗</a></>}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── WATCH CONFIG ─────────────────────────────────────────────────────────────

const WATCH_SOURCES = {
  dma:      ["EC Official Feed", "Politico Europe RSS", "Reuters Tech RSS"],
  econ:     ["IMF RSS", "World Bank RSS", "FT Economy RSS"],
  comm:     ["Bloomberg Markets RSS", "WSJ Markets RSS", "Conference Board RSS"],
  polling:  ["FiveThirtyEight RSS", "RealClearPolitics RSS", "YouGov RSS"],
  aipolicy: ["Tech Policy Press", "Politico Tech RSS", "CSET Publications", "EU AI Act Monitor", "Axios AI RSS", "EURACTIV AI RSS"],
};

function WatchBar({ watchState, onToggle }) {
  return (
    <div className="watch-bar">
      <span style={{ fontSize: 11, color: "#a09888", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>Watch Mode</span>
      {STREAMS.map(s => (
        <div key={s.id} className="watch-item">
          {watchState[s.id] && <div className="watch-live-dot" />}
          <label className="watch-toggle">
            <input type="checkbox" checked={!!watchState[s.id]} onChange={() => onToggle(s.id)} />
            <span className="watch-slider" />
          </label>
          <span className="watch-label" style={{ color: watchState[s.id] ? "#1a1814" : "#a09888" }}>
            {s.code}
          </span>
          {watchState[s.id] && (
            <span style={{ fontSize: 10, color: "#4a7c59" }}>Live</span>
          )}
        </div>
      ))}
      <span style={{ marginLeft: "auto", fontSize: 10, color: "#c8c2b6" }}>
        Sources: RSS · News · Polls · Social
      </span>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function ResearchBrain() {
  const [view, setView] = useState("brain"); // brain | queue | output
  const [activeStream, setActiveStream] = useState("all");
  const [brainEntries, setBrainEntries] = useState(() => load(LS_BRAIN, SEED_BRAIN_ENTRIES));
  const [queue, setQueue] = useState(() => load(LS_QUEUE, MOCK_FEED_ITEMS));
  const [watchState, setWatchState] = useState(() => load(LS_WATCH, {}));
  const [drawer, setDrawer] = useState(null); // null | "add" | entry-object (edit)
  const watchTimerRef = useRef({});

  useEffect(() => { save(LS_BRAIN, brainEntries); }, [brainEntries]);
  useEffect(() => { save(LS_QUEUE, queue); }, [queue]);
  useEffect(() => { save(LS_WATCH, watchState); }, [watchState]);

  // Simulate watch-mode ingestion: every 45s per active stream, add a mock item
  useEffect(() => {
    Object.keys(watchTimerRef.current).forEach(sid => {
      clearInterval(watchTimerRef.current[sid]);
      delete watchTimerRef.current[sid];
    });

    STREAMS.forEach(stream => {
      if (!watchState[stream.id]) return;
      watchTimerRef.current[stream.id] = setInterval(() => {
        const sources = WATCH_SOURCES[stream.id] || [];
        const src = sources[Math.floor(Math.random() * sources.length)];
        setQueue(q => {
          const newItem = {
            id: uid(),
            streamId: stream.id,
            title: `[Watch] ${src} — New item detected ${new Date().toLocaleTimeString()}`,
            source: src,
            url: "",
            type: "RSS Feed",
            rawSummary: `Auto-ingested item from ${src}. Review and edit before approving into the Brain.`,
            keywords: [stream.code, "watch-mode", "auto-ingested"],
            date: today(),
            isManual: false,
          };
          return [newItem, ...q];
        });
      }, 45000);
    });

    return () => Object.values(watchTimerRef.current).forEach(clearInterval);
  }, [watchState]);

  function toggleWatch(streamId) {
    setWatchState(w => ({ ...w, [streamId]: !w[streamId] }));
  }

  // Queue actions
  function approveItem(id, edits) {
    const item = queue.find(i => i.id === id);
    if (!item) return;
    const entry = {
      id: uid(),
      streamId: item.streamId,
      source: item.title || item.source,
      sourceType: item.type,
      url: item.url,
      summary: edits.summary,
      keywords: edits.keywords,
      date: item.date,
    };
    setBrainEntries(b => [entry, ...b]);
    setQueue(q => q.filter(i => i.id !== id));
  }

  function rejectItem(id) {
    setQueue(q => q.filter(i => i.id !== id));
  }

  function approveAll(ids) {
    const toApprove = queue.filter(i => ids.includes(i.id));
    const newEntries = toApprove.map(item => ({
      id: uid(),
      streamId: item.streamId,
      source: item.title || item.source,
      sourceType: item.type,
      url: item.url,
      summary: item.rawSummary,
      keywords: item.keywords,
      date: item.date,
    }));
    setBrainEntries(b => [...newEntries, ...b]);
    setQueue(q => q.filter(i => !ids.includes(i.id)));
  }

  // Brain actions
  function deleteEntry(id) {
    setBrainEntries(b => b.filter(e => e.id !== id));
  }

  function saveEntry(updated) {
    setBrainEntries(b => b.map(e => e.id === updated.id ? updated : e));
  }

  function addEntry(entry) {
    if (drawer && typeof drawer === "object") {
      saveEntry(entry);
    } else {
      setBrainEntries(b => [entry, ...b]);
    }
  }

  // Manual add to queue
  function addManualToQueue() {
    setDrawer("manual-queue");
  }

  function submitManualQueue(entry) {
    const qItem = {
      id: uid(),
      streamId: entry.streamId,
      title: entry.source,
      source: entry.source,
      url: entry.url,
      type: entry.sourceType,
      rawSummary: entry.summary,
      keywords: entry.keywords,
      date: entry.date,
      isManual: true,
    };
    setQueue(q => [qItem, ...q]);
  }

  const queueCount = queue.length;
  const activeWatchCount = Object.values(watchState).filter(Boolean).length;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Top bar */}
        <div className="topbar">
          <span className="topbar-logo">Research Brain<span className="topbar-sub">— unified encyclopedia</span></span>
          <div className="topbar-spacer" />
          <div className="topbar-nav">
            <button className={`tnav-btn ${view === "brain" ? "active" : ""}`} onClick={() => setView("brain")}>
              Brain ({brainEntries.length})
            </button>
            <button className={`tnav-btn ${view === "queue" ? "active" : ""}`} onClick={() => setView("queue")}>
              Queue {queueCount > 0 && <span style={{ background: "#c0392b", color: "white", borderRadius: "10px", padding: "1px 6px", fontSize: 10, marginLeft: 2 }}>{queueCount}</span>}
            </button>
            <button className={`tnav-btn ${view === "output" ? "active" : ""}`} onClick={() => setView("output")}>
              Output
            </button>
            <button className="tnav-btn" onClick={() => setDrawer("manual-queue")} style={{ border: "1px solid #444", marginLeft: 8 }}>
              + Add Source
            </button>
          </div>
        </div>

        {/* Watch mode bar */}
        <WatchBar watchState={watchState} onToggle={toggleWatch} />

        {/* Stream filter bar */}
        <div className="streambar">
          <span style={{ fontSize: 11, color: "#a09888" }}>Stream:</span>
          <button
            className={`stream-chip ${activeStream === "all" ? "active" : ""}`}
            style={{ background: activeStream === "all" ? "#1a1814" : "#e0dbd0", color: activeStream === "all" ? "#f4f1eb" : "#6a6458" }}
            onClick={() => setActiveStream("all")}
          >
            All
          </button>
          {STREAMS.map(s => (
            <button
              key={s.id}
              className={`stream-chip ${activeStream === s.id ? "active" : ""}`}
              style={{ background: activeStream === s.id ? s.dim : s.color + "33", color: activeStream === s.id ? s.color : "#1a1814" }}
              onClick={() => setActiveStream(s.id)}
            >
              {s.label}
            </button>
          ))}
          {activeWatchCount > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#4a7c59" }}>
              {activeWatchCount} stream{activeWatchCount !== 1 ? "s" : ""} live
            </span>
          )}
        </div>

        {/* Main content */}
        <div className="main">
          <div className="content">
            {/* Stats bar */}
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-num">{brainEntries.length}</span>
                <span className="stat-label">Brain Entries</span>
              </div>
              <div className="divider" />
              <div className="stat-item">
                <span className="stat-num">{queueCount}</span>
                <span className="stat-label">In Queue</span>
              </div>
              <div className="divider" />
              <div className="stat-item">
                <span className="stat-num">{activeWatchCount}</span>
                <span className="stat-label">Live Streams</span>
              </div>
              <div className="divider" />
              {STREAMS.map(s => (
                <div key={s.id} className="stat-item">
                  <span className="stat-num" style={{ color: s.dim }}>
                    {brainEntries.filter(e => e.streamId === s.id).length}
                  </span>
                  <span className="stat-label">{s.code}</span>
                </div>
              ))}
            </div>

            {view === "brain" && (
              <BrainView
                entries={brainEntries}
                activeStream={activeStream}
                onDelete={deleteEntry}
                onEdit={entry => setDrawer(entry)}
                onAdd={() => setDrawer("add")}
              />
            )}
            {view === "queue" && (
              <QueueView
                queue={queue}
                activeStream={activeStream}
                onApprove={approveItem}
                onReject={rejectItem}
                onApproveAll={approveAll}
              />
            )}
            {view === "output" && (
              <OutputView entries={brainEntries} activeStream={activeStream} />
            )}
          </div>
        </div>
      </div>

      {/* Drawers */}
      {(drawer === "add" || (drawer && typeof drawer === "object")) && (
        <AddDrawer
          onClose={() => setDrawer(null)}
          onAdd={addEntry}
          editEntry={typeof drawer === "object" ? drawer : null}
        />
      )}
      {drawer === "manual-queue" && (
        <AddDrawer
          onClose={() => setDrawer(null)}
          onAdd={entry => { submitManualQueue(entry); setDrawer(null); setView("queue"); }}
          editEntry={null}
        />
      )}
    </>
  );
}
