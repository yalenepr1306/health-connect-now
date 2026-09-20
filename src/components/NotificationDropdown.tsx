import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import * as requestService from "@/services/requestService";
import * as profileService from "@/services/profileService";

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

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    const items: NotifItem[] = [];

    // 1. For hospitals: requests they SENT that were accepted/rejected
    const { data: sentRows } = await requestService.getSentDecidedFor(user.id, 20);

    if (sentRows && sentRows.length > 0) {
      const responderIds = [...new Set(sentRows.map((r) => r.to_hospital_id).filter(Boolean))] as string[];
      const nameMap: Record<string, string> = {};
      if (responderIds.length > 0) {
        const { data: profiles } = await profileService.getProfilesByIds(responderIds);
        (profiles ?? []).forEach((p) => {
          nameMap[p.user_id] = p.name || "Unknown";
        });
      }

      sentRows.forEach((r) => {
        const respName = (r.to_hospital_id && nameMap[r.to_hospital_id]) || "Someone";
        const detail = r.type === "blood" ? (r.blood_group ? ` (${r.blood_group})` : "") : (r.organ_type ? ` (${r.organ_type})` : "");
        const action = r.status === "accepted" ? "accepted" : "rejected";
        items.push({
          id: r.id,
          message: `${respName} ${action} your ${r.type} request${detail}`,
          type: r.status as "accepted" | "rejected",
          date: r.created_at ? new Date(r.created_at).toLocaleString() : "",
          read: readIds.has(r.id),
          linkTo: "/hospital/request-history",
        });
      });
    }

    // 2. For donors: incoming pending requests from hospitals
    const { data: incomingRows } = await requestService.getPendingIncomingFor(user.id, 20);

    if (incomingRows && incomingRows.length > 0) {
      incomingRows
        .filter((r) => r.patient_details?.startsWith("[DONOR_REQUEST]"))
        .forEach((r) => {
          items.push({
            id: `donor-${r.id}`,
            message: `${r.from_hospital_name || "A hospital"} needs your blood (${r.blood_group || "N/A"})`,
            type: "incoming",
            date: r.created_at ? new Date(r.created_at).toLocaleString() : "",
            read: readIds.has(`donor-${r.id}`),
            linkTo: "/donor/emergency",
          });
        });
    }

    // Sort by date descending
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setNotifications(items);
  }, [user?.id, readIds]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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
