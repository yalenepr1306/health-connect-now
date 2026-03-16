import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResourceRequest } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RequestRow {
  id: string;
  from_hospital_id: string | null;
  to_hospital_id: string | null;
  type: "blood" | "organ";
  blood_group: string | null;
  organ_type: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at?: string | null;
}

interface HospitalProfileRow {
  user_id: string;
  name: string | null;
}

export default function RequestHistoryPage() {
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("resource_requests")
        .select("*")
        .or(`from_hospital_id.eq.${user.id},to_hospital_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Could not load request history", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      const rows = (data as RequestRow[] | null) ?? [];
      const hospitalIds = Array.from(
        new Set(
          rows
            .flatMap((row) => [row.from_hospital_id, row.to_hospital_id])
            .filter(Boolean)
        )
      ) as string[];

      let hospitalMap: Record<string, HospitalProfileRow> = {};
      if (hospitalIds.length > 0) {
        const { data: profileRows } = await supabase
          .from("profiles")
          .select("user_id,name")
          .in("user_id", hospitalIds);

        hospitalMap = ((profileRows as HospitalProfileRow[] | null) ?? []).reduce<Record<string, HospitalProfileRow>>((acc, row) => {
          acc[row.user_id] = row;
          return acc;
        }, {});
      }

      const mapped: ResourceRequest[] = rows.map((row) => {
        const isOutgoing = row.from_hospital_id === user.id;
        const counterpartId = isOutgoing ? row.to_hospital_id : row.from_hospital_id;
        const counterpartName = counterpartId ? (hospitalMap[counterpartId]?.name || "Unknown Hospital") : "Unknown Hospital";

        return {
          id: row.id,
          fromHospital: hospitalMap[row.from_hospital_id || ""]?.name || "Unknown Hospital",
          toHospital: counterpartName,
          type: row.type,
          bloodGroup: row.blood_group || undefined,
          organType: row.organ_type || undefined,
          status: row.status,
          date: row.created_at ? new Date(row.created_at).toLocaleString() : "Unknown date",
        };
      });

      setRequests(mapped);
      setLoading(false);
    };

    loadHistory();
  }, [toast, user?.id]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Request History</h1>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Loading request history...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No request history found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.toHospital || r.fromHospital}</TableCell>
                    <TableCell className="capitalize">{r.type}</TableCell>
                    <TableCell>{r.bloodGroup || r.organType}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "accepted" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
