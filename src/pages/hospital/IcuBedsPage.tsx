import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function IcuBedsPage() {
  const [total, setTotal] = useState(30);
  const [occupied, setOccupied] = useState(24);
  const { toast } = useToast();

  const handleUpdate = () => {
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
              <Input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value))} min={0} max={999} />
            </div>
            <div className="space-y-2">
              <Label>Occupied Beds</Label>
              <Input type="number" value={occupied} onChange={(e) => setOccupied(Number(e.target.value))} min={0} max={total} />
            </div>
            <Button onClick={handleUpdate} className="w-full">Update</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Current Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span>Total Beds</span><span className="font-bold text-primary">{total}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span>Occupied</span><span className="font-bold text-accent">{occupied}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
                <span>Available</span><span className="font-bold text-primary">{total - occupied}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
