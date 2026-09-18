"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { User, KeyRound, ShieldCheck } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LocationInput from "../../components/ui/LocationInput";
import ProfileImageUpload from "../../components/ui/ProfileImageUpload";
import { useAuthStore } from "../../stores/useAuthStore";
import { useLocationStore } from "../../stores/useLocationStore";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";
import { toast } from "sonner";

import ProfileSkeleton from "../../components/skeletons/ProfileSkeleton";

export default function TenantProfilePage() {
  const { user, login, isLoadingAuth } = useAuthStore();
  const { setManualLocation } = useLocationStore();

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

      setManualLocation(data.area, null, data.city);

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
      toast.success("Profile preferences updated successfully!");
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

  if (isLoadingAuth) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <User className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Tenant Account Profile
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Manage your verified renter credentials, preferred rental locality, and security settings.
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
      {/* Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Primary Profile Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Personal & Contact Information</h2>
                <p className="text-xs text-secondary mt-0.5">
                  Your verified identity shared with landlords when scheduling property viewings.
                </p>
              </div>
            </div>

            {/* Profile Photo Uploader */}
            <ProfileImageUpload
              avatarUrl={p_avatarUrl}
              onChange={(url) => setProfileValue("avatarUrl", url, { shouldDirty: true })}
              fullName={p_fullName}
              userId={user?.id}
              role="tenant"
            />

            <form onSubmit={handleProfileSubmit(handleSaveProfile)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  {...registerProfile("fullName", { required: true })}
                  placeholder="e.g. Ali Raza"
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  {...registerProfile("email", { required: true })}
                  placeholder="e.g. ali@example.com"
                  required
                />

                <div>
                  <Input
                    label="Direct Mobile Phone"
                    {...registerProfile("phone", { required: true })}
                    placeholder="03001234567"
                    required
                  />
                  <label className="flex items-center gap-2 cursor-pointer mt-1.5 text-xs text-secondary hover:text-foreground transition-colors select-none">
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
                    <span>WhatsApp number is same as direct phone</span>
                  </label>
                </div>

                <div>
                  <Input
                    label="WhatsApp Number"
                    {...registerProfile("whatsappNumber", { required: true })}
                    placeholder="03001234567"
                    disabled={p_sameAsPhone}
                    helperText={p_sameAsPhone ? "Automatically synced with mobile phone." : "Landlords will contact you on this WhatsApp."}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="CNIC (National Identity Card)"
                    {...registerProfile("cnic", { required: true })}
                    placeholder="35201-1234567-1"
                    helperText="Pakistani National Identity Card number used to verify genuine rental inquiries."
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <LocationInput
                    label="Preferred City & Area / Locality"
                    placeholder="e.g. Singhpura, Lahore or Clifton, Karachi"
                    value={p_area}
                    onChange={(e) => setProfileValue("area", e.target.value)}
                    onLocationDetected={({ area: detectedArea, city: detectedCity, displayName }) => {
                      setProfileValue("area", displayName || detectedArea);
                      if (detectedCity) setProfileValue("city", detectedCity);
                    }}
                    helperText="Rental search will automatically prioritize spaces nearest to this neighborhood."
                  />
                </div>
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
        {/* Right Column (4 cols): Security */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Change Password Card */}
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
        </div>
      </div>
    </div>
  );
}
