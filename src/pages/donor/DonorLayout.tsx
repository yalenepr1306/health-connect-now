import { Outlet, useNavigate } from "react-router-dom";
import { User, AlertTriangle, History, ToggleRight, Heart } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "My Profile", url: "/donor", icon: User },
  { title: "Emergency Requests", url: "/donor/emergency", icon: AlertTriangle },
  { title: "Donation History", url: "/donor/history", icon: History },
  { title: "Availability Status", url: "/donor/availability", icon: ToggleRight },
];

function DonorSidebar() {
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
                <Heart className="h-4 w-4" /> Donor Panel
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
                      end={item.url === "/donor"}
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

export default function DonorLayout() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DonorSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b px-4 bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="font-semibold text-sm hidden sm:block">Donor Dashboard</h2>
            </div>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
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
