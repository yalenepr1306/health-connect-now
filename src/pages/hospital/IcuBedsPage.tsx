import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import * as icuBedsService from "@/services/icuBedsService";

export default function IcuBedsPage() {
  const [total, setTotal] = useState(0);
  const [occupied, setOccupied] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadBeds = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const { data, error } = await icuBedsService.getForHospital(user.id);

    if (error) {
      toast({ title: "Could not load ICU bed data", description: error, variant: "destructive" });
      setLoading(false);
      return;
    }

    setTotal(data?.total_beds ?? 0);
    setOccupied(data?.occupied_beds ?? 0);
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    loadBeds();
  }, [loadBeds]);

  const handleUpdate = async () => {
    if (!user?.id) return;

    if (occupied > total) {
      toast({ title: "Error", description: "Occupied beds cannot exceed total beds", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await icuBedsService.upsertBeds(user.id, total, occupied);
    setSaving(false);

    if (error) {
      toast({ title: "Update failed", description: error, variant: "destructive" });
      return;
    }

    toast({ title: "Updated!", description: `ICU beds: ${occupied} occupied of ${total}` });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Update ICU Beds</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Manage Beds</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Total ICU Beds</Label>
              <Input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value))} min={0} max={999} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label>Occupied Beds</Label>
              <Input type="number" value={occupied} onChange={(e) => setOccupied(Number(e.target.value))} min={0} max={total} disabled={loading} />
            </div>
            <Button onClick={handleUpdate} className="w-full" disabled={loading || saving}>
              {saving ? "Saving..." : "Update"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Current Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span>Total Beds</span><span className="font-bold text-primary">{loading ? "..." : total}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span>Occupied</span><span className="font-bold text-accent">{loading ? "..." : occupied}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span>Available</span><span className="font-bold text-primary">{loading ? "..." : total - occupied}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
