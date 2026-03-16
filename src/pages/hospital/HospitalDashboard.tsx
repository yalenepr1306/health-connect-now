import { useEffect, useMemo, useState } from "react";
import { Droplets, Activity, Inbox, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BLOOD_GROUPS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

interface DashboardState {
  totalUnits: number;
  activeRequests: number;
  incomingRequests: number;
  nearbyHospitals: number;
}

interface BloodStockRow {
  blood_group: string;
  units: number | null;
}

const defaultState: DashboardState = {
  totalUnits: 0,
  activeRequests: 0,
  incomingRequests: 0,
  nearbyHospitals: 0,
};

export default function HospitalDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<DashboardState>(defaultState);
  const [bloodMap, setBloodMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const [bloodRes, outgoingRes, incomingRes, nearbyHospitalsRes] = await Promise.all([
        supabase.from("blood_stock").select("blood_group,units").eq("hospital_id", user.id),
        supabase
          .from("resource_requests")
          .select("id", { count: "exact", head: true })
          .eq("from_hospital_id", user.id)
          .eq("status", "pending"),
        supabase
          .from("resource_requests")
          .select("id", { count: "exact", head: true })
          .eq("to_hospital_id", user.id)
          .eq("status", "pending"),
        supabase
          .from("profiles")
          .select("user_id", { count: "exact", head: true })
          .not("license_number", "is", null)
          .neq("user_id", user.id),
      ]);

      if (bloodRes.error) {
        toast({ title: "Dashboard data unavailable", description: bloodRes.error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      const stockRows = (bloodRes.data as BloodStockRow[] | null) ?? [];
      const nextBloodMap = stockRows.reduce<Record<string, number>>((acc, row) => {
        acc[row.blood_group] = Number(row.units ?? 0);
        return acc;
      }, {});

      const totalUnits = Object.values(nextBloodMap).reduce((sum, value) => sum + value, 0);

      setBloodMap(nextBloodMap);
      setState({
        totalUnits,
        activeRequests: outgoingRes.count ?? 0,
        incomingRequests: incomingRes.count ?? 0,
        nearbyHospitals: nearbyHospitalsRes.count ?? 0,
      });
      setLoading(false);
    };

    loadDashboard();
  }, [toast, user?.id]);

  const stats = useMemo(() => ([
    { title: "Available Blood Units", value: String(state.totalUnits), icon: Droplets, color: "text-primary" },
    { title: "Active Requests", value: String(state.activeRequests), icon: Activity, color: "text-foreground" },
    { title: "Incoming Requests", value: String(state.incomingRequests), icon: Inbox, color: "text-accent" },
    { title: "Nearby Hospitals", value: String(state.nearbyHospitals), icon: MapPin, color: "text-primary" },
  ]), [state]);

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
              <div className="text-3xl font-bold">{loading ? "..." : s.value}</div>
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
                <div className="text-sm text-muted-foreground">{loading ? "..." : `${bloodMap[bg] ?? 0} units`}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
