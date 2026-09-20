-- Performance-only cleanup, no behavior change:
--
-- 1. Wraps auth.uid() as (select auth.uid()) in every RLS policy so
--    Postgres evaluates it once per query instead of once per row
--    (Supabase lint 0003_auth_rls_initplan).
-- 2. Adds two missing indexes on donation_history's foreign keys
--    (Supabase lint 0001_unindexed_foreign_keys).
--
-- Applied to the live project via the Supabase MCP connector.

alter policy "Users can view own profile" on public.profiles
  using ((select auth.uid()) = user_id);

alter policy "Users can insert own profile" on public.profiles
  with check ((select auth.uid()) = user_id);

alter policy "Users can update own profile" on public.profiles
  using ((select auth.uid()) = user_id);

alter policy "Users can view own role" on public.user_roles
  using ((select auth.uid()) = user_id);

alter policy "Users can insert own role" on public.user_roles
  with check ((select auth.uid()) = user_id);

alter policy "Hospitals manage own stock" on public.blood_stock
  using (hospital_id = (select auth.uid()))
  with check (hospital_id = (select auth.uid()));

alter policy "Hospitals see own requests" on public.resource_requests
  using ((from_hospital_id = (select auth.uid())) or (to_hospital_id = (select auth.uid())));

alter policy "Hospitals create requests" on public.resource_requests
  with check (from_hospital_id = (select auth.uid()));

alter policy "Hospitals update incoming requests" on public.resource_requests
  using (to_hospital_id = (select auth.uid()));

alter policy "Hospitals create emergencies" on public.emergency_requests
  with check (hospital_id = (select auth.uid()));

alter policy "Hospitals manage their own ICU bed data" on public.icu_beds
  using ((select auth.uid()) = hospital_id)
  with check ((select auth.uid()) = hospital_id);

alter policy "Hospitals manage their own organ availability" on public.organ_availability
  using ((select auth.uid()) = hospital_id)
  with check ((select auth.uid()) = hospital_id);

alter policy "Donors manage their own donation history" on public.donation_history
  using ((select auth.uid()) = donor_id)
  with check ((select auth.uid()) = donor_id);

create index if not exists idx_donation_history_donor_id on public.donation_history (donor_id);
create index if not exists idx_donation_history_resource_request_id on public.donation_history (resource_request_id);
