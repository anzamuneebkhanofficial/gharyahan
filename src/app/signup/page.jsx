"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "../../lib/validators/authSchema";
import { useAuthStore } from "../../stores/useAuthStore";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LocationInput from "../../components/ui/LocationInput";
import { Building2, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [detectedCity, setDetectedCity] = useState("Lahore");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      phone: "",
      cnic: "",
      role: "tenant",
      area: "",
    },
  });

  const selectedRole = watch("role");
  const passwordValue = watch("password") || "";

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: "Weak (min 6 chars)", color: "bg-rose-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-600" };
  };
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    try {
      const resolvedCity =
        detectedCity ||
        (data.area && data.area.includes(",")
          ? data.area.split(",").pop().trim()
          : "Pakistan");

      const supabase = createClient();

      if (isSupabaseConfigured() && supabase) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        const redirectUrl = `${appUrl}/auth/callback?role=${data.role}`;

        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: data.full_name?.trim(),
              email: data.email?.trim(),
              phone: data.phone?.trim(),
              whatsapp_number: data.phone?.trim(),
              cnic: data.cnic?.trim(),
              role: data.role,
              city: resolvedCity,
              area: data.area,
            },
          },
        });

        if (error) {
          const msg = error.message?.toLowerCase() || "";
          const isAlreadyRegistered =
            msg.includes("already registered") ||
            msg.includes("already exists") ||
            msg.includes("user_already_exists");
          const isRateLimit =
            msg.includes("rate limit") ||
            msg.includes("email rate") ||
            msg.includes("over_email_send_rate_limit") ||
            msg.includes("too many requests") ||
            error.status === 429;

          if (isAlreadyRegistered) {
            toast.error("An account with this email already exists! Please sign in.", {
              duration: 6000,
              action: {
                label: "Go to Sign In",
                onClick: () => router.push("/login"),
              },
            });
            return;
          }

          if (isRateLimit) {
            toast.error(
              "Email rate limit reached (HTTP 429): Supabase free tier limits email sending to 3-4 per hour. Please wait a short while or try signing in if your account is already created.",
              {
                duration: 9000,
                action: {
                  label: "Go to Sign In",
                  onClick: () => router.push("/login"),
                },
              }
            );
            return;
          }

          toast.error(error.message);
          return;
        }

        // Supabase returns empty identities array if user is already registered and verified
        if (
          authData?.user &&
          Array.isArray(authData.user.identities) &&
          authData.user.identities.length === 0
        ) {
          toast.error("An account with this email already exists and is verified. Please sign in!", {
            duration: 6000,
            action: {
              label: "Sign In",
              onClick: () => router.push("/login"),
            },
          });
          return;
        }

        // Strict Requirement: If email confirmation is enabled in Supabase,
        // session is null. Route user to /login and ask them to verify email.
        if (authData.user && !authData.session) {
          toast.success("Registration successful! A confirmation email has been sent to your inbox. Please check your email to verify your account before logging in.", { duration: 8000 });
          router.replace("/login");
          return;
        }

        if (authData.session) {
          login({
            id: authData.user.id,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            whatsapp_number: data.phone,
            cnic: data.cnic,
            role: data.role,
            city: resolvedCity,
            area: data.area,
          });
          toast.success(`Account created as ${data.role.toUpperCase()}!`);
          router.replace(data.role === "landlord" ? "/dashboard" : "/search");
          router.refresh();
          return;
        }
      } else {
        toast.error("Database connection is not available. Please check system configuration.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create account");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-5 sm:py-7 space-y-4">
      <div className="text-center space-y-1">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mb-1">
          <Building2 className="h-5 w-5 text-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          Join GharYahan
        </h1>
        <p className="text-xs text-muted">
          Pakistan's 100% free hyperlocal rental marketplace.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role selector buttons */}
          <div>
            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <label
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 rounded-xl border p-3 sm:px-4 cursor-pointer text-center sm:text-left transition-all ${
                  selectedRole === "tenant"
                    ? "border-primary bg-primary-light/60 text-primary ring-1 ring-primary shadow-xs"
                    : "border-border hover:bg-background text-muted"
                }`}
              >
                <input
                  type="radio"
                  value="tenant"
                  className="sr-only"
                  {...register("role")}
                />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <User className="h-5 w-5 text-emerald-800" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-foreground">Find a Home</span>
                  <span className="block text-[10px] sm:text-[11px] text-muted">Tenant</span>
                </div>
              </label>

              <label
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 rounded-xl border p-3 sm:px-4 cursor-pointer text-center sm:text-left transition-all ${
                  selectedRole === "landlord"
                    ? "border-accent bg-accent-light text-foreground ring-1 ring-accent shadow-xs"
                    : "border-border hover:bg-background text-muted"
                }`}
              >
                <input
                  type="radio"
                  value="landlord"
                  className="sr-only"
                  {...register("role")}
                />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Building2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-foreground">List Property</span>
                  <span className="block text-[10px] sm:text-[11px] text-muted">Landlord</span>
                </div>
              </label>
            </div>
            {errors.role && (
              <p className="text-xs text-rose-600 mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Form fields in 2-column grid layout on sm+ screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Anza Muneeb"
              {...register("full_name")}
              error={errors.full_name?.message}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="WhatsApp / Mobile Number"
              placeholder="e.g. 03001234567"
              helperText="Used for direct WhatsApp links with renters or landlords."
              {...register("phone")}
              error={errors.phone?.message}
            />

            <Input
              label="CNIC Number"
              placeholder="e.g. 35202-1234567-8"
              helperText="Required for identity verification."
              {...register("cnic")}
              error={errors.cnic?.message}
            />

            <div className="sm:col-span-2">
              <LocationInput
                label="Your City & Area / Location"
                placeholder="e.g. Singhpura, Lahore or Gulshan, Karachi"
                value={watch("area")}
                onChange={(e) => setValue("area", e.target.value, { shouldValidate: true })}
                onLocationDetected={({ area, city, displayName }) => {
                  setValue("area", displayName || area, { shouldValidate: true });
                  if (city) setDetectedCity(city);
                }}
                error={errors.area?.message}
                helperText="Enter your location manually or use Auto GPS to set your locality."
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Input
                label="Create Password"
                type="password"
                placeholder="••••••••"
                helperText="Must be at least 6 characters (mix of letters & numbers recommended)."
                {...register("password")}
                error={errors.password?.message}
              />
              {passwordValue && (
                <div className="space-y-1 pt-0.5 animate-in fade-in duration-200">
                  <div className="flex gap-1.5 h-1.5 w-full">
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength.score >= 1 ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength.score >= 2 ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength.score >= 3 ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength.score >= 4 ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-muted">
                    <span>Password Strength:</span>
                    <span className="font-semibold text-foreground">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full bg-primary mt-3 font-bold"
          >
            <span>Create Account</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center text-xs text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
