import { useEffect, useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface RequiredItem {
  id: number;
  itemName: string;
  quantity: string;
}

export default function HospitalEmergencyRequestPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [disasterType, setDisasterType] = useState("");
  const [location, setLocation] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<RequiredItem[]>([{ id: 1, itemName: "", quantity: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), itemName: "", quantity: "" },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: number, field: "itemName" | "quantity", value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!disasterType || !location || !urgencyLevel) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const validItems = items.filter((i) => i.itemName.trim() !== "");
    if (validItems.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one required item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Get sender profile
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("name,location")
      .eq("user_id", user.id)
      .maybeSingle();

    // Get all other hospitals
    const { data: otherHospitals } = await supabase
      .from("profiles")
      .select("user_id")
      .not("license_number", "is", null)
      .neq("user_id", user.id);

    const targetIds = (otherHospitals ?? []).map((h) => h.user_id);

    if (targetIds.length === 0) {
      toast({ title: "No hospitals", description: "No other hospitals registered to notify.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    // Build items string for the request
    const itemsSummary = validItems.map((i) => `${i.itemName} (${i.quantity || "N/A"})`).join(", ");
    const fullDetails = `Disaster: ${disasterType} | Urgency: ${urgencyLevel} | Location: ${location}${description ? ` | ${description}` : ""} | Items: ${itemsSummary}`;

    // Broadcast as resource_requests to all hospitals
    const rows = targetIds.map((toId) => ({
      from_hospital_id: user.id,
      from_hospital_name: senderProfile?.name ?? null,
      from_hospital_location: senderProfile?.location ?? null,
      to_hospital_id: toId,
      type: "blood" as const,
      blood_group: null,
      organ_type: null,
      organ_blood_type: null,
      units_required: null,
      patient_details: fullDetails,
      status: "pending" as const,
    }));

    const { error } = await supabase.from("resource_requests").insert(rows);

    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: "Emergency Request Submitted",
      description: `Emergency alert sent to ${targetIds.length} hospital(s).`,
    });

    setDisasterType("");
    setLocation("");
    setUrgencyLevel("");
    setDescription("");
    setItems([{ id: 1, itemName: "", quantity: "" }]);
    setIsSubmitting(false);
  };

  const urgencyBadge: Record<string, { label: string; className: string }> = {
    Low: { label: "Low priority selected", className: "text-[hsl(var(--success))]" },
    High: { label: "High priority selected", className: "text-[hsl(var(--warning))]" },
    Critical: { label: "Critical priority selected", className: "text-destructive" },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Emergency Request</h1>
          <p className="text-sm text-muted-foreground">
            Submit an emergency resource request — it will be sent to all registered hospitals
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Disaster Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="disaster-type">Disaster Type <span className="text-destructive">*</span></Label>
              <Select value={disasterType} onValueChange={setDisasterType}>
                <SelectTrigger id="disaster-type"><SelectValue placeholder="Select disaster type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accident">Accident</SelectItem>
                  <SelectItem value="Flood">Flood</SelectItem>
                  <SelectItem value="Earthquake">Earthquake</SelectItem>
                  <SelectItem value="Fire">Fire</SelectItem>
                  <SelectItem value="Pandemic">Pandemic</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency-level">Urgency Level <span className="text-destructive">*</span></Label>
              <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                <SelectTrigger id="urgency-level"><SelectValue placeholder="Select urgency level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low"><span className="text-[hsl(var(--success))] font-medium">Low</span></SelectItem>
                  <SelectItem value="High"><span className="text-[hsl(var(--warning))] font-medium">High</span></SelectItem>
                  <SelectItem value="Critical"><span className="text-destructive font-medium">Critical</span></SelectItem>
                </SelectContent>
              </Select>
              {urgencyLevel && (
                <p className={`text-xs font-medium ${urgencyBadge[urgencyLevel]?.className ?? ""}`}>
                  ● {urgencyBadge[urgencyLevel]?.label}
                </p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
              <Input id="location" placeholder="Enter disaster location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Required Items</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_120px_40px] gap-3 px-1">
              <span className="text-sm font-medium text-muted-foreground">Item Name</span>
              <span className="text-sm font-medium text-muted-foreground">Quantity</span>
              <span />
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_120px_40px] gap-3 items-center">
                  <Input placeholder="e.g. Oxygen Cylinder" value={item.itemName} onChange={(e) => updateItem(item.id, "itemName", e.target.value)} />
                  <Input type="number" placeholder="0" min={1} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Emergency Description</CardTitle></CardHeader>
          <CardContent>
            <Textarea placeholder="Describe the disaster situation and additional requirements." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px] resize-none" />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
          <AlertTriangle className="h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Submit Emergency Request"}
        </Button>
      </form>
    </div>
  );
}
