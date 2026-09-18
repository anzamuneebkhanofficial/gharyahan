"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../lib/validators/authSchema";
import { useAuthStore } from "../../stores/useAuthStore";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Building2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const verified = searchParams.get("verified");
  const { login } = useAuthStore();

  useEffect(() => {
    if (verified === "true") {
      toast.success("Email verified successfully! You can now sign in.");
    }
  }, [verified]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // 1. First, check secret Master Administrator credentials configured in .env.local / Vercel
      const adminCheckRes = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const adminCheckData = await adminCheckRes.json();

      if (adminCheckData.isAdmin && adminCheckData.user) {
        login(adminCheckData.user);
        toast.success("Welcome, Master Administrator! Full platform access granted.");
        // Use router.replace to prevent back-button loops into login form
        router.replace("/admin");
        router.refresh();
        return;
      }

      // 2. Otherwise, authenticate via Supabase Auth for Tenants & Landlords
      const supabase = createClient();

      if (isSupabaseConfigured() && supabase) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          const msg = error.message?.toLowerCase() || "";
          const isEmailNotConfirmed =
            msg.includes("email not confirmed") ||
            error.code === "email_not_confirmed";

          if (isEmailNotConfirmed) {
            toast.error(
              "Email not verified! Please check your inbox and click the verification link before signing in.",
              {
                duration: 8000,
              }
            );
            return;
          }

          toast.error(error.message);
          return;
        }

        // Fetch user profile from public.profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        const userRole = profile?.role || authData.user.user_metadata?.role || "tenant";
        const rawName = (profile?.full_name || authData.user.user_metadata?.full_name || authData.user.email.split("@")[0] || "User").trim();
        login({
          id: authData.user.id,
          full_name: rawName,
          email: authData.user.email,
          phone: (profile?.phone || authData.user.user_metadata?.phone || "")?.trim(),
          whatsapp_number: (profile?.whatsapp_number || authData.user.user_metadata?.whatsapp_number || profile?.phone || authData.user.user_metadata?.phone || "")?.trim(),
          cnic: (profile?.cnic || authData.user.user_metadata?.cnic || "")?.trim(),
          role: userRole,
          city: (profile?.city || authData.user.user_metadata?.city || "Lahore")?.trim(),
          area: (profile?.area || authData.user.user_metadata?.area || "Singhpura")?.trim(),
          avatar_url: profile?.avatar_url || authData.user.user_metadata?.avatar_url || "",
          email_confirmed_at: authData.user.email_confirmed_at || new Date().toISOString(), // Since they logged in, it must be verified
        });

        toast.success(`Welcome back, ${profile?.full_name || "User"}!`);
        
        // Smart redirection using router.replace
        const destination = redirectTo || (userRole === "landlord" ? "/dashboard" : "/search");
        router.replace(destination);
        router.refresh();
      } else {
        toast.error("Database connection is not available. Please check system configuration.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to sign in");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mb-2">
          <Building2 className="h-6 w-6 text-amber-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Welcome to GharYahan
        </h1>
        <p className="text-xs text-muted">
          Sign in to manage your rental properties or access saved favorites.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full bg-primary mt-2 font-bold"
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center text-xs text-secondary">
          Don't have an account?{" "}
          <Link href="/signup" className="font-bold text-primary hover:underline">
            Register as Tenant or Landlord
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-subtle text-xs">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

