import React, { useState } from "react";
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
  Badge 
} from "@/components/ui/badge";
import { 
  Plus,
  Trash2,
  Edit,
  Check,
  Package as PackageIcon,
  Zap,
  Star,
  Crown,
  X,
  Save,
  Info
} from "lucide-react";
import { Package, Feature } from "../../../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { initialFeatures } from "./FeatureManagement";

const initialPackages: Package[] = [
  { id: "1", name: "Free", price: 0, features: [{ featureId: "f1", value: 3 }, { featureId: "f3" }], active: true },
  { id: "2", name: "Pro", price: 450000, features: [{ featureId: "f1", value: 50 }, { featureId: "f2" }, { featureId: "f3" }, { featureId: "f4" }], active: true },
  { id: "3", name: "Enterprise", price: 1500000, features: [{ featureId: "f1", value: 1000 }, { featureId: "f2" }, { featureId: "f3" }, { featureId: "f4" }], active: true },
];

export function PackageManagement() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Package>>({ name: "", price: 0, features: [], active: true });
  
  // Available features from master list
  const [masterFeatures] = useState<Feature[]>(initialFeatures);

  const deletePackage = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
  };

  const handleSave = () => {
    if (editingPackage) {
      setPackages(packages.map(p => p.id === editingPackage.id ? { ...p, ...formData } as Package : p));
      setEditingPackage(null);
    } else if (isAdding) {
      const newPkg = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as Package;
      setPackages([...packages, newPkg]);
      setIsAdding(false);
    }
  };

  const startEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData(pkg);
    setIsAdding(false);
  };

  const startAdd = () => {
    setFormData({ name: "", price: 0, features: [], active: true });
    setIsAdding(true);
    setEditingPackage(null);
  };

  const toggleFeature = (featureId: string) => {
    const currentFeatures = formData.features || [];
    const exists = currentFeatures.find(f => f.featureId === featureId);
    
    if (exists) {
      setFormData({ ...formData, features: currentFeatures.filter(f => f.featureId !== featureId) });
    } else {
      const master = masterFeatures.find(f => f.id === featureId);
      setFormData({ 
        ...formData, 
        features: [...currentFeatures, { featureId, value: master?.type === 'quota' ? 0 : undefined }] 
      });
    }
  };

  const updateQuotaValue = (featureId: string, value: number) => {
    const currentFeatures = formData.features || [];
    setFormData({
      ...formData,
      features: currentFeatures.map(f => f.featureId === featureId ? { ...f, value } : f)
    });
  };

  const getFeatureName = (id: string) => {
    return masterFeatures.find(f => f.id === id)?.name || id;
  };

  const getFeatureDisplay = (pkgFeature: any) => {
    const master = masterFeatures.find(f => f.id === pkgFeature.featureId);
    if (!master) return pkgFeature.featureId;
    if (master.type === 'quota') {
      return `${pkgFeature.value || 0} ${master.name}`;
    }
    return master.name;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Package Management</h2>
          <p className="text-muted-foreground">Configure pricing and membership packages (IDR).</p>
        </div>
        <Button className="gap-2" onClick={startAdd}>
          <Plus className="w-4 h-4" /> Create Package
        </Button>
      </div>

      {(isAdding || editingPackage) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{isAdding ? "Add New Package" : "Edit Package"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingPackage(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Monthly Price (Rp)</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Select Features from Master List</Label>
                <div className="group relative">
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity w-48 pointer-events-none z-50">
                    Features must be created in "Master Features" before they can be added to packages.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {masterFeatures.map((feature) => {
                  const isSelected = formData.features?.find(f => f.featureId === feature.id);
                  return (
                    <div 
                      key={feature.id} 
                      className={`flex flex-col p-3 rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-primary/10 border-primary shadow-sm' 
                          : 'bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleFeature(feature.id)}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-semibold">{feature.name}</span>
                          <span className="text-[10px] opacity-70 truncate max-w-[200px]">{feature.description}</span>
                        </div>
                        {feature.type === "quota" && isSelected && (
                          <div className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">
                            Quota
                          </div>
                        )}
                      </div>

                      {feature.type === "quota" && isSelected && (
                        <div className="mt-3 pt-3 border-t border-primary/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Label className="text-[10px] uppercase font-bold text-primary/70">Set Limit:</Label>
                          <Input 
                            type="number" 
                            className="h-8 w-24 bg-white" 
                            value={isSelected.value || 0}
                            onChange={(e) => updateQuotaValue(feature.id, Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-[10px] text-muted-foreground italic">per month</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="pkg-active" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
              <Label htmlFor="pkg-active">Active and visible to users</Label>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsAdding(false); setEditingPackage(null); }}>Cancel</Button>
            <Button onClick={handleSave}>{editingPackage ? "Save Changes" : "Create Package"}</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="relative overflow-hidden flex flex-col h-full border-none shadow-xl shadow-slate-200/50">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {pkg.price === 0 ? <Zap className="w-5 h-5" /> : pkg.price < 500000 ? <Star className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
                </div>
                <Badge variant={pkg.active ? "secondary" : "destructive"} className={pkg.active ? "bg-emerald-100 text-emerald-800 border-none" : ""}>
                  {pkg.active ? "Active" : "Disabled"}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">{pkg.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold text-foreground">Rp {pkg.price.toLocaleString('id-ID')}</span>
                <span className="text-muted-foreground ml-1">/per bulan</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm">
                {pkg.features.map((pkgFunc, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{getFeatureDisplay(pkgFunc)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2 border-t bg-slate-50/50 p-4">
              <Button variant="outline" size="sm" className="gap-2 bg-white" onClick={() => startEdit(pkg)}>
                <Edit className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                onClick={() => deletePackage(pkg.id)}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
