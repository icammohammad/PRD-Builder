import React, { useState, useMemo, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Plus, 
  History as HistoryIcon,
  Wand2,
  Users,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Zap,
  Globe,
  Database,
  BarChart3,
  AppWindow,
  Settings,
  LayoutDashboard,
  CheckCircle,
  Loader2,
  Copy,
  Download,
  FileDown,
  Lock,
  RefreshCw,
  Upload,
  X,
  File
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Mermaid from '../../Mermaid';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import { User } from "../../../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Question {
  id: number;
  question: string;
  options: string[];
  isFreetextOnly?: boolean;
  icon: React.ReactNode;
}

interface PRDBuilderProps {
  user: User;
}

export function PRDBuilder({ user }: PRDBuilderProps) {
  const [step, setStep] = useState(0); // 0: Start, 1: Questions, 2: Result
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concept, setConcept] = useState("");
  const [appName, setAppName] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [customInput, setCustomInput] = useState("");
  const [prdHistory, setPrdHistory] = useState<string[]>([]);
  const [currentVersionIdx, setCurrentVersionIdx] = useState(-1);
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string, type: string, data: string } | null>(null);
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const prdRef = useRef<HTMLDivElement>(null);

  const currentPRD = useMemo(() => {
    const raw = prdHistory[currentVersionIdx] || null;
    if (!raw) return null;
    
    // Find where the actual markdown structure starts (first # or ## or ---)
    const headerIndex = raw.search(/^(#+\s|---)/m);
    if (headerIndex !== -1) {
      return raw.substring(headerIndex);
    }
    return raw;
  }, [prdHistory, currentVersionIdx]);

  const screeningQuestions: Question[] = useMemo(() => [
    { id: 1, question: "Siapa target audiens utama aplikasi ini?", options: ["Konsumen Umum (B2C)", "Bisnis/Perusahaan (B2B)", "Internal Karyawan", "Developer/Teknis"], icon: <Users className="w-4 h-4" /> },
    { id: 2, question: "Apa masalah utama yang ingin diselesaikan?", options: [], isFreetextOnly: true, icon: <AlertCircle className="w-4 h-4" /> },
    { id: 3, question: "Platform mana yang menjadi prioritas utama?", options: ["Web Application", "Mobile iOS", "Mobile Android", "Desktop (Windows/Mac)", "Cross-platform Mobile"], icon: <Smartphone className="w-4 h-4" /> },
    { id: 4, question: "Apakah aplikasi ini memerlukan sistem login/autentikasi?", options: ["Ya, sangat perlu", "Opsional/Nanti", "Tidak perlu"], icon: <Lock className="w-4 h-4" /> },
    { id: 5, question: "Bagaimana rencana monetisasi aplikasi ini?", options: ["Gratis sepenuhnya", "Model Langganan (SaaS)", "Iklan", "Pembelian dalam aplikasi", "Sekali beli (One-time)"], icon: <CreditCard className="w-4 h-4" /> },
    { id: 6, question: "Apakah ada integrasi pihak ketiga yang diperlukan?", options: ["Payment Gateway (Stripe/Midtrans)", "Social Media Login", "Maps/Geolocation", "Email Service (SendGrid/Resend)", "Tidak ada"], icon: <Zap className="w-4 h-4" /> },
    { id: 7, question: "Seberapa penting keamanan data pengguna?", options: ["Sangat Penting (Fintech/Medis)", "Standar Industri", "Minimal (Data Publik)"], icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 8, question: "Apakah aplikasi membutuhkan fitur real-time?", options: ["Ya (Chat/Notifikasi Langsung)", "Ya (Live Tracking/Dashboard)", "Tidak perlu"], icon: <RefreshCw className="w-4 h-4" /> },
    { id: 9, question: "Berapa perkiraan jumlah pengguna aktif bulanan di awal?", options: ["< 1.000 pengguna", "1.000 - 10.000 pengguna", "10.000 - 100.000 pengguna", "> 100.000 pengguna"], icon: <BarChart3 className="w-4 h-4" /> },
    { id: 10, question: "Apakah ada batasan teknologi tertentu?", options: ["Harus Open Source", "Harus Cloud Native", "Bebas/Rekomendasi AI"], icon: <Settings className="w-4 h-4" /> },
  ], []);

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
        model: "gemini-3-flash-preview",
        contents: { parts: contents },
        config: {
          systemInstruction: "Anda adalah analis sistem senior dan manajer produk. Berikan output teks PRD yang sangat profesional, terstruktur, dan mendalam menggunakan Markdown. Jika ada file yang diunggah, analisis isinya sebagai bagian dari konsep sistem. Untuk diagram alur atau sequence, WAJIB sertakan blok kode mermaid (misal: ```mermaid ... ```) agar sistem dapat merendernya sebagai GAMBAR visual berkualitas tinggi.",
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
      const prompt = `Analisis konsep aplikasi berikut dan berikan 5-7 pertanyaan tambahan yang sangat relevan untuk membantu menyusun PRD yang mendalam.
      
      KONSEP: ${concept}
      ${uploadedFile ? "Analisis juga file yang diunggah untuk mendapatkan konteks tambahan." : ""}
      
      Output harus dalam format JSON ARRAY yang berisi objek dengan struktur:
      {
        "id": number,
        "question": "string",
        "options": ["string", "string", ...],
        "isFreetextOnly": boolean
      }
      
      Sertakan opsi jawaban yang relevan untuk setiap pertanyaan jika bukan freetext. Berikan pertanyaan dalam bahasa Indonesia.`;

      const filePart = uploadedFile ? { mimeType: uploadedFile.type, data: uploadedFile.data } : undefined;
      const dQuestions = await callGemini(prompt, true, filePart);
      
      const icons = [<Users className="w-4 h-4" />, <Zap className="w-4 h-4" />, <ShieldCheck className="w-4 h-4" />, <Database className="w-4 h-4" />, <Smartphone className="w-4 h-4" />, <BarChart3 className="w-4 h-4" />, <LayoutDashboard className="w-4 h-4" />];
      
      const formattedQuestions = dQuestions.map((q: any, idx: number) => ({
        ...q,
        id: q.id + 100, // Offset to avoid collision with standard questions
        icon: icons[idx % icons.length]
      }));

      setDynamicQuestions([...screeningQuestions, ...formattedQuestions]);
      
      const namePrompt = `Berdasarkan konsep ini: "${concept}", berikan 1 nama aplikasi yang paling cocok (hanya nama saja, maks 3 kata).`;
      const nameResult = await callGemini(namePrompt);
      setAppName(nameResult.replace(/["']/g, "").trim());
      
      setStep(1);
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

      const prompt = `Susun Dokumen Persyaratan Produk (PRD) profesional dalam bahasa Indonesia.
      
      DESKRIPSI KONSEP: ${concept}
      ${uploadedFile ? "Analisis juga file yang diunggah sebagai referensi tambahan." : ""}
      
      DETAIL KEBUTUHAN:
      ${answersText}
      
      Gunakan struktur dengan header Level 2 (##) untuk setiap poin utama berikut:
      1. ## Overview & Objective
      2. ## Functional Requirements (User Stories, Flow)
      3. ## Non-Functional Requirements
      4. ## User Personas & Analytics
      5. ## System Architecture & Data Flow
      6. ## Database Schema & Logic Entity
      7. ## Technical Stack Recommendation
      8. ## Sequence Diagram (Gunakan Mermaid)
      9. ## Roadmap & Development Phases
      
      PENTING: Gunakan format Markdown murni. PASTIKAN ada baris kosong sebelum setiap header '##'. Sertakan diagram mermaid yang relevan.`;

      const filePart = uploadedFile ? { mimeType: uploadedFile.type, data: uploadedFile.data } : undefined;
      const result = await callGemini(prompt, false, filePart);
      
      // Save to backend
      try {
        await fetch("/api/prds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: result,
            name: appName || "Untitled PRD",
            concept: concept,
            userId: user.id
          })
        });
      } catch (saveErr) {
        console.error("Failed to save PRD to database:", saveErr);
      }

      setPrdHistory([result]);
      setCurrentVersionIdx(0);
      setStep(2);
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
      ${currentPRD}
      
      Berikan dokumen hasil revisi lengkap. TETAP pertahankan struktur profesional.`;

      const revisedResult = await callGemini(prompt);
      const newHistory = [...prdHistory, revisedResult];
      setPrdHistory(newHistory);
      setCurrentVersionIdx(newHistory.length - 1);
      setRevisionPrompt('');
    } catch (err: any) {
      setError(`Gagal merevisi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setUploadedFile({ name: file.name, type: file.type, data: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    const q = dynamicQuestions[currentQ];
    if (answers[q.id] === "Lainnya" && customInput.trim()) {
      setAnswers({ ...answers, [q.id]: `Lainnya: ${customInput}` });
    }
    setCustomInput("");
    
    if (currentQ < dynamicQuestions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      generatePRD();
    }
  };

  const handleCopy = () => {
    if (!currentPRD) return;
    navigator.clipboard.writeText(currentPRD);
  };

  const handleDownload = () => {
    if (!currentPRD) return;
    const blob = new Blob([currentPRD], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${appName || "App"}_PRD.md`;
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!prdRef.current) return;
    setLoading(true);
    try {
      const element = prdRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          // BRUTE FORCE FALLBACK for oklch:
          // html2canvas fails on oklch. We need to find and replace all instances in the cloned document.
          
          const styles = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styles.length; i++) {
            if (styles[i].innerHTML) {
              // Replace all oklch() functions with a safe fallback color (slate-800 for foreground, white for bg is risky but gray is safe).
              // We'll replace it with a generic gray or transparent, as the specific element overrides below should fix important colors.
              styles[i].innerHTML = styles[i].innerHTML.replace(/oklch\([^)]+\)/g, '#94a3b8');
            }
          }
          
          // 1. Replace CSS variables in :root
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            :root {
              --primary: #0f172a !important;
              --primary-foreground: #ffffff !important;
              --background: #ffffff !important;
              --foreground: #0f172a !important;
              --card: #ffffff !important;
              --card-foreground: #0f172a !important;
              --border: #e2e8f0 !important;
              --muted: #f1f5f9 !important;
              --muted-foreground: #64748b !important;
              --accent: #f1f5f9 !important;
              --accent-foreground: #0f172a !important;
              --slate-50: #f8fafc !important;
              --slate-100: #f1f5f9 !important;
              --slate-200: #e2e8f0 !important;
              --slate-800: #1e293b !important;
              --slate-900: #0f172a !important;
            }
            * {
              color-scheme: light !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          // 2. Recursively find and fix oklch in computed styles or inline styles
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.style) {
              // Simple regex to replace anything that looks like oklch with a neutral gray or its fallback
              // Usually the issue is in the computed style that html2canvas reads
              // We'll just force important styles to be safe
              if (el.classList.contains('bg-background')) el.style.backgroundColor = '#ffffff';
              if (el.classList.contains('text-foreground')) el.style.color = '#0f172a';
              if (el.classList.contains('border-border')) el.style.borderColor = '#e2e8f0';
              if (el.classList.contains('text-primary')) el.style.color = '#0f172a';
              if (el.classList.contains('bg-primary')) el.style.backgroundColor = '#0f172a';
              if (el.classList.contains('bg-muted')) el.style.backgroundColor = '#f1f5f9';
              if (el.classList.contains('text-muted-foreground')) el.style.color = '#64748b';
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Handle multiple pages if content is long
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${appName || "App"}_PRD.pdf`);
    } catch (err: any) {
      setError(`Gagal membuat PDF: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI PRD Builder</h2>
          <p className="text-muted-foreground">Architect your product requirements with Gemini 3 Pro.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              setStep(0);
              setCurrentQ(0);
              setConcept("");
              setAnswers({});
              setPrdHistory([]);
              setCurrentVersionIdx(-1);
            }}>
                <Plus className="w-4 h-4" /> New PRD
            </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="text-primary" /> Konsep Ide Baru
                </CardTitle>
                <CardDescription>Jelaskan secara singkat aplikasi apa yang ingin Anda bangun.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Project Concept</Label>
                  <Textarea 
                    placeholder="Contoh: Aplikasi jasa titip barang luar negeri dengan sistem verifikasi traveler..."
                    className="min-h-[150px] resize-none text-lg leading-relaxed"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Lampiran Referensi (Opsional)</Label>
                  {!uploadedFile ? (
                    <div className="relative group border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-white hover:border-primary/50 transition-all">
                      <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                      <p className="text-sm font-medium">Klik untuk mengunggah dokumen referensi</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setUploadedFile(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  disabled={!concept || loading} 
                  className="w-full h-12 text-lg" 
                  onClick={generateDynamicQuestions}
                >
                  {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menganalisis...</> : <>Mulai Screening <ChevronRight className="ml-2 w-5 h-5" /></>}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-none shadow-xl">
              <CardHeader className="pb-4 border-b bg-muted/20">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                    STEP {currentQ + 1} OF {dynamicQuestions.length}
                  </Badge>
                  <span className="text-xs font-bold text-muted-foreground">
                    {Math.round(((currentQ + 1) / dynamicQuestions.length) * 100)}% SELESAI
                  </span>
                </div>
                <Progress value={((currentQ + 1) / dynamicQuestions.length) * 100} className="h-1.5" />
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary text-primary-foreground">
                      {dynamicQuestions[currentQ]?.icon}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      {dynamicQuestions[currentQ]?.question}
                    </h3>
                  </div>
                  
                  <div className="grid gap-3 pt-4">
                    {dynamicQuestions[currentQ]?.isFreetextOnly ? (
                      <Textarea 
                        className="min-h-[150px] text-lg p-4" 
                        placeholder="Tuliskan jawaban detail Anda..." 
                        value={answers[dynamicQuestions[currentQ].id] || ''} 
                        onChange={(e) => setAnswers({...answers, [dynamicQuestions[currentQ].id]: e.target.value})} 
                      />
                    ) : (
                      <>
                        {dynamicQuestions[currentQ]?.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => setAnswers({...answers, [dynamicQuestions[currentQ].id]: option})}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                              answers[dynamicQuestions[currentQ].id] === option
                              ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                              : 'border-muted hover:border-primary/50'
                            }`}
                          >
                            <span className="font-semibold">{option}</span>
                            {answers[dynamicQuestions[currentQ].id] === option && <CheckCircle className="w-5 h-5 text-primary" />}
                          </button>
                        ))}
                        <button 
                          onClick={() => setAnswers({...answers, [dynamicQuestions[currentQ].id]: "Lainnya"})} 
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            answers[dynamicQuestions[currentQ].id]?.startsWith("Lainnya") ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                        >
                          <span className="font-medium">Lainnya...</span>
                        </button>
                        {answers[dynamicQuestions[currentQ].id]?.startsWith("Lainnya") && (
                          <Input 
                            autoFocus 
                            placeholder="Sebutkan detail lainnya..." 
                            value={customInput} 
                            onChange={(e) => setCustomInput(e.target.value)}
                            className="mt-2 h-12 border-primary"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-4 pt-8 border-t">
                <Button variant="ghost" className="h-12" onClick={() => currentQ === 0 ? setStep(0) : setCurrentQ(prev => prev - 1)}>
                  <ChevronLeft className="mr-2 w-4 h-4" /> Kembali
                </Button>
                <Button 
                  disabled={!answers[dynamicQuestions[currentQ]?.id] || loading} 
                  className="flex-1 h-12"
                  onClick={handleNext}
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyusun PRD...</> : currentQ === dynamicQuestions.length - 1 ? 'Selesaikan & Generate' : 'Berikutnya'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 2 && currentPRD && (
          <div
            key="result"
            className="space-y-8 pb-20 animate-in fade-in duration-500"
          >
              {/* PRD Content - Single Unified Card */}
              <Card className="border-none shadow-xl shadow-slate-200/40 overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50 py-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold tracking-tight">Product Requirements Document</CardTitle>
                        <CardDescription>{appName || "Comprehensive architecture and functional specification"}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                        <Copy className="w-4 h-4" /> Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2" title="Download Markdown">
                        <Download className="w-4 h-4" /> MD
                      </Button>
                      <Button variant="default" size="sm" onClick={handleDownloadPDF} disabled={loading} className="gap-2 shadow-sm">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                        Download PDF
                      </Button>
                      {prdHistory.length > 1 && (
                        <div className="flex border rounded-lg overflow-hidden shrink-0 bg-white">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none border-r" 
                            disabled={currentVersionIdx === 0}
                            onClick={() => setCurrentVersionIdx(v => v - 1)}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <div className="flex items-center px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">v{currentVersionIdx + 1}</div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none border-l"
                            disabled={currentVersionIdx === prdHistory.length - 1}
                            onClick={() => setCurrentVersionIdx(v => v + 1)}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent ref={prdRef} className="p-8 prose prose-slate max-w-none prose-sm md:prose-base dark:prose-invert bg-white">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-mermaid/.exec(className || '');
                        return !inline && match ? (
                          <div className="my-6 flex justify-center bg-white p-4 rounded-xl border border-slate-100 overflow-hidden">
                            <Mermaid chart={String(children).replace(/\n$/, '')} />
                          </div>
                        ) : (
                          <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200" {...props}>
                            {children}
                          </code>
                        );
                      },
                      // Add some custom styling for headers within the single card
                      h1: ({children}) => <h1 className="text-3xl font-bold mt-8 mb-4 border-b pb-4 text-slate-900 leading-tight">{children}</h1>,
                      h2: ({children}) => <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center gap-2 text-slate-800 border-l-4 border-primary pl-4">{children}</h2>,
                      h3: ({children}) => <h3 className="text-xl font-bold mt-8 mb-4 text-slate-700">{children}</h3>,
                      table: ({children}) => (
                        <div className="overflow-x-auto my-6 border rounded-xl">
                          <table className="min-w-full divide-y divide-slate-200">{children}</table>
                        </div>
                      ),
                      td: ({children}) => <td className="px-4 py-3 text-sm text-slate-600 border-b">{children}</td>,
                      th: ({children}) => <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 bg-slate-50 border-b">{children}</th>
                    }}
                  >
                    {currentPRD}
                  </ReactMarkdown>
                </CardContent>
              </Card>

              {/* Revision Card - Simplified */}
              <Card className="border-dashed border-2 bg-muted/30 shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-primary" /> Refining & Revision
                  </CardTitle>
                  <CardDescription>Need to change something? Gemini will update the entire document based on your feedback.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="E.g. Add more detail about the user dashboard, or change the database to MongoDB..."
                    value={revisionPrompt}
                    onChange={(e) => setRevisionPrompt(e.target.value)}
                    className="min-h-[120px] bg-white text-lg leading-relaxed border-slate-200 focus:ring-primary rounded-xl"
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    disabled={!revisionPrompt.trim() || loading} 
                    className="w-full h-12 text-lg font-bold" 
                    onClick={handleRevision}
                  >
                    {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Tinkering...</> : 'Apply Revision'}
                  </Button>
                </CardFooter>
              </Card>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
