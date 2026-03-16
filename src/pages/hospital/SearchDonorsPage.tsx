import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BLOOD_GROUPS } from "@/lib/mock-data";
import { Donor } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    const loadDonors = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id,name,blood_group,phone,email,location,available")
        .not("blood_group", "is", null)
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
