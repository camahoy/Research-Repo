-- Research Brain v2 schema
-- Run in your Supabase SQL editor

create table if not exists streams (
  id text primary key,
  label text, code text, color text, dim text,
  scope jsonb, digest jsonb,
  created_at timestamptz default now()
);

create table if not exists sources (
  id text primary key,
  stream_id text references streams(id),
  title text, org text, url text, description text,
  tags text[],
  type text, role text, cadence text,
  content_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists source_updates (
  id uuid default gen_random_uuid() primary key,
  source_id text references sources(id) on delete cascade,
  date text, note text,
  created_at timestamptz default now()
);

-- Used by the /api/monitor cron to surface topic surge signals
create table if not exists stream_signals (
  tag text primary key,
  last7 int default 0,
  prior7 int default 0,
  surge_score numeric default 0,
  hot boolean default false,
  computed_at timestamptz default now()
);

-- Enable Row Level Security (configure policies as needed for your auth setup)
alter table streams enable row level security;
alter table sources enable row level security;
alter table source_updates enable row level security;
alter table stream_signals enable row level security;

-- Example: allow anon read on all tables (adjust for your auth model)
create policy "anon read streams" on streams for select using (true);
create policy "anon read sources" on sources for select using (true);
create policy "anon read source_updates" on source_updates for select using (true);
create policy "anon read stream_signals" on stream_signals for select using (true);
