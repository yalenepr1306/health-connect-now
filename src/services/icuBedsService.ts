import { supabase } from "@/integrations/supabase/client";
import { ok, fail, type ServiceResult } from "./result";

export interface IcuBedsRecord {
  total_beds: number;
  occupied_beds: number;
}

export async function getForHospital(hospitalId: string): Promise<ServiceResult<IcuBedsRecord | null>> {
  const { data, error } = await supabase
    .from("icu_beds")
    .select("total_beds,occupied_beds")
    .eq("hospital_id", hospitalId)
    .maybeSingle();
  if (error) return fail(error.message);
  return ok(data);
}

export async function upsertBeds(hospitalId: string, totalBeds: number, occupiedBeds: number): Promise<ServiceResult<null>> {
  const { error } = await supabase
    .from("icu_beds")
    .upsert({ hospital_id: hospitalId, total_beds: totalBeds, occupied_beds: occupiedBeds }, { onConflict: "hospital_id" });
  if (error) return fail(error.message);
  return ok(null);
}
