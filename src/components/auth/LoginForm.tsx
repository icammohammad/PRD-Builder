import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

import { SocialAuth } from "./SocialAuth";
import { User } from "../../types";

interface LoginFormProps {
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
  onLoginSuccess: (userData: User, token: string) => void;
}

export function LoginForm({ onSignUpClick, onForgotPasswordClick, onLoginSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button
                variant="link"
                className="px-0 font-normal h-auto text-xs"
                onClick={onForgotPasswordClick}
                type="button"
              >
                Forgot your password?
              </Button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
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
        Don&apos;t have an account?{" "}
        <Button variant="link" className="px-0 h-auto" onClick={onSignUpClick} type="button">
          Sign up
        </Button>
      </div>
    </motion.div>
  );
}
