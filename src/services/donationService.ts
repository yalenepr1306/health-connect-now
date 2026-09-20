import { supabase } from "@/integrations/supabase/client";
import { ok, fail, type ServiceResult } from "./result";

export type DonationStatus = "completed" | "scheduled" | "cancelled";

export interface DonationRecord {
  id: string;
  hospital_name: string | null;
  blood_group: string | null;
  donation_date: string;
  status: DonationStatus;
}

export interface NewDonationRecord {
  donorId: string;
  hospitalName: string | null;
  bloodGroup: string | null;
  resourceRequestId?: string | null;
}

export async function getForDonor(donorId: string): Promise<ServiceResult<DonationRecord[]>> {
  const { data, error } = await supabase
    .from("donation_history")
    .select("id,hospital_name,blood_group,donation_date,status")
    .eq("donor_id", donorId)
    .order("donation_date", { ascending: false });
  if (error) return fail(error.message);
  return ok((data as DonationRecord[] | null) ?? []);
}

export async function createRecord(input: NewDonationRecord): Promise<ServiceResult<null>> {
  const { error } = await supabase.from("donation_history").insert({
    donor_id: input.donorId,
    hospital_name: input.hospitalName,
    blood_group: input.bloodGroup,
    resource_request_id: input.resourceRequestId ?? null,
    status: "scheduled",
  });
  if (error) return fail(error.message);
  return ok(null);
}

export async function markCompleted(id: string): Promise<ServiceResult<null>> {
  const { error } = await supabase.from("donation_history").update({ status: "completed" }).eq("id", id);
  if (error) return fail(error.message);
  return ok(null);
}
