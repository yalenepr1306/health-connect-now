import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NotifItem {
  id: string;
  message: string;
  type: "accepted" | "rejected" | "incoming";
  date: string;
  read: boolean;
  linkTo: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user?.id) return;

    // Fetch requests sent BY this hospital that have been accepted or rejected
    const { data } = await supabase
      .from("resource_requests")
      .select("id, to_hospital_id, type, blood_group, organ_type, status, created_at")
      .eq("from_hospital_id", user.id)
      .in("status", ["accepted", "rejected"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (!data || data.length === 0) {
      setNotifications([]);
      return;
    }

    // Get names of responding hospitals
    const hospitalIds = [...new Set(data.map((r: any) => r.to_hospital_id).filter(Boolean))];
    let nameMap: Record<string, string> = {};
    if (hospitalIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", hospitalIds);
      (profiles ?? []).forEach((p: any) => { nameMap[p.user_id] = p.name || "Unknown"; });
    }

    const items: NotifItem[] = data.map((r: any) => {
      const hospName = nameMap[r.to_hospital_id] || "A hospital";
      const detail = r.type === "blood" ? (r.blood_group ? ` (${r.blood_group})` : "") : (r.organ_type ? ` (${r.organ_type})` : "");
      const action = r.status === "accepted" ? "accepted" : "rejected";
      return {
        id: r.id,
        message: `${hospName} ${action} your ${r.type} request${detail}`,
        type: r.status as "accepted" | "rejected",
        date: r.created_at ? new Date(r.created_at).toLocaleString() : "",
        read: readIds.has(r.id),
        linkTo: "/hospital/request-history",
      };
    });

    setNotifications(items);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 15 seconds for new notifications
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user?.id, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (notif: NotifItem) => {
    setReadIds((prev) => new Set(prev).add(notif.id));
    setOpen(false);
    navigate(notif.linkTo);
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const getTypeColor = (type: NotifItem["type"]) => {
    switch (type) {
      case "incoming": return "bg-primary/10 text-primary";
      case "accepted": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "rejected": return "bg-destructive/10 text-destructive";
    }
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchNotifications(); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">No notifications</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left p-3 border-b last:border-0 hover:bg-secondary/50 transition-colors ${!n.read ? "bg-secondary/30" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${getTypeColor(n.type)}`}>
                    {n.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? "font-medium" : ""}`}>{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
