import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { AuthLayout } from "./components/auth/AuthLayout";
import { LoginForm } from "./components/auth/LoginForm";
import { SignUpForm } from "./components/auth/SignUpForm";
import { ForgotPasswordForm } from "./components/auth/ForgotPasswordForm";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { User, Role } from "./types";

type AuthView = "login" | "signup" | "forgot-password";

export default function App() {
  const [view, setView] = useState<AuthView>("login");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth check failed", error);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData: User, token: string) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const getHeaderInfo = () => {
    switch (view) {
      case "login":
        return {
          title: "Welcome back",
          description: "Enter your email below to login to your account",
        };
      case "signup":
        return {
          title: "Create an account",
          description: "Enter your details below to create your account",
        };
      case "forgot-password":
        return {
          title: "Reset your password",
          description: "Enter your email and we'll send you a reset link",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return (
      <DashboardLayout 
        user={user} 
        onLogout={handleLogout} 
      />
    );
  }

  const { title, description } = getHeaderInfo();

  // Test credentials helper
  const quickLogin = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        handleLoginSuccess(data.user, data.token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative overflow-hidden">
        <AuthLayout title={title} description={description}>
            <AnimatePresence mode="wait">
                {view === "login" && (
                <LoginForm
                    key="login"
                    onSignUpClick={() => setView("signup")}
                    onForgotPasswordClick={() => setView("forgot-password")}
                    onLoginSuccess={handleLoginSuccess}
                />
                )}
                {view === "signup" && (
                <SignUpForm 
                    key="signup" 
                    onLoginClick={() => setView("login")} 
                    onSignUpSuccess={handleLoginSuccess}
                />
                )}
                {view === "forgot-password" && (
                <ForgotPasswordForm
                    key="forgot-password"
                    onBackToLogin={() => setView("login")}
                />
                )}
            </AnimatePresence>
        </AuthLayout>
    </div>
  );
}
