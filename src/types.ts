export type Role = "admin" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  type: "boolean" | "quota"; // boolean (ceklis) atau quota (jumlah)
}

export interface PackageFeature {
  featureId: string;
  value?: number; // Nilai kuota jika tipenya 'quota'
}

export interface LearningContent {
  id: string;
  title: string;
  description: string;
  category: "Video" | "Article" | "Guide";
  url: string;
  isPublished: boolean;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  features: PackageFeature[]; 
  active: boolean;
}
