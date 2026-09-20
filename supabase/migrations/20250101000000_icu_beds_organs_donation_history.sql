-- Adds backing tables for the ICU beds, organ availability, and donation
-- history pages, which previously only held local component state.
--
-- Run this once against your Supabase project (SQL Editor, or
-- `supabase db push` if you use the CLI) before using those pages.

create extension if not exists pgcrypto;

-- One row per hospital.
create table if not exists public.icu_beds (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null unique references auth.users (id) on delete cascade,
  total_beds integer not null default 0,
  occupied_beds integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.icu_beds enable row level security;

create policy "Hospitals manage their own ICU bed data"
  on public.icu_beds
  for all
  using (auth.uid() = hospital_id)
  with check (auth.uid() = hospital_id);

-- One row per hospital + organ + blood type (blood_type may be null for
-- organs where it doesn't apply).
create table if not exists public.organ_availability (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references auth.users (id) on delete cascade,
  organ_name text not null,
  blood_type text,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (hospital_id, organ_name, blood_type)
);

alter table public.organ_availability enable row level security;

create policy "Hospitals manage their own organ availability"
  on public.organ_availability
  for all
  using (auth.uid() = hospital_id)
  with check (auth.uid() = hospital_id);

-- One row per donation event, owned by the donor. Created when a donor
-- accepts a request, and updated by the donor once the donation happens.
create table if not exists public.donation_history (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references auth.users (id) on delete cascade,
  hospital_name text,
  blood_group text,
  donation_date timestamptz not null default now(),
  status text not null default 'scheduled' check (status in ('completed', 'scheduled', 'cancelled')),
  resource_request_id uuid references public.resource_requests (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.donation_history enable row level security;

create policy "Donors manage their own donation history"
  on public.donation_history
  for all
  using (auth.uid() = donor_id)
  with check (auth.uid() = donor_id);
