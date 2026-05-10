/**
 * Vercel Cron Function — Topic Surge Monitor
 *
 * Schedule: daily at 06:00 UTC (configured in vercel.json)
 *
 * For each source in Supabase, fetches the live page and compares against a
 * stored content hash. On change, logs a new row in source_updates and
 * increments the tag frequency counters used to compute Stream Pulse signals.
 *
 * Surge score = (tag count last 7 days) / (tag count prior 7 days) - 1
 * Scores ≥ 0.5 are marked hot=true in the stream_signals table.
 *
 * Required env vars (set in Vercel dashboard):
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (service role key — NOT the anon key)
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple hash for change detection (not cryptographic)
function hashContent(text) {
  let h = 0;
  for (let i = 0; i < Math.min(text.length, 8000); i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return h.toString(16);
}

async function fetchPageHash(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "ResearchBrain-Monitor/1.0" },
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();
  return { hash: hashContent(text), status: res.status };
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export default async function handler(req, res) {
  // Vercel cron passes a special header; reject non-cron calls in production
  if (
    process.env.VERCEL_ENV === "production" &&
    req.headers["x-vercel-cron"] !== "1"
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Supabase env vars not configured" });
  }

  // Fetch all sources
  const { data: sources, error } = await supabase
    .from("sources")
    .select("id, url, tags, content_hash");
  if (error) return res.status(500).json({ error: error.message });

  const results = { checked: 0, changed: 0, errors: 0 };

  for (const src of sources ?? []) {
    if (!src.url) continue;
    results.checked++;
    try {
      const { hash, status } = await fetchPageHash(src.url);
      if (status < 200 || status >= 400) continue;

      if (hash !== src.content_hash) {
        results.changed++;
        const date = new Date().toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        });

        // Log update
        await supabase.from("source_updates").insert({
          source_id: src.id,
          date,
          note: "Content change detected by automated monitor.",
        });

        // Store new hash
        await supabase
          .from("sources")
          .update({ content_hash: hash, updated_at: new Date().toISOString() })
          .eq("id", src.id);
      }
    } catch {
      results.errors++;
    }
  }

  // Compute surge scores per tag across all streams
  const now7 = daysAgo(7);
  const prior7start = daysAgo(14);

  const { data: recentUpdates } = await supabase
    .from("source_updates")
    .select("source_id, created_at")
    .gte("created_at", prior7start);

  if (recentUpdates && recentUpdates.length > 0) {
    // Build source_id → tags map
    const { data: tagMap } = await supabase
      .from("sources")
      .select("id, tags, stream_id");
    const srcTags = Object.fromEntries((tagMap ?? []).map(s => [s.id, { tags: s.tags || [], streamId: s.stream_id }]));

    const last7 = {};
    const prev7 = {};
    for (const u of recentUpdates) {
      const info = srcTags[u.source_id];
      if (!info) continue;
      const bucket = u.created_at >= now7 ? last7 : prev7;
      for (const tag of info.tags) {
        bucket[tag] = (bucket[tag] || 0) + 1;
      }
    }

    // Upsert surge signals
    const allTags = new Set([...Object.keys(last7), ...Object.keys(prev7)]);
    const signals = [];
    for (const tag of allTags) {
      const l = last7[tag] || 0;
      const p = prev7[tag] || 0;
      const surge = p > 0 ? (l / p - 1) : (l > 0 ? 1 : 0);
      signals.push({ tag, last7: l, prior7: p, surge_score: surge, hot: surge >= 0.5, computed_at: new Date().toISOString() });
    }
    if (signals.length > 0) {
      await supabase.from("stream_signals").upsert(signals, { onConflict: "tag" });
    }
  }

  return res.status(200).json({ ok: true, ...results });
}
