import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/types";
import { ok, fail, type ServiceResult } from "./result";

export interface ProfileRecord {
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  blood_group: string | null;
  available: boolean | null;
  license_number: string | null;
  contact_number: string | null;
  created_at?: string | null;
}

export interface HospitalOption {
  user_id: string;
  name: string | null;
  location: string | null;
}

export interface DonorOption {
  user_id: string;
  name: string | null;
  blood_group: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  available: boolean | null;
}

export interface DonorRegistrationInput {
  userId: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  location: string;
  available: boolean;
}

export interface HospitalRegistrationInput {
  userId: string;
  name: string;
  email: string;
  location: string;
  licenseNumber: string;
  contactNumber: string;
}

export async function getProfile(userId: string): Promise<ServiceResult<ProfileRecord | null>> {
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) return fail(error.message);
  return ok(data as ProfileRecord | null);
}

export async function getUserRole(userId: string): Promise<ServiceResult<{ role: UserRole } | null>> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
  if (error) return fail(error.message);
  return ok(data as { role: UserRole } | null);
}

export async function insertDonorProfile(input: DonorRegistrationInput): Promise<ServiceResult<null>> {
  const { error } = await supabase.from("profiles").insert({
    user_id: input.userId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    blood_group: input.bloodGroup,
    location: input.location,
    available: input.available,
  });
  if (error) return fail(error.message);
  return ok(null);
}

export async function insertHospitalProfile(input: HospitalRegistrationInput): Promise<ServiceResult<null>> {
  const { error } = await supabase.from("profiles").insert({
    user_id: input.userId,
    name: input.name,
    email: input.email,
    location: input.location,
    license_number: input.licenseNumber,
    contact_number: input.contactNumber,
  });
  if (error) return fail(error.message);
  return ok(null);
}

export async function insertUserRole(userId: string, role: UserRole): Promise<ServiceResult<null>> {
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
  if (error) return fail(error.message);
  return ok(null);
}

export async function getAvailability(userId: string): Promise<ServiceResult<boolean>> {
  const { data, error } = await supabase.from("profiles").select("available").eq("user_id", userId).maybeSingle();
  if (error) return fail(error.message);
  return ok(Boolean(data?.available));
}

export async function updateAvailability(userId: string, available: boolean): Promise<ServiceResult<null>> {
  const { error } = await supabase.from("profiles").update({ available }).eq("user_id", userId);
  if (error) return fail(error.message);
  return ok(null);
}

export async function listOtherHospitals(excludeUserId: string): Promise<ServiceResult<HospitalOption[]>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,name,location")
    .not("license_number", "is", null)
    .neq("user_id", excludeUserId)
    .order("name", { ascending: true });
  if (error) return fail(error.message);
  return ok((data as HospitalOption[] | null) ?? []);
}

export async function countOtherHospitals(excludeUserId: string): Promise<ServiceResult<number>> {
  const { count, error } = await supabase
    .from("profiles")
    .select("user_id", { count: "exact", head: true })
    .not("license_number", "is", null)
    .neq("user_id", excludeUserId);
  if (error) return fail(error.message);
  return ok(count ?? 0);
}

export async function listAvailableDonors(): Promise<ServiceResult<DonorOption[]>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,name,blood_group,phone,email,location,available")
    .not("blood_group", "is", null)
    .eq("available", true)
    .order("name", { ascending: true });
  if (error) return fail(error.message);
  return ok((data as DonorOption[] | null) ?? []);
}

export async function getProfilesByIds(userIds: string[]): Promise<ServiceResult<HospitalOption[]>> {
  if (userIds.length === 0) return ok([]);
  const { data, error } = await supabase.from("profiles").select("user_id,name,location").in("user_id", userIds);
  if (error) return fail(error.message);
  return ok((data as HospitalOption[] | null) ?? []);
}

export function subscribeToProfile(userId: string, onChange: (profile: ProfileRecord) => void): () => void {
  const channel = supabase
    .channel(`profile-changes-${userId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${userId}` },
      (payload) => {
        onChange(payload.new as ProfileRecord);
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
