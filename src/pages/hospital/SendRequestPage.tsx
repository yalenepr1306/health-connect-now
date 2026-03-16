import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BLOOD_GROUPS, ORGAN_TYPES } from "@/lib/mock-data";
import { MapPin, Send } from "lucide-react";

export default function SendRequestPage() {
  const [type, setType] = useState<"blood" | "organ">("blood");
  const [resource, setResource] = useState("");
  const [organBloodType, setOrganBloodType] = useState("");
  const [units, setUnits] = useState("");
  const [patientDetails, setPatientDetails] = useState("");
  const { toast } = useToast();

  const handleSend = () => {
    if (!resource) {
      toast({ title: "Error", description: "Please select a resource", variant: "destructive" });
      return;
    }
    if (type === "blood" && !units) {
      toast({ title: "Error", description: "Please enter units required", variant: "destructive" });
      return;
    }
    if (type === "organ" && !organBloodType) {
      toast({ title: "Error", description: "Please select blood type of organ", variant: "destructive" });
      return;
    }
    toast({ title: "Request Sent!", description: "Your request has been submitted to nearby hospitals." });
    setResource("");
    setUnits("");
    setOrganBloodType("");
    setPatientDetails("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Send Request to Nearby Hospitals</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> New Request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select value={type} onValueChange={(v) => { setType(v as "blood" | "organ"); setResource(""); setUnits(""); setOrganBloodType(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">Blood</SelectItem>
                  <SelectItem value="organ">Organ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{type === "blood" ? "Blood Group" : "Organ Type"}</Label>
              <Select value={resource} onValueChange={setResource}>
                <SelectTrigger><SelectValue placeholder={`Select ${type === "blood" ? "blood group" : "organ type"}`} /></SelectTrigger>
                <SelectContent>
                  {(type === "blood" ? BLOOD_GROUPS : ORGAN_TYPES).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {type === "organ" && (
              <div className="space-y-2">
                <Label>Blood Type of Organ</Label>
                <Select value={organBloodType} onValueChange={setOrganBloodType}>
                  <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === "blood" && (
              <div className="space-y-2">
                <Label>Units of Blood Required</Label>
                <Input type="number" placeholder="Enter units" value={units} onChange={(e) => setUnits(e.target.value)} min={1} max={100} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Details About Patient</Label>
              <Textarea
                placeholder="Enter patient condition, urgency level, and any additional details."
                value={patientDetails}
                onChange={(e) => setPatientDetails(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleSend} className="w-full">
              <Send className="mr-2 h-4 w-4" /> Submit Request
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Nearby Hospitals</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No nearby hospitals found. Connect your database to load hospital data.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
