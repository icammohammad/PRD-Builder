import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Plus, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  Zap,
  Clock,
  ChevronRight,
  Shield,
  Star,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "../../../types";
import { Progress } from "@/components/ui/progress";
import { api } from "../../../lib/api";

interface MemberDashboardProps {
  user: User;
}

export function MemberDashboard({ user }: MemberDashboardProps) {
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [totalPrds, setTotalPrds] = useState(0);

  useEffect(() => {
    api.get("/api/prds")
      .then(data => {
        if (Array.isArray(data)) {
          setRecentItems(data.slice(0, 3));
          setTotalPrds(data.length);
        }
      })
      .catch(err => console.error("Error fetching documents:", err));
  }, []);

  const stats = [
    { label: "PRDs Drafted", value: totalPrds.toString(), icon: FileText, change: "Real-time", trend: "neutral" },
    { label: "AI Tokens Used", value: "4.5k", icon: Zap, change: "+0.8k", trend: "up" },
    { label: "Referral Earned", value: "Rp 250.000", icon: Wallet, change: "Rp 50k", trend: "up" },
    { label: "Active Days", value: "24", icon: Clock, change: "Daily", trend: "neutral" },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Halo, {user.name}! 👋</h2>
          <p className="text-muted-foreground">Selamat datang kembali di workspace PRD Builder Anda.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105">
          <Plus className="w-4 h-4" /> Create New PRD
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-xl shadow-slate-200/50 bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-[10px] font-bold ${
                  stat.trend === "up" ? "text-emerald-500" : "text-muted-foreground"
                }`}>
                  {stat.change}
                </span>
                <span className="text-[10px] text-muted-foreground italic">this month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Dokumen Terbaru</CardTitle>
                  <CardDescription>Lanjutkan mengerjakan draf PRD terakhir Anda.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentItems.length > 0 ? (
                  recentItems.map((item, i) => (
                    <div key={item.id || i} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-white border shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{item.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{formatDate(item.createdAt)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-bold uppercase text-primary/70">PRD</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700`}>
                        Completed
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm italic">
                    Belum ada dokumen PRD yang dibuat.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield className="w-32 h-32" />
              </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded bg-amber-400 text-slate-900">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Current Plan</span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Pro Plan Member</CardTitle>
              <CardDescription className="text-slate-400">Paket Anda aktif hingga 12 Mei 2026.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 text-xs">PRD Generation Usage</span>
                  <span className="font-bold text-slate-200">12/50</span>
                </div>
                <Progress value={24} className="h-2 bg-slate-800" />
                <p className="text-[10px] text-slate-500 italic">Sisa 38 kuota PRD bulan ini.</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-medium">All enterprise security features enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-[11px] font-medium">Priority AI processing active</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold">
                Upgrade Plan
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Butuh Bantuan?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tonton panduan singkat cara menggunakan AI untuk membuat PRD berkualitas tinggi dalam hitungan detik.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full text-xs h-8">Lihat Tutorial</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
