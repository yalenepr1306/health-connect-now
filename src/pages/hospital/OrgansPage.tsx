import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BLOOD_GROUPS, ORGAN_TYPES } from "@/lib/mock-data";
import { OrganAvailability } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as organService from "@/services/organService";

export default function OrgansPage() {
  const [organs, setOrgans] = useState<OrganAvailability[]>([]);
  const [organName, setOrganName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [count, setCount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadOrgans = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const { data, error } = await organService.getForHospital(user.id);

    if (error) {
      toast({ title: "Could not load organ availability", description: error, variant: "destructive" });
      setLoading(false);
      return;
    }

    setOrgans((data ?? []).map((row) => ({
      organName: row.organ_name,
      bloodType: row.blood_type ?? "N/A",
      count: row.count,
    })));
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    loadOrgans();
  }, [loadOrgans]);

  const handleUpdate = async () => {
    if (!user?.id) return;

    if (!organName || !bloodType || !count) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const parsedCount = parseInt(count, 10);
    const storedBloodType = bloodType === "N/A" ? null : bloodType;

    setSaving(true);

    const { data: existing, error: existingError } = await organService.findRow(user.id, organName, storedBloodType);

    if (existingError) {
      setSaving(false);
      toast({ title: "Update failed", description: existingError, variant: "destructive" });
      return;
    }

    const { error } = existing?.id
      ? await organService.updateCount(existing.id, parsedCount)
      : await organService.insertRow(user.id, organName, storedBloodType, parsedCount);

    setSaving(false);

    if (error) {
      toast({ title: "Update failed", description: error, variant: "destructive" });
      return;
    }

    setOrgans((prev) => {
      const existingIndex = prev.findIndex((o) => o.organName === organName && o.bloodType === bloodType);
      if (existingIndex >= 0) {
        return prev.map((o, i) => (i === existingIndex ? { ...o, count: parsedCount } : o));
      }
      return [...prev, { organName, bloodType, count: parsedCount }];
    });

    toast({ title: "Updated!", description: `${organName} (${bloodType}) updated to ${parsedCount}` });
    setCount("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Update Organ Availability</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Update Organ</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organ Name</Label>
              <Select value={organName} onValueChange={setOrganName}>
                <SelectTrigger><SelectValue placeholder="Select organ" /></SelectTrigger>
                <SelectContent>{ORGAN_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Blood Type (if applicable)</Label>
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="N/A">N/A</SelectItem>
                  {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number Available</Label>
              <Input type="number" placeholder="Enter count" value={count} onChange={(e) => setCount(e.target.value)} min={0} max={999} />
            </div>
            <Button onClick={handleUpdate} className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Update Availability"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Current Availability</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading organ data...</p>
            ) : organs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No organ data yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organ</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organs.map((o) => (
                    <TableRow key={`${o.organName}-${o.bloodType}`}>
                      <TableCell className="font-medium">{o.organName}</TableCell>
                      <TableCell>{o.bloodType}</TableCell>
                      <TableCell className={o.count > 0 ? "text-green-600 font-semibold" : "text-muted-foreground"}>{o.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
