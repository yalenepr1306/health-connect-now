import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BLOOD_GROUPS } from "@/lib/mock-data";
import { BloodStock } from "@/lib/types";

export default function BloodStockPage() {
  const [stock, setStock] = useState<BloodStock[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [units, setUnits] = useState("");
  const { toast } = useToast();

  const handleUpdate = () => {
    if (!selectedGroup || !units) {
      toast({ title: "Error", description: "Select blood group and enter units", variant: "destructive" });
      return;
    }
    setStock((prev) => {
      const existing = prev.findIndex((s) => s.bloodGroup === selectedGroup);
      if (existing >= 0) {
        return prev.map((s) => s.bloodGroup === selectedGroup ? { ...s, units: parseInt(units) } : s);
      }
      return [...prev, { bloodGroup: selectedGroup, units: parseInt(units) }];
    });
    toast({ title: "Updated!", description: `${selectedGroup} stock updated to ${units} units` });
    setUnits("");
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
            <Button onClick={handleUpdate} className="w-full">Update Stock</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Current Stock</CardTitle></CardHeader>
          <CardContent>
            {stock.length === 0 ? (
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
