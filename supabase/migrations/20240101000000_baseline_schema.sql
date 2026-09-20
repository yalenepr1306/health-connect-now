-- Baseline schema mirroring the live production project
-- (hjrayrxteuopswkxwzkb / smart-hospital-network) as of this writing,
-- so `supabase start` gives a fully working local replica. This
-- table set predates this repo's own migration history — it was
-- originally created directly on the hosted project — so it's
-- captured here as a single baseline rather than split into the
-- individual changes that produced it over time.

create type public.app_role as enum ('hospital', 'donor');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  location text,
  license_number text,
  contact_number text,
  blood_group text,
  phone text,
  available boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Authenticated can read donor profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Authenticated can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = user_id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null
);

alter table public.user_roles enable row level security;

create policy "Users can view own role"
  on public.user_roles for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own role"
  on public.user_roles for insert
  with check ((select auth.uid()) = user_id);

create table public.blood_stock (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null,
  blood_group text not null,
  units integer not null default 0,
  updated_at timestamptz default now()
);

alter table public.blood_stock enable row level security;

create policy "Anyone can read stock"
  on public.blood_stock for select
  to authenticated
  using (true);

create policy "Hospitals manage own stock"
  on public.blood_stock for all
  using (hospital_id = (select auth.uid()))
  with check (hospital_id = (select auth.uid()));

create table public.resource_requests (
  id uuid primary key default gen_random_uuid(),
  from_hospital_id uuid not null,
  from_hospital_name text not null,
  from_hospital_location text,
  to_hospital_id uuid,
  to_hospital_name text,
  type text not null check (type = any (array['blood', 'organ'])),
  blood_group text,
  organ_type text,
  organ_blood_type text,
  units_required integer,
  patient_details text,
  status text not null default 'pending' check (status = any (array['pending', 'accepted', 'rejected'])),
  created_at timestamptz default now(),
  contact_number text,
  request_details text
);

alter table public.resource_requests enable row level security;

create policy "Authenticated can insert requests"
  on public.resource_requests for insert
  to authenticated
  with check (true);

create policy "Authenticated can read requests"
  on public.resource_requests for select
  to authenticated
  using (true);

create policy "Authenticated can update requests"
  on public.resource_requests for update
  to authenticated
  using (true);

create policy "Hospitals create requests"
  on public.resource_requests for insert
  with check (from_hospital_id = (select auth.uid()));

create policy "Hospitals see own requests"
  on public.resource_requests for select
  using ((from_hospital_id = (select auth.uid())) or (to_hospital_id = (select auth.uid())));

create policy "Hospitals update incoming requests"
  on public.resource_requests for update
  using (to_hospital_id = (select auth.uid()));

create table public.emergency_requests (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null,
  hospital_name text not null,
  blood_group text not null,
  urgency text not null check (urgency = any (array['critical', 'high', 'medium'])),
  location text,
  details text,
  created_at timestamptz default now()
);

alter table public.emergency_requests enable row level security;

create policy "Anyone authenticated can read emergencies"
  on public.emergency_requests for select
  to authenticated
  using (true);

create policy "Hospitals create emergencies"
  on public.emergency_requests for insert
  with check (hospital_id = (select auth.uid()));
