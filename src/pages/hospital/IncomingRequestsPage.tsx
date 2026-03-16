import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ResourceRequest } from "@/lib/types";
import { MapPin, CheckCircle, XCircle } from "lucide-react";

export default function IncomingRequestsPage() {
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const { toast } = useToast();

  const handleAction = (id: string, action: "accepted" | "rejected") => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    const req = requests.find((r) => r.id === id);
    if (action === "accepted" && req) {
      toast({
        title: "Request Accepted!",
        description: `Confirmation sent to ${req.fromHospital}. They will be notified that their ${req.type === "blood" ? `blood (${req.bloodGroup})` : `organ (${req.organType})`} request has been accepted.`,
      });
    } else {
      toast({ title: "Request Rejected", description: "The requesting hospital has been notified." });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Incoming Requests</h1>
      {requests.length === 0 ? (
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
