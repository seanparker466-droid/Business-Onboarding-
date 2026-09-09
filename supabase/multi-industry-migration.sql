-- Run this once in Supabase SQL Editor to add multi-industry support.
-- Safe to run more than once. Existing rows default to 'renovation', which
-- is correct since they were collected before this column existed.

alter table public.assessments add column if not exists industry text not null default 'renovation';
