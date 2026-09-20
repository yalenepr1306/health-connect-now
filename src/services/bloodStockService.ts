import { supabase } from "@/integrations/supabase/client";
import { ok, fail, type ServiceResult } from "./result";

export interface BloodStockRecord {
  id: string;
  blood_group: string;
  units: number | null;
}

export async function getStockForHospital(hospitalId: string): Promise<ServiceResult<BloodStockRecord[]>> {
  const { data, error } = await supabase
    .from("blood_stock")
    .select("id,blood_group,units")
    .eq("hospital_id", hospitalId)
    .order("blood_group", { ascending: true });
  if (error) return fail(error.message);
  return ok((data as BloodStockRecord[] | null) ?? []);
}

export async function findStockRow(hospitalId: string, bloodGroup: string): Promise<ServiceResult<{ id: string } | null>> {
  const { data, error } = await supabase
    .from("blood_stock")
    .select("id")
    .eq("hospital_id", hospitalId)
    .eq("blood_group", bloodGroup)
    .limit(1)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok(data);
}

export async function updateStockUnits(id: string, units: number): Promise<ServiceResult<null>> {
  const { error } = await supabase.from("blood_stock").update({ units }).eq("id", id);
  if (error) return fail(error.message);
  return ok(null);
}

export async function insertStock(hospitalId: string, bloodGroup: string, units: number): Promise<ServiceResult<null>> {
  const { error } = await supabase.from("blood_stock").insert({ hospital_id: hospitalId, blood_group: bloodGroup, units });
  if (error) return fail(error.message);
  return ok(null);
}
