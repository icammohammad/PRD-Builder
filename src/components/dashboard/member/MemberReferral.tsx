import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Wallet, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  Gift,
  Share2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function MemberReferral() {
  const [copied, setCopied] = useState(false);
  const referralCode = "MEMBER777";
  const balance = 250000;
  const targetForBonus = 10;
  const currentReferrals = 3;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activity = [
    { id: 1, user: "andi.permadi@gmail.com", date: "2 menit lalu", amount: 50000, status: "completed" },
    { id: 2, user: "siti.rahma@outlook.com", date: "2 Jam lalu", amount: 50000, status: "completed" },
    { id: 3, user: "budi.santoso@yahoo.com", date: "Kemarin", amount: 150000, status: "completed" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Referral Program</h2>
          <p className="text-muted-foreground">Undang teman Anda dan dapatkan saldo untuk setiap pendaftaran sukses.</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Share2 className="w-4 h-4" /> Share Link
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Referral Card */}
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-white to-slate-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Gift className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle>Bagikan Kode Referral Anda</CardTitle>
            <CardDescription>Teman Anda mendapatkan diskon 10%, dan Anda mendapatkan saldo Rp 50.000 per pendaftaran.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white border rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">KODE ANDA</span>
                <span className="text-2xl font-mono font-bold text-primary tracking-tighter">{referralCode}</span>
              </div>
              <Button 
                variant={copied ? "default" : "outline"} 
                className={`rounded-xl h-12 px-6 transition-all duration-300 ${copied ? 'bg-green-600 hover:bg-green-600' : ''}`}
                onClick={handleCopy}
              >
                {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Berhasil!" : "Salin Kode"}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hadiah Bonus: <strong>{currentReferrals}/{targetForBonus} teman</strong></span>
                <span className="font-bold text-primary">Dapatkan Rp 1.000.000</span>
              </div>
              <Progress value={(currentReferrals/targetForBonus) * 100} className="h-2" />
              <p className="text-[10px] text-muted-foreground italic">Undang 7 teman lagi untuk mengklaim bonus prestasi!</p>
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-slate-300 text-sm font-bold uppercase tracking-widest">Saldo Penghasilan</CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tighter">Rp {balance.toLocaleString('id-ID')}</span>
              <span className="text-slate-400 text-sm">Akan tersedia untuk ditarik</span>
            </div>
          </CardContent>
          <CardFooter className="bg-white/5 border-t border-white/10 p-4">
            <Button variant="ghost" className="w-full text-white hover:bg-white/10 gap-2 font-bold uppercase text-xs tracking-widest">
              Tarik Saldo Anda <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Riwayat Referral Sukses
          </CardTitle>
          <CardDescription>Daftar teman yang mendaftar menggunakan kode Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {item.user[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{item.user}</span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-green-600">+Rp {item.amount.toLocaleString('id-ID')}</span>
                  <Badge variant="outline" className="text-[9px] h-4 font-bold border-green-200 bg-green-50 text-green-700">TERKONVERSI</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
