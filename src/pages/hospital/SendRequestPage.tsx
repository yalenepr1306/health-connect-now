import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BLOOD_GROUPS, ORGAN_TYPES } from "@/lib/mock-data";
import { MapPin, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface HospitalOption {
  user_id: string;
  name: string | null;
  location: string | null;
}

export default function SendRequestPage() {
  const [type, setType] = useState<"blood" | "organ">("blood");
  const [resource, setResource] = useState("");
  const [organBloodType, setOrganBloodType] = useState("");
  const [units, setUnits] = useState("");
  const [patientDetails, setPatientDetails] = useState("");
  
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadHospitals = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id,name,location")
        .not("license_number", "is", null)
        .neq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) {
        toast({ title: "Could not load hospitals", description: error.message, variant: "destructive" });
        return;
      }

      setHospitals((data as HospitalOption[] | null) ?? []);
    };

    loadHospitals();
  }, [toast, user?.id]);

  const handleSend = async () => {
    if (!user?.id) return;

    if (hospitals.length === 0) {
      toast({ title: "Error", description: "No other hospitals registered to send requests to.", variant: "destructive" });
      return;
    }

    if (!resource) {
      toast({ title: "Error", description: "Please select a resource", variant: "destructive" });
      return;
    }

    const parsedUnits = Number(units);
    if (type === "blood" && (Number.isNaN(parsedUnits) || parsedUnits <= 0)) {
      toast({ title: "Error", description: "Please enter valid units required", variant: "destructive" });
      return;
    }

    if (type === "organ" && !organBloodType) {
      toast({ title: "Error", description: "Please select blood type of organ", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // Get the sender's profile info for denormalized columns
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("name,location")
      .eq("user_id", user.id)
      .maybeSingle();

    // Build one row per target hospital (broadcast to all)
    const targetIds = hospitals.map((h) => h.user_id);
    const rows = targetIds.map((toId) => ({
      from_hospital_id: user.id,
      from_hospital_name: senderProfile?.name ?? null,
      from_hospital_location: senderProfile?.location ?? null,
      to_hospital_id: toId,
      type,
      blood_group: type === "blood" ? resource : null,
      organ_type: type === "organ" ? resource : null,
      organ_blood_type: type === "organ" ? organBloodType : null,
      units_required: type === "blood" ? parsedUnits : null,
      patient_details: patientDetails.trim() ? patientDetails.trim() : null,
      status: "pending",
    }));

    const { error } = await supabase.from("resource_requests").insert(rows);

    if (error) {
      toast({ title: "Request send failed", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    toast({ title: "Request Sent!", description: `Your request has been sent to ${targetIds.length} hospital(s).` });
    setResource("");
    setUnits("");
    setOrganBloodType("");
    setPatientDetails("");
    
    setIsSubmitting(false);
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

            <Button onClick={handleSend} className="w-full" disabled={isSubmitting || hospitals.length === 0}>
              <Send className="mr-2 h-4 w-4" /> {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Nearby Hospitals</CardTitle></CardHeader>
          <CardContent>
            {hospitals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No nearby hospitals found.</p>
            ) : (
              <div className="space-y-3">
                {hospitals.map((hospital) => (
                  <div key={hospital.user_id} className="rounded-md bg-secondary p-3">
                    <p className="font-medium text-sm">{hospital.name || "Unnamed Hospital"}</p>
                    <p className="text-xs text-muted-foreground">{hospital.location || "Location not available"}</p>
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
