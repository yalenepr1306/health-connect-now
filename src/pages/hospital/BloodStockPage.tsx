import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BLOOD_GROUPS } from "@/lib/mock-data";
import { BloodStock } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import * as bloodStockService from "@/services/bloodStockService";

export default function BloodStockPage() {
  const [stock, setStock] = useState<BloodStock[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [units, setUnits] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadStock = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const { data, error } = await bloodStockService.getStockForHospital(user.id);

    if (error) {
      toast({ title: "Could not load blood stock", description: error, variant: "destructive" });
      setLoading(false);
      return;
    }

    const mapped = (data ?? []).map((row) => ({
      bloodGroup: row.blood_group,
      units: Number(row.units ?? 0),
    }));

    setStock(mapped);
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const handleUpdate = async () => {
    if (!user?.id) return;

    const parsedUnits = Number(units);
    if (!selectedGroup || Number.isNaN(parsedUnits) || parsedUnits < 0) {
      toast({ title: "Error", description: "Select blood group and enter valid units", variant: "destructive" });
      return;
    }

    setSaving(true);

    const { data: existing, error: existingError } = await bloodStockService.findStockRow(user.id, selectedGroup);

    if (existingError) {
      setSaving(false);
      toast({ title: "Update failed", description: existingError, variant: "destructive" });
      return;
    }

    const { error } = existing?.id
      ? await bloodStockService.updateStockUnits(existing.id, parsedUnits)
      : await bloodStockService.insertStock(user.id, selectedGroup, parsedUnits);

    if (error) {
      setSaving(false);
      toast({ title: "Update failed", description: error, variant: "destructive" });
      return;
    }

    setStock((prev) => {
      const index = prev.findIndex((item) => item.bloodGroup === selectedGroup);
      if (index >= 0) {
        return prev.map((item) => item.bloodGroup === selectedGroup ? { ...item, units: parsedUnits } : item);
      }
      return [...prev, { bloodGroup: selectedGroup, units: parsedUnits }].sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));
    });

    toast({ title: "Updated!", description: `${selectedGroup} stock updated to ${parsedUnits} units` });
    setUnits("");
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Update Blood Stock</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Update Stock</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>{BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Units Available</Label>
              <Input type="number" placeholder="Enter units" value={units} onChange={(e) => setUnits(e.target.value)} min={0} max={9999} />
            </div>
            <Button onClick={handleUpdate} className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Update Stock"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Current Stock</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading stock data...</p>
            ) : stock.length === 0 ? (
              <p className="text-muted-foreground text-sm">No stock data yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {stock.map((s) => (
                  <div key={s.bloodGroup} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <span className="font-semibold text-primary">{s.bloodGroup}</span>
                    <span className="text-sm">{s.units} units</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
