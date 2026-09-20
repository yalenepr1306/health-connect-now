import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DonationRecord } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as donationService from "@/services/donationService";

export default function DonationHistoryPage() {
  const [records, setRecords] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadHistory = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const { data, error } = await donationService.getForDonor(user.id);

    if (error) {
      toast({ title: "Could not load donation history", description: error, variant: "destructive" });
      setLoading(false);
      return;
    }

    setRecords((data ?? []).map((row) => {
      const donationDate = new Date(row.donation_date);
      return {
        id: row.id,
        date: donationDate.toLocaleDateString(),
        time: donationDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        hospital: row.hospital_name || "Unknown Hospital",
        bloodGroup: row.blood_group || "N/A",
        status: row.status,
      };
    }));
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleMarkCompleted = async (id: string) => {
    const { error } = await donationService.markCompleted(id);

    if (error) {
      toast({ title: "Update failed", description: error, variant: "destructive" });
      return;
    }

    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: "completed" } : r)));
    toast({ title: "Marked as completed", description: "Thank you for donating!" });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Donation History</h1>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Loading donation history...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No donation records found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.date}</TableCell>
                    <TableCell>{d.time}</TableCell>
                    <TableCell>{d.hospital}</TableCell>
                    <TableCell>{d.bloodGroup}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "completed" ? "default" : d.status === "scheduled" ? "secondary" : "destructive"}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {d.status === "scheduled" && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkCompleted(d.id)}>
                          Mark Completed
                        </Button>
                      )}
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
