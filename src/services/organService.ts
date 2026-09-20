import { supabase } from "@/integrations/supabase/client";
import { ok, fail, type ServiceResult } from "./result";

export interface OrganAvailabilityRecord {
  id: string;
  organ_name: string;
  blood_type: string | null;
  count: number;
}

export async function getForHospital(hospitalId: string): Promise<ServiceResult<OrganAvailabilityRecord[]>> {
  const { data, error } = await supabase
    .from("organ_availability")
    .select("id,organ_name,blood_type,count")
    .eq("hospital_id", hospitalId)
    .order("organ_name", { ascending: true });
  if (error) return fail(error.message);
  return ok((data as OrganAvailabilityRecord[] | null) ?? []);
}

export async function findRow(hospitalId: string, organName: string, bloodType: string | null): Promise<ServiceResult<{ id: string } | null>> {
  let query = supabase
    .from("organ_availability")
    .select("id")
    .eq("hospital_id", hospitalId)
    .eq("organ_name", organName);
  query = bloodType ? query.eq("blood_type", bloodType) : query.is("blood_type", null);

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) return fail(error.message);
  return ok(data);
}

export async function updateCount(id: string, count: number): Promise<ServiceResult<null>> {
  const { error } = await supabase.from("organ_availability").update({ count }).eq("id", id);
  if (error) return fail(error.message);
  return ok(null);
}

export async function insertRow(hospitalId: string, organName: string, bloodType: string | null, count: number): Promise<ServiceResult<null>> {
  const { error } = await supabase
    .from("organ_availability")
    .insert({ hospital_id: hospitalId, organ_name: organName, blood_type: bloodType, count });
  if (error) return fail(error.message);
  return ok(null);
}
