import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { User } from "../../types";
import { AdminAnalytics } from "./AdminAnalytics";
import { UserManagement } from "./UserManagement";
import { PackageManagement } from "./PackageManagement";
import { AppSettings } from "./AppSettings";
import { PRDBuilder } from "./PRDBuilder";

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

export function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState(user.role === "admin" ? "analytics" : "prd-builder");

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return <AdminAnalytics />;
      case "users":
        return <UserManagement />;
      case "packages":
        return <PackageManagement />;
      case "settings":
        return <AppSettings />;
      case "prd-builder":
        return <PRDBuilder />;
      default:
        return <AdminAnalytics />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/10 selection:text-primary">
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />
      
      <main className="flex-1 overflow-y-auto bg-slate-50/30">
        <div className="p-8 pb-12 max-w-[1200px] mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
