"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const supabase = createClient();

      if (isSupabaseConfigured() && supabase) {
        const appUrl = (typeof window !== "undefined" && window.location.origin) || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const redirectTo = `${appUrl}/reset-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim(), {
          redirectTo,
        });

        if (error) {
          toast.error(error.message);
          return;
        }
      }

      setIsSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (err) {
      toast.error(err.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="auth-page">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center rounded-2xl bg-primary text-white mb-2" style={{width:52, height:52, boxShadow: "0 4px 16px rgba(11,43,32,.28), 0 0 0 1px rgba(11,43,32,.12)"}}>
            <Building2 className="h-6 w-6" style={{color: "#E8A838"}} />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Forgot Password
          </h1>
          <p className="text-sm text-muted">
            Enter your registered email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card-hover">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{background: "var(--status-available-bg)", border: "1px solid var(--status-available-border)"}}>
                <CheckCircle2 className="h-6 w-6" style={{color: "var(--status-available-text)"}} />
              </div>
              <h3 className="text-base font-bold text-foreground">Check Your Email</h3>
              <p className="text-sm text-muted leading-relaxed">
                We have sent a secure password reset link to your email. Please check your inbox and spam folder.
              </p>
              <div className="pt-2">
                <Button href="/login" variant="primary" size="md" className="w-full font-bold">
                  Return to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
                error={errors.email?.message}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full font-bold"
              >
                Send Password Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
