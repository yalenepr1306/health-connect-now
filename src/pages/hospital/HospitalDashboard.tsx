import { Droplets, Activity, Inbox, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { title: "Available Blood Units", value: "0", icon: Droplets, color: "text-primary" },
  { title: "Active Requests", value: "0", icon: Activity, color: "text-green-600" },
  { title: "Incoming Requests", value: "0", icon: Inbox, color: "text-accent" },
  { title: "Nearby Hospitals", value: "0", icon: MapPin, color: "text-primary" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function HospitalDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Blood Stock Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BLOOD_GROUPS.map((bg) => (
              <div key={bg} className="text-center p-3 rounded-lg bg-secondary">
                <div className="text-2xl font-bold text-primary">{bg}</div>
                <div className="text-sm text-muted-foreground">0 units</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
