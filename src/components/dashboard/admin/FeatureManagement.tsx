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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  X,
  CheckCircle2,
  Box
} from "lucide-react";
import { Feature } from "../../../types";

export const initialFeatures: Feature[] = [
  { id: "f1", name: "PRD Generation Limit", description: "Batas maksimal PRD yang dapat digenerate per bulan.", type: "quota" },
  { id: "f2", name: "Revisi PRD Lewat Chat", description: "Akses untuk merevisi PRD menggunakan chat AI.", type: "boolean" },
  { id: "f3", name: "Download PDF & Markdown", description: "Akses untuk mengunduh dokumen dalam format PDF dan Markdown.", type: "boolean" },
  { id: "f4", name: "Learning Content", description: "Akses ke materi pembelajaran dan panduan produk eksklusif.", type: "boolean" },
];

export function FeatureManagement() {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Feature>>({ name: "", description: "", type: "boolean" });

  const filteredFeatures = features.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (editingId) {
      setFeatures(features.map(f => f.id === editingId ? { ...f, ...formData } : f));
      setEditingId(null);
    } else {
      const newFeature = {
        ...formData,
        id: `f${Math.random().toString(36).substr(2, 9)}`,
      } as Feature;
      setFeatures([...features, newFeature]);
      setIsAdding(false);
    }
    setFormData({ name: "", description: "", type: "boolean" });
  };

  const startEdit = (f: Feature) => {
    setEditingId(f.id);
    setFormData(f);
    setIsAdding(false);
  };

  const deleteFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Feature Management</h2>
          <p className="text-muted-foreground">Manage the master list of features available across all packages.</p>
        </div>
        <Button className="gap-2" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: "", description: "", type: "boolean" }); }}>
          <Plus className="w-4 h-4" /> Add Master Feature
        </Button>
      </div>

      {(isAdding || editingId) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{isAdding ? "Add Feature" : "Edit Feature"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingId(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Feature Name</Label>
                  <Input 
                    value={formData.name || ""} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. API Access"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Feature Type</Label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        checked={formData.type === "boolean"} 
                        onChange={() => setFormData({ ...formData, type: "boolean" })}
                      />
                      <span className="text-sm">Boolean (Checklist)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        checked={formData.type === "quota"} 
                        onChange={() => setFormData({ ...formData, type: "quota" })}
                      />
                      <span className="text-sm">Quota (Quantitative)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description || ""} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this feature offer?"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
              <Button onClick={handleSave}>{editingId ? "Save Changes" : "Create Feature"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search features..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFeatures.map((f) => (
              <div key={f.id} className="p-4 rounded-xl border bg-card hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Box className="w-4 h-4" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(f)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteFeature(f.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{f.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" /> Master Feature
                  </div>
                  <div className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase transition-colors ${
                    f.type === "quota" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {f.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
