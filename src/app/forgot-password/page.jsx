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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
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
    <div className="mx-auto max-w-md px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D382B] text-white shadow-sm mb-2">
          <Building2 className="h-6 w-6 text-amber-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
          Forgot Password
        </h1>
        <p className="text-xs text-[#6B7280]">
          Enter your registered email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E2E2E2] bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.06)]">
        {isSubmitted ? (
          <div className="text-center space-y-4 py-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">Check Your Email</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              We have sent a secure password reset link to your email. Please check your inbox and spam folder.
            </p>
            <div className="pt-2">
              <Button href="/login" variant="primary" size="md" className="w-full bg-[#0D382B]">
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
              className="w-full bg-[#0D382B] font-bold"
            >
              Send Password Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
