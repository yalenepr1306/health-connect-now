import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BLOOD_GROUPS } from "@/lib/mock-data";
import { Donor } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Send } from "lucide-react";

interface DonorProfileRow {
  user_id: string;
  name: string | null;
  blood_group: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  available: boolean | null;
}

export default function SearchDonorsPage() {
  const [filter, setFilter] = useState("all");
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadDonors = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id,name,blood_group,phone,email,location,available")
        .not("blood_group", "is", null)
        .eq("available", true)
        .order("name", { ascending: true });

      if (error) {
        toast({ title: "Unable to load donors", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      const mapped = ((data as DonorProfileRow[] | null) ?? []).map((row) => ({
        id: row.user_id,
        name: row.name ?? "Unknown",
        bloodGroup: row.blood_group ?? "N/A",
        phone: row.phone ?? "N/A",
        email: row.email ?? "N/A",
        location: row.location ?? "N/A",
        available: Boolean(row.available),
      }));

      setDonors(mapped);
      setLoading(false);
    };

    loadDonors();
  }, [toast]);

  const filtered = useMemo(
    () => (filter !== "all" ? donors.filter((d) => d.bloodGroup === filter) : donors),
    [donors, filter]
  );

  const handleSendRequest = async (donor: Donor) => {
    if (!user?.id) return;
    setSendingTo(donor.id);

    // Get hospital name
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("name,location")
      .eq("user_id", user.id)
      .maybeSingle();

    const { error } = await supabase.from("resource_requests").insert({
      from_hospital_id: user.id,
      from_hospital_name: senderProfile?.name ?? "Unknown Hospital",
      from_hospital_location: senderProfile?.location ?? null,
      to_hospital_id: donor.id,
      type: "blood",
      blood_group: donor.bloodGroup !== "N/A" ? donor.bloodGroup : null,
      units_required: 1,
      patient_details: `[DONOR_REQUEST] Request sent to donor ${donor.name}`,
      status: "pending",
    });

    if (error) {
      toast({ title: "Failed to send request", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request Sent!", description: `Blood request sent to ${donor.name}.` });
    }
    setSendingTo(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Search Donors</h1>
      <div className="mb-6 max-w-xs">
        <Label>Filter by Blood Group</Label>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger><SelectValue placeholder="All blood groups" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading donors...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground col-span-full">No donors found.</p>
          ) : (
            filtered.map((donor) => (
              <Card key={donor.id}>
                <CardContent className="pt-6 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{donor.name}</h3>
                    <Badge variant={donor.available ? "default" : "secondary"}>
                      {donor.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Blood Group: {donor.bloodGroup}</p>
                  <p className="text-sm text-muted-foreground">Phone: {donor.phone}</p>
                  <p className="text-sm text-muted-foreground">Location: {donor.location}</p>
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    disabled={sendingTo === donor.id}
                    onClick={() => handleSendRequest(donor)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendingTo === donor.id ? "Sending..." : "Send Request"}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
