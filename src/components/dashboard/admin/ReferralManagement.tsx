import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Search, 
  TrendingUp, 
  Gift,
  MoreVertical,
  Copy,
  Trash2,
  Settings2,
  Save,
  Wallet
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface ReferralCode {
  id: string;
  code: string;
  owner: string;
  type: "member" | "affiliate";
  usageCount: number;
  conversions: number;
  totalEarned: number;
  status: "active" | "inactive";
  createdAt: string;
}

export function ReferralManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [referralRate, setReferralRate] = useState(50000);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(50000);
  
  const [referrals] = useState<ReferralCode[]>([
    { id: "1", code: "HISSAM2026", owner: "Muhammad Hissamudin", type: "affiliate", usageCount: 45, conversions: 12, totalEarned: 1200000, status: "active", createdAt: "2026-03-10" },
    { id: "2", code: "PROMOFREE", owner: "System", type: "member", usageCount: 120, conversions: 34, totalEarned: 0, status: "active", createdAt: "2026-01-05" },
    { id: "3", code: "USER99", owner: "Ahmad Dani", type: "member", usageCount: 5, conversions: 1, totalEarned: 50000, status: "active", createdAt: "2026-04-12" },
    { id: "4", code: "EXPIRED", owner: "Old User", type: "member", usageCount: 2, conversions: 0, totalEarned: 0, status: "inactive", createdAt: "2025-12-12" },
  ]);

  const filteredReferrals = referrals.filter(r => 
    r.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Referral Management</h2>
          <p className="text-muted-foreground">Manage referral codes, track conversions, and monitor rewards.</p>
        </div>
        <div className="flex gap-2">
          {!isEditingRate ? (
            <Button variant="outline" className="gap-2" onClick={() => { setTempRate(referralRate); setIsEditingRate(true); }}>
              <Settings2 className="w-4 h-4" /> Config Rate
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <div className="flex items-center px-2 text-xs font-bold text-muted-foreground">IDR</div>
              <Input 
                type="number" 
                className="h-8 w-24 bg-background" 
                value={tempRate} 
                onChange={(e) => setTempRate(Number(e.target.value))}
              />
              <Button size="sm" className="h-8" onClick={() => { setReferralRate(tempRate); setIsEditingRate(false); }}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>
          )}
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Create New Code
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Reward</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {referralRate.toLocaleString('id-ID')}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Reward per successful registration</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Conversions</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payouts Pending</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 1.250.000</div>
            <p className="text-xs text-muted-foreground mt-1 text-orange-500">3 pending approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Codes</CardTitle>
            <Gift className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground mt-1">across all user types</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Referral Codes</CardTitle>
              <CardDescription>View and manage all active referral codes in the system.</CardDescription>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search code or owner..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-bold">Referral Code</TableHead>
                  <TableHead className="font-bold">Owner</TableHead>
                  <TableHead className="font-bold text-center">Uses</TableHead>
                  <TableHead className="font-bold text-center">Conversions</TableHead>
                  <TableHead className="font-bold text-right">Reward Paid</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 rounded bg-slate-100 font-mono text-sm font-bold text-primary">
                          {item.code}
                        </code>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.owner}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{item.usageCount}</TableCell>
                    <TableCell className="text-center font-medium text-primary">{item.conversions}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {item.totalEarned > 0 ? `Rp ${item.totalEarned?.toLocaleString('id-ID')}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "active" ? "default" : "secondary"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
