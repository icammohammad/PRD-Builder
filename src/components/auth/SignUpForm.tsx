import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User as UserIcon, Ticket, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { User } from "../../types";

import { SocialAuth } from "./SocialAuth";

interface SignUpFormProps {
  onLoginClick: () => void;
  onSignUpSuccess: (userData: User, token: string) => void;
}

export function SignUpForm({ onLoginClick, onSignUpSuccess }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      onSignUpSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid gap-6"
    >
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="John Doe"
                type="text"
                autoComplete="name"
                disabled={isLoading}
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="referral">Referral Code (Optional)</Label>
            </div>
            <div className="relative">
              <Ticket className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="referral"
                placeholder="E.g. HISSAM2026"
                type="text"
                disabled={isLoading}
                className="pl-10 font-mono text-xs uppercase"
              />
            </div>
            <p className="text-[10px] text-muted-foreground italic">Punya kode? Masukkan untuk mendapatkan bonus pendaftaran.</p>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <SocialAuth />

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Button variant="link" className="px-0 h-auto" onClick={onLoginClick} type="button">
          Sign in
        </Button>
      </div>
    </motion.div>
  );
}
