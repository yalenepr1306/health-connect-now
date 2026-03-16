import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DonationRecord } from "@/lib/types";

const records: DonationRecord[] = [];

export default function DonationHistoryPage() {
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No donation records found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell>{d.date}</TableCell>
                    <TableCell>{d.time}</TableCell>
                    <TableCell>{d.hospital}</TableCell>
                    <TableCell>{d.bloodGroup}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "completed" ? "default" : d.status === "scheduled" ? "secondary" : "destructive"}>
                        {d.status}
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
