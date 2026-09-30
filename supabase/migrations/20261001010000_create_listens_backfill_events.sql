create table if not exists public.listens_backfill_events (
    id text primary key,
    played_at timestamptz not null,
    track_name text not null,
    artist_name text not null,
    album_name text not null default '',
    spotify_track_uri text not null,
    image_url text not null default '',
    created_at timestamptz not null default now()
);

comment on table public.listens_backfill_events is
    'Private, sanitized listening events used to repair gaps in the Last.fm history.';

create index if not exists listens_backfill_events_played_at_idx
    on public.listens_backfill_events (played_at);

alter table public.listens_backfill_events enable row level security;

revoke all on public.listens_backfill_events from anon, authenticated;
