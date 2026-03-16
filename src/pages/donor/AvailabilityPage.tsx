import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function AvailabilityPage() {
  const [available, setAvailable] = useState(false);
  const { toast } = useToast();

  const toggle = () => {
    const newStatus = !available;
    setAvailable(newStatus);
    toast({ title: "Status Updated", description: `You are now ${newStatus ? "available" : "unavailable"} for donations.` });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Availability Status</h1>
      <Card className="max-w-md">
        <CardHeader><CardTitle>Donation Availability</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div>
              <p className="font-medium">Current Status</p>
              <p className={`text-sm ${available ? "text-green-600" : "text-muted-foreground"}`}>
                {available ? "Available for Donation" : "Not Available"}
              </p>
            </div>
            <Switch checked={available} onCheckedChange={toggle} />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            When available, you will receive emergency blood donation requests from nearby hospitals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
