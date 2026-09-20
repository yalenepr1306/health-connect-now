import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import * as requestService from "@/services/requestService";
import { AlertTriangle, MapPin } from "lucide-react";

interface DonorRequest {
  id: string;
  hospitalName: string;
  hospitalLocation: string;
  bloodGroup: string;
  urgency: "critical" | "high" | "medium";
  date: string;
  status: string;
}

export default function EmergencyRequestsPage() {
  const [requests, setRequests] = useState<DonorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRequests = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await requestService.getPendingIncomingFor(user.id);

    if (error) {
      toast({ title: "Error loading requests", description: error, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Filter only donor requests (marked with [DONOR_REQUEST])
    const donorRequests = (data ?? [])
      .filter((r) => r.patient_details?.startsWith("[DONOR_REQUEST]"))
      .map((r) => ({
        id: r.id,
        hospitalName: r.from_hospital_name || "Unknown Hospital",
        hospitalLocation: r.from_hospital_location || "Unknown",
        bloodGroup: r.blood_group || "N/A",
        urgency: "high" as const,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
        status: r.status,
      }));

    setRequests(donorRequests);
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleAction = async (id: string, action: "accept" | "decline") => {
    const newStatus = action === "accept" ? "accepted" : "rejected";
    const { error } = await requestService.updateStatus(id, newStatus);

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
      return;
    }

    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (action === "accept") {
      toast({ title: "Accepted!", description: "The hospital has been notified with your contact details." });
    } else {
      toast({ title: "Declined", description: "Request declined." });
    }
  };

  const urgencyColor = (u: string): "destructive" | "default" | "secondary" => {
    if (u === "critical") return "destructive";
    if (u === "high") return "default";
    return "secondary";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Emergency Requests</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-muted-foreground">No emergency requests at this time.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">{r.hospitalName}</h3>
                      <Badge variant={urgencyColor(r.urgency)}>{r.urgency}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Blood Group Needed: <strong>{r.bloodGroup}</strong></p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" /> {r.hospitalLocation} · {r.date}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAction(r.id, "accept")}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(r.id, "decline")}>Decline</Button>
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
