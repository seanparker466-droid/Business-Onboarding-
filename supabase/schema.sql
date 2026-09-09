create extension if not exists pgcrypto;

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  contact_name text,
  company_name text,
  email text,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('submitted','reviewed')),
  reviewed_at timestamptz,
  admin_notes text,
  industry text not null default 'renovation'
);

alter table public.assessments add column if not exists updated_at timestamptz not null default now();
alter table public.assessments add column if not exists status text not null default 'submitted';
alter table public.assessments add column if not exists reviewed_at timestamptz;
alter table public.assessments add column if not exists admin_notes text;
alter table public.assessments add column if not exists industry text not null default 'renovation';

alter table public.assessments enable row level security;

drop policy if exists "public can submit assessments" on public.assessments;
create policy "public can submit assessments"
on public.assessments for insert
to anon
with check (true);

drop policy if exists "authenticated can read assessments" on public.assessments;
create policy "authenticated can read assessments"
on public.assessments for select
to authenticated
using (true);

drop policy if exists "authenticated can update assessments" on public.assessments;
create policy "authenticated can update assessments"
on public.assessments for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated can delete assessments" on public.assessments;
create policy "authenticated can delete assessments"
on public.assessments for delete
to authenticated
using (true);

-- For a single-admin first release, authenticated access is acceptable.
-- Before adding additional admin accounts, replace these authenticated policies
-- with an explicit admin-role or admin-user allowlist.
