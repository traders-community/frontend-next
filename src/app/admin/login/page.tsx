"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  RiArrowLeftLine,
  RiMailLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiShieldKeyholeLine,
} from "@remixicon/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { authService } from "@/services/auth.service";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect straight to admin panel
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.replace("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login({
        email: email.trim(),
        password,
      });

      if (res.success && res.data?.token) {
        authService.setToken(res.data.token);
        try {
          localStorage.setItem("admin_email", email.trim());
        } catch {}
        toast.success("Welcome back! Redirecting to dashboard...");
        router.replace("/admin");
      } else {
        const msg = res.data?.message || res.message || "Invalid email or password.";
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-hidden">
      {/* Background Decorative Ambient Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[450px] h-[350px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar: Back to website & Theme Toggle */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-5 py-5 sm:py-6 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 py-2 px-3.5 rounded-full border border-border/70 bg-card/60 hover:bg-card hover:border-primary/40 shadow-xs"
        >
          <RiArrowLeftLine className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5 text-primary" />
          <span>Back to website</span>
        </Link>

        <ThemeToggle />
      </header>

      {/* Main Content Area: Centered Login Card */}
      <main className="relative z-10 w-full flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[420px] rounded-3xl border border-border/90 bg-card/85 dark:bg-card/75 backdrop-blur-xl shadow-2xl shadow-black/5 dark:shadow-black/40 p-6 sm:p-9 relative overflow-hidden transition-all duration-200">
          {/* Subtle top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center mb-7">
            <Link
              href="/"
              className="inline-block mb-4 group transition-transform duration-200 hover:scale-[1.02]"
              aria-label="Traders Community"
            >
              {/* Light Mode Logo */}
              <Image
                src="/logo_color.png"
                alt="Traders Community Logo"
                width={175}
                height={48}
                priority
                className="h-10 w-auto object-contain dark:hidden"
              />
              {/* Dark Mode Logo */}
              <Image
                src="/logo_color.png"
                alt="Traders Community Logo"
                width={175}
                height={48}
                priority
                className="h-10 w-auto object-contain hidden dark:block"
              />
            </Link>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              Sign in with your admin credentials to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-foreground/85 uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <RiMailLine className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@traderscommunity.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-surface/80 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-foreground/85 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <RiLockPasswordLine className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm bg-surface/80 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <RiEyeOffLine className="h-4 w-4" />
                  ) : (
                    <RiEyeLine className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary/20 transition-all duration-150 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RiLoader4Line className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to Admin</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Bottom Subtle Footer Info */}
      <footer className="relative z-10 w-full text-center py-5 px-4 text-xs text-muted-foreground/75 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
        <span>Traders Community © {new Date().getFullYear()}</span>
        <span className="hidden sm:inline">•</span>
        <span>
          Developed by{" "}
          <a
            href="https://manankanani.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            Manan Kanani
          </a>
        </span>
      </footer>
    </div>
  );
}
