create table if not exists public.listens_snapshots (
    id text primary key,
    snapshot jsonb not null,
    generated_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint listens_snapshots_current_id check (id = 'current')
);

comment on table public.listens_snapshots is
    'Latest prepared listening snapshot consumed by the public listens page.';

alter table public.listens_snapshots enable row level security;

drop policy if exists "Public can read the current listens snapshot"
    on public.listens_snapshots;

create policy "Public can read the current listens snapshot"
    on public.listens_snapshots
    for select
    to anon, authenticated
    using (id = 'current');

grant select on public.listens_snapshots to anon, authenticated;
revoke insert, update, delete on public.listens_snapshots from anon, authenticated;
