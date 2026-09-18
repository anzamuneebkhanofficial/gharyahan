"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Shield, Lock, ShieldCheck, ArrowUpRight } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import ProfileImageUpload from "../../../components/ui/ProfileImageUpload";
import { useAuthStore } from "../../../stores/useAuthStore";
import { toast } from "sonner";

import ProfileSkeleton from "../../../components/skeletons/ProfileSkeleton";

export default function AdminProfilePage() {
  const { user, login, isLoadingAuth } = useAuthStore();

  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm({
    values: {
      fullName: user?.full_name?.trim() || "Master Administrator",
      phone: user?.phone?.trim() || "03000000000",
      avatarUrl: user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    }
  });

  const formFullName = watch("fullName");
  const formAvatarUrl = watch("avatarUrl");

  const onSubmit = (data) => {
    setIsSaving(true);
    try {
      const updatedUser = {
        ...user,
        full_name: data.fullName.trim(),
        phone: data.phone.trim(),
        whatsapp_number: data.phone.trim(),
        avatar_url: data.avatarUrl.trim(),
      };
      login(updatedUser);
      toast.success("Admin profile details updated successfully.");
    } catch {
      toast.error("Failed to update admin profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingAuth) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Administrator Profile
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Manage your platform administrator identity, display credentials, and master account avatar.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 border border-red-200">
          <ShieldCheck className="h-4 w-4 text-red-600" />
          <span>Superadmin Clearance</span>
        </div>
      </div>

      {/* 2-Column Responsive Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Profile Form using Input UI Component */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-border/50 pb-4">
              <h2 className="text-base font-bold text-foreground">Admin Identity & Avatar</h2>
              <p className="text-xs text-secondary mt-0.5">
                Update the name and avatar visible on administrative actions and audit logs.
              </p>
            </div>

            {/* Avatar Section with ProfileImageUpload */}
            <ProfileImageUpload
              avatarUrl={formAvatarUrl}
              onChange={(url) => setValue("avatarUrl", url, { shouldDirty: true })}
              fullName={formFullName}
              userId={user?.id || "admin"}
              role="admin"
            />

            {/* Profile Info Form using Reusable Input Component */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Display Full Name"
                  {...register("fullName", { required: true })}
                  placeholder="e.g. Master Administrator"
                  required
                />

                <Input
                  label="Contact Phone"
                  {...register("phone")}
                  placeholder="03001234567"
                  helperText="Internal contact number for administrative alerts."
                />
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  className="bg-[#0D382B] px-7 font-bold text-sm shadow-sm"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (4 cols, Sticky): Security & Credentials */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Security & Credentials Configuration Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <Lock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Credentials & Access</h3>
            </div>

            <div className="rounded-xl bg-background p-3.5 space-y-3 text-xs border border-border/60">
              <div>
                <span className="text-muted block text-[11px] mb-0.5">Admin Email</span>
                <span className="font-semibold text-foreground break-all">
                  {process.env.NEXT_PUBLIC_ADMIN_EMAIL || user?.email || "admin@gharyahan.pk"}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  Managed via server environment variables
                </span>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-muted">Platform Role:</span>
                <span className="inline-block rounded-md bg-slate-900 text-amber-300 font-bold px-2 py-0.5 text-[10px]">
                  Master Administrator
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Session Cookie:</span>
                <span className="font-bold text-emerald-700">HTTP-Only / Secure</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Admin Quick Actions
            </h4>
            <div className="space-y-2 text-xs">
              <Link
                href="/admin"
                className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/60 hover:border-border font-medium text-foreground hover:bg-surface transition-colors"
              >
                <span>Return to Platform Admin Hub</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
              </Link>
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/60 hover:border-border font-medium text-foreground hover:bg-surface transition-colors"
              >
                <span>View Live Marketplace</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
