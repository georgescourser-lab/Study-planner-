-- ====================================================================
-- AZ-900 Personal Study Planner - Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ====================================================================

-- 1. Enable UUID Extension (supports both pgcrypto and uuid-ossp)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Drop existing tables if recreating (safe idempotent setup)
-- drop table if exists public.study_tasks cascade;
-- drop table if exists public.study_plans cascade;

-- 2. Study Plans Table (Stores onboarding constraints)
create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null, -- Nullable for quick hackathon demo without mandatory login
  exam_date date not null,
  daily_minutes integer not null default 30,
  weekend_multiplier boolean not null default true,
  confidence_scores jsonb not null default '{"cloud_concepts": 3, "architecture_services": 2, "management_governance": 3}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Study Tasks Table (Stores individual daily study blocks)
create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.study_plans(id) on delete cascade,
  day_number integer not null,
  scheduled_date date not null,
  domain text not null, -- 'Cloud Concepts' | 'Azure Architecture & Services' | 'Management & Governance' | 'Final Review'
  domain_key text not null default 'cloud-concepts', -- 'cloud-concepts' | 'architecture-services' | 'management-governance' | 'final-review'
  topic_title text not null,
  topic_subtitle text null,
  action_item text not null,
  sandbox_task text not null,
  sandbox_steps jsonb not null default '[]'::jsonb,
  ms_learn_search_term text not null,
  checkpoint_question text not null,
  checkpoint_answer text not null,
  key_takeaway text null,
  estimated_minutes integer not null default 30,
  status text not null default 'pending' check (status in ('pending', 'up-next', 'completed', 'skipped', 'rebalanced')),
  user_answer text null,
  is_answer_revealed boolean not null default false,
  completed_at timestamp with time zone null,
  rebalanced_from_day integer null,
  created_at timestamp with time zone default now()
);

-- 4. Performance Indexes for Lightning Fast Queries
create index if not exists idx_study_tasks_plan_id on public.study_tasks(plan_id);
create index if not exists idx_study_tasks_day_number on public.study_tasks(plan_id, day_number);
create index if not exists idx_study_tasks_status on public.study_tasks(plan_id, status);
create index if not exists idx_study_plans_created_at on public.study_plans(created_at desc);

-- 5. Row Level Security (RLS) Setup
-- Enable RLS for production security
alter table public.study_plans enable row level security;
alter table public.study_tasks enable row level security;

-- Demo-friendly RLS Policies: Allow public anonymous access for hackathon demo
-- (Can be restricted to auth.uid() = user_id when Supabase Auth is enabled)
drop policy if exists "Allow public access to study_plans" on public.study_plans;
create policy "Allow public access to study_plans"
  on public.study_plans
  for all
  using (true)
  with check (true);

drop policy if exists "Allow public access to study_tasks" on public.study_tasks;
create policy "Allow public access to study_tasks"
  on public.study_tasks
  for all
  using (true)
  with check (true);

-- 6. Trigger to auto-update updated_at on study_plans
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_study_plans_updated_at on public.study_plans;
create trigger set_study_plans_updated_at
  before update on public.study_plans
  for each row
  execute function public.handle_updated_at();

-- Verification Query (Run this to verify schema setup):
-- select table_name, column_name, data_type from information_schema.columns where table_schema = 'public' and table_name in ('study_plans', 'study_tasks');
