export type Role = "admin" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  features: string[];
  active: boolean;
}
