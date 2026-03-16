import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BLOOD_GROUPS, ORGAN_TYPES } from "@/lib/mock-data";
import { OrganAvailability } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function OrgansPage() {
  const [organs, setOrgans] = useState<OrganAvailability[]>([]);
  const [organName, setOrganName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [count, setCount] = useState("");
  const { toast } = useToast();

  const handleUpdate = () => {
    if (!organName || !bloodType || !count) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    const existing = organs.findIndex((o) => o.organName === organName && o.bloodType === bloodType);
    if (existing >= 0) {
      setOrgans((prev) => prev.map((o, i) => i === existing ? { ...o, count: parseInt(count) } : o));
    } else {
      setOrgans((prev) => [...prev, { organName, bloodType, count: parseInt(count) }]);
    }
    toast({ title: "Updated!", description: `${organName} (${bloodType}) updated to ${count}` });
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
            <Button onClick={handleUpdate} className="w-full">Update Availability</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Current Availability</CardTitle></CardHeader>
          <CardContent>
            {organs.length === 0 ? (
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
                  {organs.map((o, i) => (
                    <TableRow key={i}>
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
