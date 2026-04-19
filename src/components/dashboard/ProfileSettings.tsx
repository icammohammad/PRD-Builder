import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Save, 
  Shield,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { User } from "../../types";

interface ProfileSettingsProps {
  user: User;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and account security.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">
              {user.name.charAt(0)}
            </div>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email} • <span className="capitalize">{user.role} Account</span></CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="profile-name" defaultValue={user.name} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="profile-email" defaultValue={user.email} className="pl-10" disabled />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-bio">Bio (Optional)</Label>
              <Input id="profile-bio" placeholder="Tell us about yourself..." />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t p-4 flex justify-end">
            <Button className="gap-2">
              <Save className="w-4 h-4" /> Update Profile
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Security Settings
            </CardTitle>
            <CardDescription>Update your password and manage two-factor authentication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="curr-pass">Current Password</Label>
              <Input id="curr-pass" type="password" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-pass">New Password</Label>
                <Input id="new-pass" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="conf-pass">Confirm New Password</Label>
                <Input id="conf-pass" type="password" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4 flex justify-end">
            <Button variant="outline">Change Password</Button>
          </CardFooter>
        </Card>

        {user.role === "member" && (
            <Card className="border-emerald-100 bg-emerald-50/30">
                <CardHeader>
                    <CardTitle className="text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Account Verification
                    </CardTitle>
                    <CardDescription className="text-emerald-600">Your account is verified and eligible for the referral program.</CardDescription>
                </CardHeader>
            </Card>
        )}
      </div>
    </div>
  );
}
