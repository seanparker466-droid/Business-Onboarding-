-- Run this once in Supabase SQL Editor after the original assessments table exists.
-- Safe to run more than once.

alter table public.assessments add column if not exists updated_at timestamptz not null default now();
alter table public.assessments add column if not exists status text not null default 'submitted';
alter table public.assessments add column if not exists reviewed_at timestamptz;
alter table public.assessments add column if not exists admin_notes text;

-- Normalize any existing/null status values before adding the constraint.
update public.assessments set status = 'submitted' where status is null or status not in ('submitted','reviewed');

alter table public.assessments drop constraint if exists assessments_status_check;
alter table public.assessments add constraint assessments_status_check check (status in ('submitted','reviewed'));

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
