import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Settings, 
  FileText, 
  LogOut,
  Shield,
  User as UserIcon,
  Ticket,
  Box,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Role } from "../../types";

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export function Sidebar({ user, activeTab, setActiveTab, onLogout }: SidebarProps) {
  const adminLinks = [
    { id: "analytics", label: "Analytics", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "features", label: "Master Features", icon: Box },
    { id: "packages", label: "Packages", icon: Package },
    { id: "learning-content", label: "Learning Content", icon: GraduationCap },
    { id: "referrals", label: "Referrals", icon: Ticket },
    { id: "app-settings", label: "App Settings", icon: Settings },
    { id: "profile", label: "My Profile", icon: UserIcon },
  ];

  const memberLinks = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "prd-builder", label: "PRD Builder", icon: FileText },
    { id: "referrals", label: "Referrals", icon: Ticket },
    { id: "profile", label: "My Profile", icon: UserIcon },
  ];

  const links = user.role === "admin" ? adminLinks : memberLinks;

  return (
    <div className="flex flex-col h-full w-64 bg-card border-r">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary text-primary-foreground">
          <Shield className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight">AuthLux</span>
      </div>

      <div className="px-3 flex-1 space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {user.role === "admin" ? "Administration" : "Workspace"}
        </p>
        {links.map((link) => (
          <Button
            key={link.id}
            variant={activeTab === link.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10 px-3 transition-all duration-200",
              activeTab === link.id ? "font-semibold shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab(link.id)}
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </Button>
        ))}
      </div>

      <div className="p-4 mt-auto border-t space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <UserIcon className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">{user.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{user.role}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-10 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
