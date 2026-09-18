"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Trash2, Link as LinkIcon, Loader2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";
import { toast } from "sonner";

export default function ProfileImageUpload({
  avatarUrl,
  onChange,
  fullName = "",
  userId = "",
  role = "landlord",
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState(avatarUrl || "");
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef(null);

  const fallbackLetter = fullName?.trim()?.[0]?.toUpperCase() || (role === "landlord" ? "L" : "T");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected if needed
    e.target.value = "";

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB.");
      return;
    }

    setIsUploading(true);
    setImgError(false);

    try {
      let uploadedUrl = "";
      const supabase = createClient();

      // Try uploading to Supabase Storage 'avatars' bucket
      if (isSupabaseConfigured() && supabase) {
        try {
          const fileExt = file.name.split(".").pop() || "jpg";
          const fileName = `${userId || "user"}-${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicData } = supabase.storage
              .from("avatars")
              .getPublicUrl(filePath);

            if (publicData?.publicUrl) {
              uploadedUrl = publicData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn("Supabase storage upload attempt failed, falling back to Data URL:", storageErr);
        }
      }

      // If storage upload didn't produce a URL, read as high-quality base64 Data URL
      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      }

      onChange(uploadedUrl);
      setUrlDraft(uploadedUrl);
      toast.success("Profile photo uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to process image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setUrlDraft("");
    setImgError(false);
    toast.success("Profile photo removed.");
  };

  const handleApplyUrl = () => {
    const trimmed = urlDraft.trim();
    setImgError(false);
    onChange(trimmed);
    toast.success("Profile photo URL applied.");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-border/50 pb-6">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar Display Container */}
      <div className="relative group shrink-0">
        <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-background border-2 border-border shadow-sm flex items-center justify-center">
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt="Profile avatar"
              width="96"
              height="96"
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-extrabold text-2xl text-foreground bg-primary/10 select-none">
              {fallbackLetter}
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs gap-1 backdrop-blur-xs">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-semibold">Uploading...</span>
            </div>
          )}
        </div>

        {/* Quick upload overlay trigger on avatar click */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Upload profile photo"
          className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-primary text-white shadow-md hover:bg-primary-hover hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      {/* Controls & Description */}
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <div>
          <h3 className="text-sm font-bold text-foreground">Profile Photo</h3>
          <p className="text-xs text-secondary mt-0.5">
            Upload your professional photo. Visible to prospective tenants and platform administrators.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                <span>Upload New Photo</span>
              </>
            )}
          </button>

          {avatarUrl && (
            <button
              type="button"
              disabled={isUploading}
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground font-medium px-2 py-1 transition-colors cursor-pointer"
          >
            <LinkIcon className="h-3 w-3" />
            <span>{showUrlInput ? "Hide URL Option" : "Enter Image Link"}</span>
          </button>
        </div>

        {/* Optional Image URL Input Drawer */}
        {showUrlInput && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="Paste public image link (https://...)"
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground flex-1 max-w-sm focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-bold text-foreground hover:bg-background transition-colors cursor-pointer"
            >
              Apply Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
