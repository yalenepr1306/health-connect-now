-- Drops legacy pre-Supabase-Auth tables that predate the current
-- profiles/user_roles/resource_requests schema and were never referenced
-- by the current app code.
--
-- hospital_requests, incoming_requests, and emergency_items were empty.
-- hospitals held a single orphaned row — a duplicate of an account that
-- already exists via profiles/user_roles — and had Row Level Security
-- disabled entirely, leaving its `password` column readable by anyone
-- with the public anon key. Applied to the live project via the
-- Supabase MCP connector.

drop table if exists public.incoming_requests;
drop table if exists public.hospital_requests;
drop table if exists public.emergency_items;
drop table if exists public.hospitals;
