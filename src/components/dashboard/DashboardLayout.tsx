import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { User } from "../../types";
import { AdminAnalytics } from "./admin/AdminAnalytics";
import { UserManagement } from "./admin/UserManagement";
import { PackageManagement } from "./admin/PackageManagement";
import { ReferralManagement } from "./admin/ReferralManagement";
import { FeatureManagement } from "./admin/FeatureManagement";
import { LearningContentManagement } from "./admin/LearningContentManagement";
import { AppSettings } from "./AppSettings";
import { MemberDashboard } from "./member/MemberDashboard";
import { PRDBuilder } from "./member/PRDBuilder";
import { MemberReferral } from "./member/MemberReferral";
import { ProfileSettings } from "./ProfileSettings";

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

export function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState(user.role === "admin" ? "analytics" : "overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <MemberDashboard user={user} />;
      case "analytics":
        return <AdminAnalytics />;
      case "users":
        return <UserManagement />;
      case "packages":
        return <PackageManagement />;
      case "learning-content":
        return <LearningContentManagement />;
      case "features":
        return <FeatureManagement />;
      case "app-settings":
        return <AppSettings />;
      case "profile":
        return <ProfileSettings user={user} />;
      case "prd-builder":
        return <PRDBuilder user={user} />;
      case "referrals":
        return user.role === "admin" ? <ReferralManagement /> : <MemberReferral />;
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
