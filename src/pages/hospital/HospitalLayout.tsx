import { Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Droplets, Search, Send, Inbox, History, Heart, AlertTriangle, Building2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/hospital", icon: LayoutDashboard },
  { title: "Update Blood Stock", url: "/hospital/blood-stock", icon: Droplets },
  { title: "Emergency Request", url: "/hospital/emergency-request", icon: AlertTriangle },
  { title: "Search Donors", url: "/hospital/search-donors", icon: Search },
  { title: "Send Request", url: "/hospital/send-request", icon: Send },
  { title: "Incoming Requests", url: "/hospital/incoming-requests", icon: Inbox },
  { title: "Request History", url: "/hospital/request-history", icon: History },
];

function HospitalSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && (
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4" /> Hospital Panel
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/hospital"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <LogoutConfirmDialog
                  collapsed={collapsed}
                  onConfirm={() => { logout(); navigate("/"); }}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function HospitalLayout() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <HospitalSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b px-4 bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="font-semibold text-sm hidden sm:block">Hospital Dashboard</h2>
            </div>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              {user?.name && (
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary hidden sm:block">{user.name}</span>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 bg-secondary/20 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
