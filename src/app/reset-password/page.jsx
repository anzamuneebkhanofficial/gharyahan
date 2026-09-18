"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Building2, CheckCircle2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      const supabase = createClient();

      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.updateUser({ password: data.password });
        if (error) {
          toast.error(error.message);
          return;
        }
      }

      setIsSuccess(true);
      toast.success("Password updated successfully! You can now sign in.");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      toast.error(err.message || "Failed to update password.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mb-2">
          <Building2 className="h-6 w-6 text-amber-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Create New Password
        </h1>
        <p className="text-xs text-muted">
          Enter and confirm your new secure account password below.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
        {isSuccess ? (
          <div className="text-center space-y-4 py-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Password Reset Complete!</h3>
            <p className="text-xs text-muted">
              Your password has been changed. Redirecting you to the sign-in page...
            </p>
            <Button href="/login" variant="primary" size="md" className="w-full bg-primary">
              Sign In Now
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters required" },
              })}
              helperText="Minimum 6 characters"
              error={errors.password?.message}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => val === password || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full bg-primary font-bold"
            >
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
