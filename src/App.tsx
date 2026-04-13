/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  User, 
  FileText, 
  Send, 
  ChevronRight, 
  ChevronLeft, 
  Cpu, 
  CheckCircle, 
  Loader2,
  RefreshCw,
  Settings,
  RotateCcw,
  Wand2,
  AlertCircle,
  Download,
  Copy,
  Check,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Globe,
  Smartphone,
  CreditCard,
  Users,
  BarChart3,
  Database,
  Lock,
  AppWindow,
  History,
  Upload,
  X,
  File
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface Question {
  id: number;
  question: string;
  options: string[];
  isFreetextOnly?: boolean;
  icon?: React.ReactNode;
}

export default function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    codingExp: 'pemula',
    goal: ''
  });
  
  const [systemIdea, setSystemIdea] = useState({
    description: '',
    language: 'Indonesia'
  });

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [customInput, setCustomInput] = useState(""); 
  const [currentScreeningIdx, setCurrentScreeningIdx] = useState(0);
  
  const [techPreference, setTechPreference] = useState({
    mode: 'ai', 
    backend: '',
    frontend: '',
    database: '',
    styling: ''
  });
  
  const [prdHistory, setPrdHistory] = useState<string[]>([]); 
  const [savedPrds, setSavedPrds] = useState<any[]>([]);
  const [currentVersionIdx, setCurrentVersionIdx] = useState(-1);
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string, type: string, data: string } | null>(null);
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const [appName, setAppName] = useState("");

  const currentPRD = prdHistory[currentVersionIdx] || null;

  // Fetch saved PRDs from backend
  useEffect(() => {
    fetch("/api/prds")
      .then(res => res.json())
      .then(data => setSavedPrds(data))
      .catch(err => console.error("Failed to fetch history:", err));
  }, []);

  const savePrdToBackend = async (prdContent: string) => {
    try {
      const response = await fetch("/api/prds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prd: prdContent,
          name: `${userProfile.name}'s PRD - ${new Date().toLocaleTimeString()}`,
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        const newData = await response.json();
        setSavedPrds(prev => [newData, ...prev]);
      }
    } catch (err) {
      console.error("Failed to save PRD:", err);
    }
  };

  const screeningQuestions: Question[] = useMemo(() => [
    { id: 1, question: "Siapa target audiens utama aplikasi ini?", options: ["Konsumen Umum (B2C)", "Bisnis/Perusahaan (B2B)", "Internal Karyawan", "Developer/Teknis"], icon: <Users className="w-4 h-4" /> },
    { id: 2, question: "Apa masalah utama yang ingin diselesaikan?", options: [], isFreetextOnly: true, icon: <AlertCircle className="w-4 h-4" /> },
    { id: 3, question: "Platform mana yang menjadi prioritas utama?", options: ["Web Application", "Mobile iOS", "Mobile Android", "Desktop (Windows/Mac)", "Cross-platform Mobile"], icon: <Smartphone className="w-4 h-4" /> },
    { id: 4, question: "Apakah aplikasi ini memerlukan sistem login/autentikasi?", options: ["Ya, sangat perlu", "Opsional/Nanti", "Tidak perlu"], icon: <Lock className="w-4 h-4" /> },
    { id: 5, question: "Bagaimana rencana monetisasi aplikasi ini?", options: ["Gratis sepenuhnya", "Model Langganan (SaaS)", "Iklan", "Pembelian dalam aplikasi", "Sekali beli (One-time)"], icon: <CreditCard className="w-4 h-4" /> },
    { id: 6, question: "Apakah ada integrasi pihak ketiga yang diperlukan?", options: ["Payment Gateway (Stripe/Midtrans)", "Social Media Login", "Maps/Geolocation", "Email Service (SendGrid/Resend)", "Tidak ada"], icon: <Zap className="w-4 h-4" /> },
    { id: 7, question: "Seberapa penting keamanan data pengguna?", options: ["Sangat Penting (Fintech/Medis)", "Standar Industri", "Minimal (Data Publik)"], icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 8, question: "Apakah aplikasi memerlukan fitur real-time?", options: ["Ya (Chat/Notifikasi Langsung)", "Ya (Live Tracking/Dashboard)", "Tidak perlu"], icon: <RefreshCw className="w-4 h-4" /> },
    { id: 9, question: "Berapa perkiraan jumlah pengguna aktif bulanan di awal?", options: ["< 1.000 pengguna", "1.000 - 10.000 pengguna", "10.000 - 100.000 pengguna", "> 100.000 pengguna"], icon: <BarChart3 className="w-4 h-4" /> },
    { id: 10, question: "Apakah ada batasan teknologi tertentu?", options: ["Harus Open Source", "Harus Cloud Native", "Bebas/Rekomendasi AI"], icon: <Settings className="w-4 h-4" /> },
    { id: 11, question: "Bagaimana tingkat kompleksitas desain UI yang diinginkan?", options: ["Minimalis & Bersih", "Mewah & Animatif", "Fungsional & Padat Data"], icon: <AppWindow className="w-4 h-4" /> },
    { id: 12, question: "Apakah aplikasi memerlukan dukungan multi-bahasa?", options: ["Ya, Global (Banyak Bahasa)", "Cukup 2 Bahasa (Indo/Inggris)", "Satu Bahasa Saja"], icon: <Globe className="w-4 h-4" /> },
    { id: 13, question: "Apakah ada kebutuhan untuk akses offline?", options: ["Ya, harus bisa kerja offline", "Sinkronisasi saat online saja", "Tidak perlu"], icon: <Database className="w-4 h-4" /> },
    { id: 14, question: "Bagaimana sistem penyimpanan data yang diinginkan?", options: ["Cloud Database (Firebase/Supabase)", "SQL Tradisional (PostgreSQL/MySQL)", "NoSQL (MongoDB)", "Lokal Saja"], icon: <Database className="w-4 h-4" /> },
    { id: 15, question: "Apakah ada fitur analitik yang diperlukan?", options: ["Ya, sangat mendalam", "Standar (Google Analytics)", "Tidak perlu"], icon: <BarChart3 className="w-4 h-4" /> },
    { id: 16, question: "Apakah aplikasi ini bagian dari ekosistem yang sudah ada?", options: ["Ya, integrasi sistem lama", "Produk baru mandiri", "Ekspansi fitur"], icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 17, question: "Apa indikator keberhasilan (KPI) utama?", options: ["Jumlah Pengguna Aktif", "Pendapatan Langsung", "Efisiensi Waktu Pengguna", "Kepuasan Pengguna"], icon: <CheckCircle className="w-4 h-4" /> },
    { id: 18, question: "Apakah ada kebutuhan untuk panel admin?", options: ["Ya, Dashboard Admin Lengkap", "Ya, Manajemen Konten Sederhana", "Tidak perlu"], icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 19, question: "Bagaimana rencana skalabilitas di masa depan?", options: ["Skala Global", "Skala Nasional", "Skala Komunitas Kecil"], icon: <Zap className="w-4 h-4" /> },
    { id: 20, question: "Apakah ada regulasi hukum tertentu yang harus dipatuhi?", options: ["Ya (GDPR/PDP/ISO)", "Standar Hukum Lokal", "Tidak ada regulasi khusus"], icon: <ShieldCheck className="w-4 h-4" /> },
  ], []);

  const PRD_STRUCTURE = `
    1. Overview & Objective
    2. Functional Requirements
    3. Non-Functional Requirements
    4. Core Features & User Stories
    5. System Workflow
    6. Architecture & Data Flow
    7. Database Schema Entity
    8. Recommended Tech Stack & Deployment Strategy
  `;

  const resetAllData = () => {
    setStep(1);
    setLoading(false);
    setError(null);
    setUserProfile({ name: '', codingExp: 'pemula', goal: '' });
    setSystemIdea({ description: '', language: 'Indonesia' });
    setAnswers({});
    setCustomInput("");
    setCurrentScreeningIdx(0);
    setTechPreference({ mode: 'ai', backend: '', frontend: '', database: '', styling: '' });
    setPrdHistory([]);
    setSavedPrds([]);
    setCurrentVersionIdx(-1);
    setRevisionPrompt('');
    setUploadedFile(null);
    setDynamicQuestions([]);
    setAppName("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setUploadedFile({
        name: file.name,
        type: file.type,
        data: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => setUploadedFile(null);

  const callGemini = async (prompt: string, isJson = false, fileData?: { mimeType: string, data: string }) => {
    try {
      const contents: any[] = [{ text: prompt }];
      
      if (fileData) {
        contents.unshift({
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: { parts: contents },
        config: {
          systemInstruction: "Anda adalah analis sistem senior dan manajer produk. Berikan output teks PRD yang sangat profesional, terstruktur, dan mendalam menggunakan Markdown. Jika diminta JSON, berikan JSON murni tanpa markdown wrapper. Jika ada file yang diunggah, analisis isinya sebagai bagian dari konsep sistem.",
          responseMimeType: isJson ? "application/json" : "text/plain"
        }
      });

      const textResponse = response.text;
      
      if (!textResponse) throw new Error("Respon AI kosong.");
      
      return isJson ? JSON.parse(textResponse) : textResponse;
    } catch (err: any) {
      throw err;
    }
  };

  const generateDynamicQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Analisis konsep aplikasi berikut dan berikan 10-15 pertanyaan screening yang sangat relevan untuk membantu menyusun PRD yang mendalam.
      
      KONSEP: ${systemIdea.description}
      ${uploadedFile ? "Analisis juga file yang diunggah untuk mendapatkan konteks tambahan." : ""}
      
      Output harus dalam format JSON ARRAY yang berisi objek dengan struktur:
      {
        "id": number,
        "question": "string",
        "options": ["string", "string", ...],
        "isFreetextOnly": boolean
      }
      
      Sertakan opsi jawaban yang relevan untuk setiap pertanyaan jika bukan freetext. Berikan pertanyaan dalam bahasa ${systemIdea.language}.`;

      const filePart = uploadedFile ? { mimeType: uploadedFile.type, data: uploadedFile.data } : undefined;
      const questions = await callGemini(prompt, true, filePart);
      
      // Add icons to dynamic questions
      const icons = [<Users className="w-4 h-4" />, <Zap className="w-4 h-4" />, <ShieldCheck className="w-4 h-4" />, <Database className="w-4 h-4" />, <Smartphone className="w-4 h-4" />, <BarChart3 className="w-4 h-4" />, <LayoutDashboard className="w-4 h-4" />, <Globe className="w-4 h-4" />, <Lock className="w-4 h-4" />, <Settings className="w-4 h-4" />];
      
      const formattedQuestions = questions.map((q: any, idx: number) => ({
        ...q,
        icon: icons[idx % icons.length]
      }));

      setDynamicQuestions(formattedQuestions);
      
      // Also extract app name if possible
      const namePrompt = `Berdasarkan konsep ini: "${systemIdea.description}", berikan 1 nama aplikasi yang paling cocok (hanya nama saja, maks 3 kata).`;
      const nameResult = await callGemini(namePrompt);
      setAppName(nameResult.replace(/["']/g, "").trim());
      
      setStep(3);
    } catch (err: any) {
      setError(`Gagal menganalisis konsep: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generatePRD = async () => {
    setLoading(true);
    setError(null);
    try {
      const answersText = Object.entries(answers).map(([id, val]) => {
        const q = dynamicQuestions.find(q => q.id === parseInt(id));
        return `Pertanyaan: ${q?.question}\nJawaban: ${val}`;
      }).join('\n\n');

      const prompt = `Susun Dokumen Persyaratan Produk (PRD) profesional dalam bahasa ${systemIdea.language}.
      
      KONTEKS PROYEK:
      Nama Penyusun: ${userProfile.name}
      Pengalaman Coding: ${userProfile.codingExp}
      Tujuan Utama: ${userProfile.goal}
      Deskripsi Konsep: ${systemIdea.description}
      ${uploadedFile ? "Analisis juga file yang diunggah sebagai referensi tambahan untuk konsep sistem ini." : ""}
      
      DETAIL KEBUTUHAN (Hasil Screening):
      ${answersText}
      
      PREFERENSI TEKNOLOGI:
      ${techPreference.mode === 'ai' ? 'Berikan rekomendasi stack terbaik berdasarkan AI.' : `Gunakan stack berikut: ${JSON.stringify(techPreference)}`}
      
      STRUKTUR WAJIB (Poin 1-8):
      ${PRD_STRUCTURE}
      
      Gunakan format Markdown yang sangat rapi, gunakan tabel jika diperlukan untuk skema database atau workflow. Berikan detail teknis yang cukup untuk developer mulai membangun.`;

      const filePart = uploadedFile ? { mimeType: uploadedFile.type, data: uploadedFile.data } : undefined;
      const result = await callGemini(prompt, false, filePart);
      const newHistory = [result];
      setPrdHistory(newHistory);
      setCurrentVersionIdx(0);
      setStep(5);
      savePrdToBackend(result);
    } catch (err: any) {
      setError(`Gagal membuat PRD: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRevision = async () => {
    if (!revisionPrompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const prompt = `Revisi PRD v${currentVersionIdx + 1} berdasarkan instruksi berikut: "${revisionPrompt}".
      
      DOKUMEN SAAT INI:
      ---
      ${currentPRD}
      ---
      
      TUGAS:
      Berikan dokumen hasil revisi lengkap yang menggabungkan perubahan tersebut. 
      TETAP pertahankan struktur 8 poin utama yang profesional.
      Gunakan format Markdown.`;

      const revisedResult = await callGemini(prompt);
      const newHistory = [...prdHistory, revisedResult];
      setPrdHistory(newHistory);
      setCurrentVersionIdx(newHistory.length - 1);
      setRevisionPrompt('');
      savePrdToBackend(revisedResult);
    } catch (err: any) {
      setError(`Gagal merevisi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentPRD) return;
    navigator.clipboard.writeText(currentPRD);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    if (!currentPRD) return;
    const blob = new Blob([currentPRD], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeAppName = appName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "Aplikasi";
    link.download = `${safeAppName}_v${currentVersionIdx + 1}.md`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleNextQuestion = () => {
    const currentQ = dynamicQuestions[currentScreeningIdx];
    const isLastQ = currentScreeningIdx === dynamicQuestions.length - 1;
    
    if (answers[currentQ.id] === "Lainnya" && customInput.trim()) {
      setAnswers({ ...answers, [currentQ.id]: `Lainnya: ${customInput}` });
    }
    
    setCustomInput("");
    if (isLastQ) setStep(4);
    else setCurrentScreeningIdx(c => c + 1);
  };

  // UI Components
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {step > s ? <CheckCircle className="w-5 h-5" /> : s}
          </div>
          {s < 5 && <div className={`h-1 flex-1 mx-2 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Cpu className="w-3 h-3" /> Powered by Gemini 2.0
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">AI PRD Architect</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Transformasikan ide mentah Anda menjadi dokumen spesifikasi produk yang profesional dan siap bangun dalam hitungan menit.
          </p>
        </header>

        <StepIndicator />

        <main className="relative">
          <AnimatePresence mode="wait">
            
            {/* Step 1: User Profile */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-none shadow-xl shadow-blue-900/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="text-blue-600" /> Profil Pengguna</CardTitle>
                    <CardDescription>Beri tahu kami sedikit tentang diri Anda untuk menyesuaikan gaya PRD.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input 
                        id="name" 
                        placeholder="Masukkan nama Anda" 
                        value={userProfile.name} 
                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pengalaman Coding</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {['pemula', 'menengah', 'ahli'].map((lvl) => (
                          <Button 
                            key={lvl} 
                            variant={userProfile.codingExp === lvl ? "default" : "outline"}
                            onClick={() => setUserProfile({...userProfile, codingExp: lvl})}
                            className="capitalize h-12"
                          >
                            {lvl}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal">Target Utama</Label>
                      <Textarea 
                        id="goal" 
                        placeholder="Apa yang ingin Anda capai dengan PRD ini? (Misal: Mencari investor, panduan tim dev, atau proyek pribadi)" 
                        value={userProfile.goal} 
                        onChange={(e) => setUserProfile({...userProfile, goal: e.target.value})}
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      disabled={!userProfile.name || !userProfile.goal} 
                      onClick={() => setStep(2)} 
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      Lanjut ke Konsep Ide <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Step 2: System Idea */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-none shadow-xl shadow-purple-900/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Cpu className="text-purple-600" /> Konsep Aplikasi</CardTitle>
                    <CardDescription>Jelaskan ide besar Anda. AI akan menganalisis kebutuhan dasar dari sini.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Bahasa Output PRD</Label>
                      <Select 
                        value={systemIdea.language} 
                        onValueChange={(val) => setSystemIdea({...systemIdea, language: val})}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Pilih Bahasa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Indonesia">Bahasa Indonesia</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="desc">Deskripsi Konsep</Label>
                        <Textarea 
                          id="desc" 
                          placeholder="Contoh: Saya ingin membuat aplikasi marketplace untuk barang bekas yang fokus pada keamanan transaksi dengan fitur escrow..." 
                          value={systemIdea.description} 
                          onChange={(e) => setSystemIdea({...systemIdea, description: e.target.value})}
                          className="min-h-[200px] resize-none text-lg leading-relaxed border-slate-200 focus:ring-purple-500 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Lampiran Referensi (Opsional)</Label>
                        {!uploadedFile ? (
                          <div className="relative group">
                            <input 
                              type="file" 
                              onChange={handleFileUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              accept=".pdf,.txt,.doc,.docx,image/*"
                            />
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-white group-hover:border-purple-400 group-hover:bg-purple-50 transition-all duration-200">
                              <div className="p-3 bg-purple-50 rounded-full text-purple-600 group-hover:bg-purple-100">
                                <Upload className="w-6 h-6" />
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-slate-700">Klik atau seret file ke sini</p>
                                <p className="text-xs text-slate-500 mt-1">PDF, Gambar, atau Dokumen Teks</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-100 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <File className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{uploadedFile.name}</span>
                                <span className="text-[10px] text-slate-500 uppercase">{uploadedFile.type.split('/')[1]}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={removeFile} className="text-slate-400 hover:text-red-500">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="h-12">Kembali</Button>
                    <Button 
                      disabled={!systemIdea.description || loading} 
                      onClick={generateDynamicQuestions} 
                      className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    >
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menganalisis Konsep...</> : <>Mulai Screening Kebutuhan <ChevronRight className="ml-2 w-4 h-4" /></>}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Screening Questions (20 Questions) */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-none shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="secondary" className="text-blue-600 bg-blue-50 border-none">Screening Fase {currentScreeningIdx + 1}</Badge>
                      <span className="text-xs font-bold text-gray-400">{Math.round(((currentScreeningIdx + 1) / dynamicQuestions.length) * 100)}% Selesai</span>
                    </div>
                    <Progress value={((currentScreeningIdx + 1) / dynamicQuestions.length) * 100} className="h-1" />
                  </CardHeader>
                  <CardContent className="pt-6 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-600 text-white">
                          {dynamicQuestions[currentScreeningIdx]?.icon}
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold leading-tight">
                          {dynamicQuestions[currentScreeningIdx]?.question}
                        </h2>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 pt-4">
                        {dynamicQuestions[currentScreeningIdx]?.isFreetextOnly ? (
                          <Textarea 
                            className="min-h-[150px] text-lg p-4" 
                            placeholder="Tuliskan jawaban detail Anda di sini..." 
                            value={answers[dynamicQuestions[currentScreeningIdx].id] || ''} 
                            onChange={(e) => setAnswers({...answers, [dynamicQuestions[currentScreeningIdx].id]: e.target.value})} 
                          />
                        ) : (
                          <>
                            {dynamicQuestions[currentScreeningIdx]?.options.map((opt, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => {
                                  setAnswers({...answers, [dynamicQuestions[currentScreeningIdx].id]: opt});
                                  setCustomInput("");
                                }} 
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
                                  answers[dynamicQuestions[currentScreeningIdx].id] === opt 
                                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' 
                                  : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50'
                                }`}
                              >
                                <span className="font-medium">{opt}</span>
                                {answers[dynamicQuestions[currentScreeningIdx].id] === opt && <CheckCircle className="w-5 h-5 text-blue-600" />}
                              </button>
                            ))}
                            <button 
                              onClick={() => setAnswers({...answers, [dynamicQuestions[currentScreeningIdx].id]: "Lainnya"})} 
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                answers[dynamicQuestions[currentScreeningIdx].id]?.startsWith("Lainnya") 
                                ? 'border-blue-600 bg-blue-50' 
                                : 'border-gray-100 bg-white hover:border-blue-200'
                              }`}
                            >
                              <span className="font-medium">Lainnya...</span>
                            </button>
                            {answers[dynamicQuestions[currentScreeningIdx].id]?.startsWith("Lainnya") && (
                              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                <Input 
                                  autoFocus 
                                  placeholder="Sebutkan detail lainnya..." 
                                  value={customInput} 
                                  onChange={(e) => setCustomInput(e.target.value)}
                                  className="h-12 border-blue-600"
                                />
                              </motion.div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-4 pt-8">
                    <Button 
                      variant="ghost" 
                      onClick={() => currentScreeningIdx === 0 ? setStep(2) : setCurrentScreeningIdx(c => c - 1)} 
                      className="h-12"
                    >
                      <ChevronLeft className="mr-2 w-4 h-4" /> Kembali
                    </Button>
                    <Button 
                      disabled={!answers[dynamicQuestions[currentScreeningIdx]?.id] || (answers[dynamicQuestions[currentScreeningIdx]?.id] === "Lainnya" && !customInput.trim())} 
                      onClick={handleNextQuestion} 
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      {currentScreeningIdx === dynamicQuestions.length - 1 ? 'Selesaikan Screening' : 'Berikutnya'} <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Tech Preference */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-none shadow-xl">
                  <CardHeader>
                    <CardTitle>Preferensi Teknologi</CardTitle>
                    <CardDescription>Bagaimana Anda ingin menentukan stack teknologi aplikasi ini?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setTechPreference({...techPreference, mode: 'ai'})} 
                        className={`p-8 border-2 rounded-2xl transition-all text-center space-y-4 ${
                          techPreference.mode === 'ai' 
                          ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' 
                          : 'border-gray-100 hover:border-orange-200'
                        }`}
                      >
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                          <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Rekomendasi AI</h3>
                          <p className="text-sm text-gray-500">Biarkan AI memilihkan stack terbaik sesuai kebutuhan Anda.</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setTechPreference({...techPreference, mode: 'manual'})} 
                        className={`p-8 border-2 rounded-2xl transition-all text-center space-y-4 ${
                          techPreference.mode === 'manual' 
                          ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' 
                          : 'border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                          <Settings className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Pilih Manual</h3>
                          <p className="text-sm text-gray-500">Tentukan sendiri stack yang ingin Anda gunakan.</p>
                        </div>
                      </button>
                    </div>

                    {techPreference.mode === 'manual' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
                      >
                        <div className="space-y-2">
                          <Label>Frontend Framework</Label>
                          <Input placeholder="Contoh: React, Vue, Next.js" value={techPreference.frontend} onChange={(e) => setTechPreference({...techPreference, frontend: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Backend / API</Label>
                          <Input placeholder="Contoh: Node.js, Go, Python" value={techPreference.backend} onChange={(e) => setTechPreference({...techPreference, backend: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Database</Label>
                          <Input placeholder="Contoh: PostgreSQL, MongoDB" value={techPreference.database} onChange={(e) => setTechPreference({...techPreference, database: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Styling</Label>
                          <Input placeholder="Contoh: Tailwind CSS, Shadcn/UI" value={techPreference.styling} onChange={(e) => setTechPreference({...techPreference, styling: e.target.value})} />
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(3)} className="h-12">Kembali</Button>
                    <Button 
                      disabled={loading} 
                      onClick={generatePRD} 
                      className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg"
                    >
                      {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyusun PRD...</> : 'Generate Dokumen PRD'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Step 5: Results & Revision */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-6 h-6" /> PRD Berhasil Disusun
                    </h2>
                    <p className="text-sm text-gray-500">Dokumen spesifikasi teknis lengkap untuk proyek Anda.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {prdHistory.length > 1 && (
                      <Select 
                        value={currentVersionIdx.toString()} 
                        onValueChange={(val) => setCurrentVersionIdx(parseInt(val))}
                      >
                        <SelectTrigger className="w-[140px] h-10 bg-white">
                          <SelectValue placeholder="Versi" />
                        </SelectTrigger>
                        <SelectContent>
                          {prdHistory.map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>Versi {i + 1} {i === prdHistory.length - 1 ? '(Terbaru)' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button variant="outline" size="sm" onClick={resetAllData} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      <RotateCcw className="w-4 h-4 mr-2" /> Mulai Baru
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* PRD Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-2xl overflow-hidden flex flex-col h-[700px]">
                      <CardHeader className="bg-white border-b py-4 flex flex-row items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                          <FileText className="text-blue-600 w-5 h-5" />
                          <span className="font-bold">Dokumen PRD v{currentVersionIdx + 1}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={handleCopy} className={copySuccess ? "text-green-600" : ""}>
                            {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleDownload}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full p-8 bg-white">
                          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 whitespace-pre-wrap font-sans selection:bg-blue-100">
                            {currentPRD}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* History List from Backend */}
                    {savedPrds.length > 0 && (
                      <Card className="border-none shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2 text-blue-800"><History className="w-5 h-5" /> Riwayat Penyimpanan (Backend)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {savedPrds.slice(0, 5).map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold">{item.name}</span>
                                  <span className="text-[10px] text-gray-400">{new Date(item.timestamp).toLocaleString()}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setPrdHistory([item.prd]);
                                  setCurrentVersionIdx(0);
                                }} className="text-blue-600 text-xs">Muat</Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Revision Sidebar */}
                  <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-slate-900 text-white">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><Wand2 className="text-purple-400 w-5 h-5" /> AI Revision</CardTitle>
                        <CardDescription className="text-slate-400">Minta AI untuk menyesuaikan atau menambahkan detail tertentu.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea 
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[150px] resize-none" 
                          placeholder="Contoh: 'Tambahkan detail tentang integrasi WhatsApp API' atau 'Ubah target audiens menjadi lebih spesifik untuk UMKM'..." 
                          value={revisionPrompt}
                          onChange={(e) => setRevisionPrompt(e.target.value)}
                        />
                        <Button 
                          onClick={handleRevision} 
                          disabled={loading || !revisionPrompt.trim()} 
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />} 
                          Update Dokumen
                        </Button>
                      </CardContent>
                      <CardFooter>
                        <p className="text-[10px] text-slate-500 italic">
                          Struktur 8 poin utama akan tetap dipertahankan untuk menjaga standar profesionalisme dokumen.
                        </p>
                      </CardFooter>
                    </Card>

                    <Card className="border-none shadow-lg bg-blue-50">
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-bold text-blue-800">Tips Berikutnya</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-blue-700 space-y-2">
                        <p>• Gunakan PRD ini sebagai panduan untuk tim developer Anda.</p>
                        <p>• Lampirkan dokumen ini saat mencari pendanaan atau pitching ide.</p>
                        <p>• Salin skema database langsung ke alat perancangan data Anda.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t text-center text-gray-400 text-sm">
          <p>© 2024 AI PRD Architect. Build with precision.</p>
        </footer>

      </div>

      {/* Error Toast (Simple) */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <AlertCircle className="shrink-0" />
              <div className="flex-1 text-sm font-medium">{error}</div>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-white hover:bg-white/10">Tutup</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
