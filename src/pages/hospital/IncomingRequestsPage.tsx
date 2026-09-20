import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ResourceRequest } from "@/lib/types";
import { MapPin, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import * as requestService from "@/services/requestService";
import * as profileService from "@/services/profileService";
import type { HospitalOption } from "@/services/profileService";

export default function IncomingRequestsPage() {
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadRequests = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const { data, error } = await requestService.getPendingIncomingFor(user.id);

    if (error) {
      toast({ title: "Could not load incoming requests", description: error, variant: "destructive" });
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    const requesterIds = Array.from(new Set(rows.map((row) => row.from_hospital_id).filter(Boolean))) as string[];

    let requesterMap: Record<string, HospitalOption> = {};
    if (requesterIds.length > 0) {
      const { data: hospitalsData } = await profileService.getProfilesByIds(requesterIds);

      requesterMap = (hospitalsData ?? []).reduce<Record<string, HospitalOption>>((acc, hospital) => {
        acc[hospital.user_id] = hospital;
        return acc;
      }, {});
    }

    const mapped: ResourceRequest[] = rows.map((row) => {
      const sourceHospital = row.from_hospital_id ? requesterMap[row.from_hospital_id] : undefined;
      return {
        id: row.id,
        fromHospital: sourceHospital?.name || "Unknown Hospital",
        fromHospitalLocation: sourceHospital?.location || undefined,
        type: row.type,
        bloodGroup: row.blood_group || undefined,
        organType: row.organ_type || undefined,
        organBloodType: row.organ_blood_type || undefined,
        unitsRequired: row.units_required || undefined,
        patientDetails: row.patient_details || undefined,
        status: row.status,
        date: row.created_at ? new Date(row.created_at).toLocaleString() : "Unknown date",
      };
    });

    setRequests(mapped);
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAction = async (id: string, action: "accepted" | "rejected") => {
    const { error } = await requestService.updateStatus(id, action);

    if (error) {
      toast({ title: "Action failed", description: error, variant: "destructive" });
      return;
    }

    const req = requests.find((r) => r.id === id);
    setRequests((prev) => prev.filter((r) => r.id !== id));

    if (action === "accepted" && req) {
      toast({
        title: "Request Accepted!",
        description: `Confirmation sent to ${req.fromHospital}.`,
      });
    } else {
      toast({ title: "Request Rejected", description: "The requesting hospital has been notified." });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Incoming Requests</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-muted-foreground">No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{r.fromHospital}</h3>
                      <Badge variant="secondary" className="capitalize">{r.type}</Badge>
                    </div>
                    {r.fromHospitalLocation && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {r.fromHospitalLocation}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-2">
                      <div><span className="font-medium">Request Type: </span><span className="capitalize">{r.type}</span></div>
                      {r.type === "organ" && r.organType && <div><span className="font-medium">Organ Type: </span>{r.organType}</div>}
                      {r.type === "organ" && r.organBloodType && <div><span className="font-medium">Blood Type of Organ: </span>{r.organBloodType}</div>}
                      {r.type === "blood" && r.bloodGroup && <div><span className="font-medium">Blood Group: </span>{r.bloodGroup}</div>}
                      {r.unitsRequired && <div><span className="font-medium">Units Required: </span>{r.unitsRequired}</div>}
                      <div><span className="font-medium">Date: </span>{r.date}</div>
                    </div>
                    {r.patientDetails && (
                      <div className="mt-2 p-3 rounded-lg bg-secondary text-sm">
                        <span className="font-medium">Patient Details: </span>{r.patientDetails}
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <Button size="sm" onClick={() => handleAction(r.id, "accepted")} className="gap-1">
                      <CheckCircle className="h-4 w-4" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(r.id, "rejected")} className="gap-1">
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
