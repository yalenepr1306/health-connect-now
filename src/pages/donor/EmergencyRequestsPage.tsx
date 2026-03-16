import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EmergencyRequest } from "@/lib/types";
import { AlertTriangle, MapPin } from "lucide-react";

export default function EmergencyRequestsPage() {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const { toast } = useToast();

  const handleAction = (id: string, action: "accept" | "decline") => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (action === "accept") {
      toast({ title: "Accepted!", description: "The hospital has been notified with your contact details." });
    } else {
      toast({ title: "Declined", description: "Request declined." });
    }
  };

  const urgencyColor = (u: string) => {
    if (u === "critical") return "destructive";
    if (u === "high") return "default";
    return "secondary";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Emergency Requests</h1>
      {requests.length === 0 ? (
        <p className="text-muted-foreground">No emergency requests at this time.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id} className={r.urgency === "critical" ? "border-accent" : ""}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`h-4 w-4 ${r.urgency === "critical" ? "text-accent" : "text-muted-foreground"}`} />
                      <h3 className="font-semibold">{r.hospitalName}</h3>
                      <Badge variant={urgencyColor(r.urgency) as any}>{r.urgency}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Blood Group Needed: <strong>{r.bloodGroup}</strong></p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" /> {r.distance} away · {r.date}
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
