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
  Crown
} from "lucide-react";
import { Package } from "../../types";

const initialPackages: Package[] = [
  { id: "1", name: "Free", price: 0, features: ["5 PRDs per month", "Community support"], active: true },
  { id: "2", name: "Pro", price: 29, features: ["Unlimited PRDs", "Priority support", "Custom templates"], active: true },
  { id: "3", name: "Enterprise", price: 99, features: ["Custom AI models", "Team collaboration", "SSO"], active: true },
];

export function PackageManagement() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);

  const deletePackage = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Package Management</h2>
          <p className="text-muted-foreground">Configure pricing and membership packages.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create Package
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="relative overflow-hidden flex flex-col h-full">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {pkg.price === 0 ? <Zap className="w-5 h-5" /> : pkg.price < 50 ? <Star className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
                </div>
                <Badge variant={pkg.active ? "secondary" : "destructive"}>
                  {pkg.active ? "Active" : "Disabled"}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">${pkg.price}</span>
                <span className="text-muted-foreground ml-1">/per month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
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
