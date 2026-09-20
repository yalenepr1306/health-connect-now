import { supabase } from "@/integrations/supabase/client";
import { ok, fail, type ServiceResult } from "./result";

export type ResourceRequestType = "blood" | "organ";
export type ResourceRequestStatus = "pending" | "accepted" | "rejected";

export interface ResourceRequestRecord {
  id: string;
  from_hospital_id: string | null;
  from_hospital_name: string | null;
  from_hospital_location: string | null;
  to_hospital_id: string | null;
  type: ResourceRequestType;
  blood_group: string | null;
  organ_type: string | null;
  organ_blood_type: string | null;
  units_required: number | null;
  patient_details: string | null;
  status: ResourceRequestStatus;
  created_at: string | null;
}

export interface NewResourceRequest {
  from_hospital_id: string;
  from_hospital_name: string | null;
  from_hospital_location: string | null;
  to_hospital_id: string;
  type: ResourceRequestType;
  blood_group: string | null;
  organ_type: string | null;
  organ_blood_type: string | null;
  units_required: number | null;
  patient_details: string | null;
}

export async function createRequests(rows: NewResourceRequest[]): Promise<ServiceResult<null>> {
  const payload = rows.map((row) => ({ ...row, status: "pending" as const }));
  const { error } = await supabase.from("resource_requests").insert(payload);
  if (error) return fail(error.message);
  return ok(null);
}

export async function getPendingIncomingFor(recipientId: string, limit?: number): Promise<ServiceResult<ResourceRequestRecord[]>> {
  let query = supabase
    .from("resource_requests")
    .select("*")
    .eq("to_hospital_id", recipientId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return fail(error.message);
  return ok((data as ResourceRequestRecord[] | null) ?? []);
}

export async function getSentDecidedFor(hospitalId: string, limit?: number): Promise<ServiceResult<ResourceRequestRecord[]>> {
  let query = supabase
    .from("resource_requests")
    .select("*")
    .eq("from_hospital_id", hospitalId)
    .in("status", ["accepted", "rejected"])
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return fail(error.message);
  return ok((data as ResourceRequestRecord[] | null) ?? []);
}

export async function getHistoryFor(hospitalId: string): Promise<ServiceResult<ResourceRequestRecord[]>> {
  const { data, error } = await supabase
    .from("resource_requests")
    .select("*")
    .or(`from_hospital_id.eq.${hospitalId},to_hospital_id.eq.${hospitalId}`)
    .order("created_at", { ascending: false });
  if (error) return fail(error.message);
  return ok((data as ResourceRequestRecord[] | null) ?? []);
}

export async function updateStatus(id: string, status: ResourceRequestStatus): Promise<ServiceResult<null>> {
  const { error } = await supabase.from("resource_requests").update({ status }).eq("id", id);
  if (error) return fail(error.message);
  return ok(null);
}

export async function countPendingOutgoing(hospitalId: string): Promise<ServiceResult<number>> {
  const { count, error } = await supabase
    .from("resource_requests")
    .select("id", { count: "exact", head: true })
    .eq("from_hospital_id", hospitalId)
    .eq("status", "pending");
  if (error) return fail(error.message);
  return ok(count ?? 0);
}

export async function countPendingIncoming(hospitalId: string): Promise<ServiceResult<number>> {
  const { count, error } = await supabase
    .from("resource_requests")
    .select("id", { count: "exact", head: true })
    .eq("to_hospital_id", hospitalId)
    .eq("status", "pending");
  if (error) return fail(error.message);
  return ok(count ?? 0);
}
