import { useEffect, useMemo, useState } from "react";
import { Droplets, Activity, Inbox, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BLOOD_GROUPS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import * as bloodStockService from "@/services/bloodStockService";
import * as requestService from "@/services/requestService";
import * as profileService from "@/services/profileService";

interface DashboardState {
  totalUnits: number;
  activeRequests: number;
  incomingRequests: number;
  nearbyHospitals: number;
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
        bloodStockService.getStockForHospital(user.id),
        requestService.countPendingOutgoing(user.id),
        requestService.countPendingIncoming(user.id),
        profileService.countOtherHospitals(user.id),
      ]);

      if (bloodRes.error) {
        toast({ title: "Dashboard data unavailable", description: bloodRes.error, variant: "destructive" });
        setLoading(false);
        return;
      }

      const nextBloodMap = (bloodRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
        acc[row.blood_group] = Number(row.units ?? 0);
        return acc;
      }, {});

      const totalUnits = Object.values(nextBloodMap).reduce((sum, value) => sum + value, 0);

      setBloodMap(nextBloodMap);
      setState({
        totalUnits,
        activeRequests: outgoingRes.data ?? 0,
        incomingRequests: incomingRes.data ?? 0,
        nearbyHospitals: nearbyHospitalsRes.data ?? 0,
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
