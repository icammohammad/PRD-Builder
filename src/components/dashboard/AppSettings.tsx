import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Textarea 
} from "@/components/ui/textarea";
import { 
  Separator 
} from "@/components/ui/separator";
import { 
  Globe,
  Mail,
  Lock,
  MessageSquare,
  Bell,
  Save,
  Twitter,
  Github,
  Linkedin
} from "lucide-react";

export function AppSettings() {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">App Settings</h2>
        <p className="text-muted-foreground">Configure your application profile and system preferences.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>This information will be visible to everyone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="app-name">Application Name</Label>
              <Input id="app-name" defaultValue="AuthLux Suite" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="app-desc">Description</Label>
              <Textarea 
                id="app-desc" 
                defaultValue="A polished, responsive, and animated authentication frontend inspired by Better Auth." 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">Website URL</Label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">https://</span>
                <Input id="url" defaultValue="authlux.io" className="rounded-l-none" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button className="gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Managed internal system behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive daily summaries of user activity.</p>
              </div>
              <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer ring-offset-2 focus:ring-2 ring-primary">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Beta Features</Label>
                <p className="text-sm text-muted-foreground">Enable experimental AI-powered modules.</p>
              </div>
              <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Manage your team's social presence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">GitHub</span>
                  <span className="text-xs text-muted-foreground">AuthLux Official</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-red-600">Disconnect</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3 text-blue-500">
                <Twitter className="w-5 h-5 fill-current" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Twitter</span>
                  <span className="text-xs text-muted-foreground">@authlux_suite</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-red-600">Disconnect</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
