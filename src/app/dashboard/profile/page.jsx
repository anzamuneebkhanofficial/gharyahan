"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { User, Building2, ShieldCheck, Phone, KeyRound } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import LocationInput from "../../../components/ui/LocationInput";
import ProfileImageUpload from "../../../components/ui/ProfileImageUpload";
import { useAuthStore } from "../../../stores/useAuthStore";
import { createClient, isSupabaseConfigured } from "../../../lib/supabase/client";
import { toast } from "sonner";
import ProfileSkeleton from "../../../components/skeletons/ProfileSkeleton";

export default function LandlordProfilePage() {
  const { user, login, isLoadingAuth } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile Form Setup
  const profileForm = useForm({
    values: {
      fullName: user?.full_name?.trim() || "",
      email: user?.email?.trim() || "",
      phone: user?.phone?.trim() || "",
      whatsappNumber: (user?.whatsapp_number || user?.phone || "").trim(),
      sameAsPhone: !user?.whatsapp_number || user?.whatsapp_number === user?.phone,
      cnic: user?.cnic?.trim() || "",
      area: user?.area || "",
      city: user?.city || "",
      avatarUrl: user?.avatar_url || "",
    },
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    setValue: setProfileValue,
  } = profileForm;

  const p_sameAsPhone = watchProfile("sameAsPhone");
  const p_phone = watchProfile("phone");
  const p_avatarUrl = watchProfile("avatarUrl");
  const p_fullName = watchProfile("fullName");
  const p_whatsappNumber = watchProfile("whatsappNumber");
  const p_cnic = watchProfile("cnic");
  const p_area = watchProfile("area");

  // Password Form Setup
  const passwordForm = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = passwordForm;

  const newPasswordValue = watchPassword("newPassword");

  if (isLoadingAuth) {
    return <ProfileSkeleton />;
  }

  const handleSaveProfile = async (data) => {
    setIsSaving(true);
    try {
      const supabase = createClient();

      if (isSupabaseConfigured() && supabase && user?.id) {
        const payload = {
          full_name: data.fullName.trim(),
          phone: data.phone.trim(),
          whatsapp_number: (data.sameAsPhone ? data.phone : data.whatsappNumber).trim(),
          cnic: data.cnic.trim(),
          city: data.city || "Lahore",
          area: data.area || "Singhpura",
          avatar_url: data.avatarUrl.trim(),
          updated_at: new Date().toISOString(),
        };

        let { error } = await supabase
          .from("profiles")
          .update({ ...payload, email: data.email.trim() })
          .eq("id", user.id);

        if (error && (error.message?.includes("email") || error.code === "42703")) {
          const retry = await supabase
            .from("profiles")
            .update(payload)
            .eq("id", user.id);
          error = retry.error;
        }

        if (error) {
          toast.error(error.message);
          return;
        }
      }

      const updatedUser = {
        ...user,
        full_name: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        whatsapp_number: (data.sameAsPhone ? data.phone : data.whatsappNumber).trim(),
        cnic: data.cnic.trim(),
        city: data.city || "Lahore",
        area: data.area || "Singhpura",
        avatar_url: data.avatarUrl.trim(),
      };
      login(updatedUser);
      toast.success("Landlord profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (data) => {
    setIsChangingPassword(true);
    try {
      const supabase = createClient();

      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.updateUser({ password: data.newPassword });
        if (error) {
          toast.error(error.message);
          return;
        }
      }

      toast.success("Password changed successfully!");
      resetPasswordForm();
    } catch (err) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Landlord Account Profile
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Manage your verified landlord contact details, profile picture, and account credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.email_confirmed_at ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Identity Verified</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              <span>Verification Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Responsive Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Primary Profile Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Personal & Contact Information</h2>
                <p className="text-xs text-secondary mt-0.5">
                  Update the information visible to prospective tenants searching for rental properties.
                </p>
              </div>
            </div>

            {/* Profile Photo Uploader Component */}
            <ProfileImageUpload
              avatarUrl={p_avatarUrl}
              onChange={(url) => setProfileValue("avatarUrl", url, { shouldDirty: true })}
              fullName={p_fullName}
              userId={user?.id}
              role="landlord"
            />

            {/* Profile Info Form */}
            <form onSubmit={handleProfileSubmit(handleSaveProfile)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  {...registerProfile("fullName", { required: true })}
                  placeholder="e.g. Chaudhry Tariq Mehmood"
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  {...registerProfile("email", { required: true })}
                  placeholder="e.g. name@example.com"
                  required
                />

                <div>
                  <Input
                    label="Direct Mobile Phone"
                    {...registerProfile("phone", { required: true })}
                    placeholder="03001234567"
                    required
                  />
                  <label className="flex items-center gap-2 cursor-pointer mt-1.5 text-xs text-muted hover:text-foreground transition-colors select-none">
                    <input
                      type="checkbox"
                      {...registerProfile("sameAsPhone")}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setProfileValue("sameAsPhone", checked);
                        if (checked) {
                          setProfileValue("whatsappNumber", p_phone);
                        }
                      }}
                      className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>WhatsApp number is same as direct mobile phone</span>
                  </label>
                </div>

                <div>
                  <Input
                    label="WhatsApp Number"
                    {...registerProfile("whatsappNumber", { required: true })}
                    placeholder="03001234567"
                    disabled={p_sameAsPhone}
                    helperText={p_sameAsPhone ? "Automatically synced with mobile phone." : "Tenants will contact you on this WhatsApp."}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="CNIC (National Identity Card)"
                    {...registerProfile("cnic", { required: true })}
                    placeholder="35201-1234567-1"
                    helperText="13-digit Pakistani National Identity Card number (e.g. 35201-1234567-1)."
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <LocationInput
                    label="Primary City & Area / Locality"
                    placeholder="e.g. Gulshan, Karachi or Singhpura, Lahore"
                    value={p_area}
                    onChange={(e) => setProfileValue("area", e.target.value)}
                    onLocationDetected={({ area: detectedArea, city: detectedCity, displayName }) => {
                      setProfileValue("area", displayName || detectedArea);
                      if (detectedCity) setProfileValue("city", detectedCity);
                    }}
                    helperText="Default location for your rental listings and tenant searches."
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-muted text-center sm:text-left">
                  Changes apply immediately across your public listings.
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  className="bg-[#0D382B] px-7 font-bold shadow-xs cursor-pointer w-full sm:w-auto"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (4 cols): Companion Cards (Public Preview + Security + Trust) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Public Identity Preview Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Public Identity Preview
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                Live View
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-background border-2 border-border shadow-xs shrink-0 flex items-center justify-center">
                {p_avatarUrl ? (
                  <img src={p_avatarUrl} alt="Landlord avatar" width="96" height="96" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-extrabold text-2xl text-foreground bg-primary/10 select-none">
                    {p_fullName?.trim()?.[0]?.toUpperCase() || "L"}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate">
                  {p_fullName?.trim() || "Landlord Name"}
                </h3>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Landlord</span>
                </div>
                <p className="text-xs text-muted truncate mt-0.5">
                  {p_area || "Primary Locality not set"}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-background p-3.5 space-y-2 text-xs border border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-muted">Direct Phone:</span>
                <span className="font-semibold text-foreground">{p_phone || "Not specified"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">WhatsApp:</span>
                <span className="font-semibold text-primary">
                  {p_sameAsPhone ? p_phone || "Synced" : p_whatsappNumber || "Not specified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">CNIC on file:</span>
                <span className="font-semibold text-foreground">
                  {p_cnic ? `${p_cnic.slice(0, 5)}...` : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Password Card (Moved to side column for fast access) */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <KeyRound className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit(handleChangePassword)} className="space-y-3.5">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                {...registerPassword("newPassword", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
                error={passwordErrors.newPassword?.message}
                helperText="Minimum 6 characters"
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                {...registerPassword("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (val) => val === newPasswordValue || "Passwords do not match",
                })}
                error={passwordErrors.confirmPassword?.message}
              />

              <Button
                type="submit"
                variant="outline"
                size="sm"
                isLoading={isChangingPassword}
                className="w-full border-border font-bold text-xs cursor-pointer hover:bg-background"
              >
                Update Password
              </Button>
            </form>
          </div>

          {/* Trust Verification Checklist Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Account Trust Checklist
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${user?.email_confirmed_at ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium text-foreground">Email Confirmation</span>
                <span className="ml-auto text-[11px] text-emerald-600 font-bold">
                  {user?.email_confirmed_at ? "Active" : "Pending"}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${p_phone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium text-foreground">Direct Phone Connected</span>
                <span className="ml-auto text-[11px] text-emerald-600 font-bold">{p_phone ? "Active" : "Add"}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${p_cnic ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium text-foreground">CNIC Document Verified</span>
                <span className="ml-auto text-[11px] text-emerald-600 font-bold">{p_cnic ? "Active" : "Add"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
