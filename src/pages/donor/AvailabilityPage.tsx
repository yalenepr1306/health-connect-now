import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function AvailabilityPage() {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadAvailability = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("available")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        toast({ title: "Could not load status", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      setAvailable(Boolean(data?.available));
      setLoading(false);
    };

    loadAvailability();
  }, [toast, user?.id]);

  const toggle = async (nextValue: boolean) => {
    if (!user?.id) return;

    const previous = available;
    setAvailable(nextValue);

    const { error } = await supabase
      .from("profiles")
      .update({ available: nextValue })
      .eq("user_id", user.id);

    if (error) {
      setAvailable(previous);
      toast({ title: "Status update failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Status Updated", description: `You are now ${nextValue ? "available" : "unavailable"} for donations.` });
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
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : available ? "Available for Donation" : "Not Available"}
              </p>
            </div>
            <Switch checked={available} onCheckedChange={toggle} disabled={loading} />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            When available, you will receive emergency blood donation requests from nearby hospitals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
