import React, { useState } from "react";
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

  const handleLogin = (role: Role) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name: role === "admin" ? "Hissamudin" : "Member User",
      email: role === "admin" ? "admin@authlux.io" : "user@example.com",
      role: role
    });
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

  if (user) {
    return (
      <DashboardLayout 
        user={user} 
        onLogout={() => setUser(null)} 
      />
    );
  }

  const { title, description } = getHeaderInfo();

  return (
    <div className="relative overflow-hidden">
        {/* Quick Role Select (Developer Tool) */}
        <div className="fixed top-4 right-4 z-50 flex gap-2 p-2 bg-card border rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-700 delay-500">
            <span className="text-[10px] uppercase font-bold text-muted-foreground self-center mr-2">Quick Login:</span>
            <button 
                onClick={() => handleLogin("admin")}
                className="px-3 py-1 text-[10px] font-bold uppercase rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
                Admin
            </button>
            <button 
                onClick={() => handleLogin("member")}
                className="px-3 py-1 text-[10px] font-bold uppercase rounded-md bg-slate-800 text-white hover:bg-slate-900 transition-colors"
            >
                Member
            </button>
        </div>

        <AuthLayout title={title} description={description}>
            <AnimatePresence mode="wait">
                {view === "login" && (
                <LoginForm
                    key="login"
                    onSignUpClick={() => setView("signup")}
                    onForgotPasswordClick={() => setView("forgot-password")}
                />
                )}
                {view === "signup" && (
                <SignUpForm key="signup" onLoginClick={() => setView("login")} />
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
