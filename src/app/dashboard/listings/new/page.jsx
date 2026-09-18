"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { propertySchema } from "../../../../lib/validators/propertySchema";
import { usePropertiesStore } from "../../../../stores/usePropertiesStore";
import { useAuthStore } from "../../../../stores/useAuthStore";
import { LAHORE_AREAS } from "../../../../lib/location";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import LocationInput from "../../../../components/ui/LocationInput";
import {
  ArrowLeft,
  CheckCircle2,
  Tag,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Sparkles,
  Eye,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { formatPKR } from "../../../../lib/utils";

import FormSkeleton from "../../../../components/skeletons/FormSkeleton";

const readAsDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function NewListingPage() {
  const router = useRouter();
  const { addProperty } = usePropertiesStore();
  const { user, isLoadingAuth } = useAuthStore();
  const [propertyCity, setPropertyCity] = useState(user?.city || "Lahore");

  const [coverImage, setCoverImage] = useState("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80");
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      property_type: "portion",
      bedrooms: 2,
      bathrooms: 1,
      rent_price: 30000,
      has_discount: false,
      discounted_price: "",
      deposit_amount: 60000,
      area: user?.area || "",
      street_address: "",
      phone: user?.phone || "",
      status: "available",
      expected_vacancy_date: "",
      has_electricity: true,
      has_gas: true,
      has_water: true,
      is_furnished: false,
      has_drainage: true,
      has_roof_leakage: false,
      lease_duration: "1 Year",
      video_url: "",
    },
  });

  // Watched fields for Live Renter Card Preview
  const watchTitle = watch("title");
  const watchRentPrice = watch("rent_price");
  const watchHasDiscount = watch("has_discount");
  const watchDiscountedPrice = watch("discounted_price");
  const watchPropertyType = watch("property_type");
  const watchArea = watch("area");
  const watchBedrooms = watch("bedrooms");
  const watchBathrooms = watch("bathrooms");
  const watchStatus = watch("status");
  const watchElectricity = watch("has_electricity");
  const watchGas = watch("has_gas");
  const watchWater = watch("has_water");

  if (isLoadingAuth) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <FormSkeleton />
      </div>
    );
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose an image under 5MB.`);
      return;
    }

    setIsUploadingCover(true);
    setSubmissionError(null);

    try {
      const dataUrl = await readAsDataURL(file);
      setCoverImage(dataUrl);
      toast.success("Cover image added!");
    } catch (err) {
      console.error("Cover image error:", err);
      toast.error(err.message || "Failed to process cover image.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (galleryImages.length + files.length > 20) {
      toast.error("Maximum 20 property photos allowed in the gallery.");
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not a valid image format (PNG, JPG, WebP).`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose smaller photos.`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    setIsUploadingGallery(true);
    setSubmissionError(null);

    try {
      const dataUrls = await Promise.all(
        validFiles.map(file => readAsDataURL(file))
      );
      setGalleryImages((prev) => [...prev, ...dataUrls].slice(0, 20));
      toast.success(`${validFiles.length} photo(s) added to gallery!`);
    } catch (error) {
      console.error("Gallery upload error:", error);
      toast.error("Failed to process some image files: " + (error.message || "Error"));
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (uploadedVideos.length + files.length > 5) {
      toast.error("Maximum 5 uploaded videos allowed. You can also paste external video links.");
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith("video/")) {
        toast.error(`"${file.name}" is not a valid video format (MP4, WebM).`);
        return false;
      }
      if (file.size > 12 * 1024 * 1024) {
        toast.error(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Direct upload limit is 12MB. Please select a smaller video or paste a YouTube / Vimeo link in the Video URL field.`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    setIsUploadingVideo(true);
    setSubmissionError(null);

    try {
      const dataUrls = await Promise.all(validFiles.map(readAsDataURL));
      setUploadedVideos((prev) => [...prev, ...dataUrls].slice(0, 5));
      toast.success(`${validFiles.length} video(s) added!`);
    } catch (error) {
      console.error("Video upload error:", error);
      toast.error("Failed to read video files.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleRemoveVideo = (index) => {
    setUploadedVideos(uploadedVideos.filter((_, i) => i !== index));
  };

  // Calculate completeness
  let completedItems = 0;
  if (watchTitle?.trim()) completedItems++;
  if (watchRentPrice) completedItems++;
  if (watchArea?.trim()) completedItems++;
  if (coverImage) completedItems++;
  if (watchElectricity || watchGas || watchWater) completedItems++;
  const completionPercentage = Math.round((completedItems / 5) * 100);

  const onSubmit = async (data) => {
    try {
      setSubmissionError(null);

      // Validate cover image
      if (!coverImage) {
        const msg = "Cover image is required. Please select a cover photo for your property.";
        setSubmissionError(msg);
        toast.error(msg);
        return;
      }

      // Check total combined media payload size before submission
      const allMedia = [coverImage, ...galleryImages, ...uploadedVideos].filter(Boolean);
      // Rough byte calculation for base64
      const totalBytes = allMedia.reduce((acc, curr) => acc + (curr.length * 0.75), 0);
      const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

      // 20MB hard safety limit for total request payload
      if (totalBytes > 20 * 1024 * 1024) {
        const msg = `Total media payload is too large (${totalMB} MB). Maximum allowed limit is 20MB. Please remove some photos or videos before submitting.`;
        setSubmissionError(msg);
        toast.error(msg);
        return;
      }

      const resolvedCity =
        propertyCity ||
        (data.area && data.area.includes(",")
          ? data.area.split(",").pop().trim()
          : (user?.city || "Pakistan"));

      const matchedArea = LAHORE_AREAS.find(
        (a) => a.name.toLowerCase() === (data.area || "").toLowerCase()
      );

      const cityLower = resolvedCity.toLowerCase();
      const defaultLat = cityLower.includes("karachi")
        ? 24.8607
        : cityLower.includes("islamabad")
        ? 33.6844
        : cityLower.includes("rawalpindi")
        ? 33.5651
        : 31.5204;
      const defaultLng = cityLower.includes("karachi")
        ? 67.0011
        : cityLower.includes("islamabad")
        ? 73.0479
        : cityLower.includes("rawalpindi")
        ? 73.0479
        : 74.3587;

      const result = await addProperty({
        landlord_id: user?.id,
        title: data.title,
        description: data.description,
        property_type: data.property_type,
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        rent_price: Number(data.rent_price),
        has_discount: Boolean(data.has_discount),
        discounted_price: data.has_discount && data.discounted_price ? Number(data.discounted_price) : null,
        deposit_amount: data.deposit_amount ? Number(data.deposit_amount) : null,
        area: data.area,
        city: resolvedCity,
        lat: matchedArea ? matchedArea.lat : defaultLat,
        lng: matchedArea ? matchedArea.lng : defaultLng,
        street_address: data.street_address,
        has_electricity: Boolean(data.has_electricity),
        has_gas: Boolean(data.has_gas),
        has_water: Boolean(data.has_water),
        is_furnished: Boolean(data.is_furnished),
        has_drainage: Boolean(data.has_drainage),
        has_roof_leakage: Boolean(data.has_roof_leakage),
        lease_duration: data.lease_duration || "1 Year",
        video_url: [data.video_url, ...uploadedVideos].filter(Boolean).join(',') || "",
        status: data.status || "available",
        expected_vacancy_date: data.expected_vacancy_date || null,
        images: [coverImage, ...galleryImages].filter(Boolean),
        landlord: {
          id: user?.id,
          full_name: user?.full_name || "",
          phone: data.phone,
          whatsapp_number: data.phone,
          email: user?.email || "",
          role: "landlord",
          avatar_url: user?.avatar_url || "",
        },
      });

      // Strict contract: ONLY proceed if result explicitly succeeded
      if (!result || !result.success) {
        let errorMsg = result?.error || "Failed to publish listing. Please check your internet connection and try again.";
        if (errorMsg.toLowerCase().includes("payload too large") || errorMsg.includes("413")) {
          errorMsg = `Media files are too large for server payload (${totalMB}MB). Please remove some gallery photos or video files.`;
        }
        setSubmissionError(errorMsg);
        toast.error(errorMsg);
        return; // NEVER REDIRECT OR SHOW SUCCESS!
      }

      toast.success("Listing published successfully!");
      router.push("/dashboard");
    } catch (err) {
      const errorMsg = err.message || "Failed to create listing";
      setSubmissionError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl p-2 text-secondary hover:bg-background hover:text-foreground transition-colors border border-border"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
              <span>List a Rental Property</span>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Verified Publishing
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-0.5">
              Fill in detailed property information, pricing, discounts, and utilities to attract verified tenants.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-border text-xs font-semibold"
          >
            Discard
          </Button>
          <Button
            type="submit"
            form="listing-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            className="bg-[#0D382B] text-xs font-bold px-4"
          >
            Publish Listing
          </Button>
        </div>
      </div>

      {/* 2-Column Responsive Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): The Detailed Form */}
        <div className="lg:col-span-8 space-y-6">
          <form id="listing-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Top Error Alert Banner */}
            {submissionError && (
              <div className="rounded-2xl border border-rose-300 bg-rose-50/90 p-4 flex items-start gap-3 text-rose-900 shadow-sm animate-in fade-in">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-sm text-rose-950">Cannot Publish Listing</p>
                  <p className="text-rose-800 leading-relaxed font-medium">{submissionError}</p>
                </div>
              </div>
            )}
            {/* Step 1: Basic Info */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-card space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Property Overview & Pricing
                  </h2>
                </div>
                <span className="text-[11px] text-muted font-medium">Required info</span>
              </div>

              <Input
                label="Property Title"
                placeholder="e.g. 2 Bed Upper Portion with Separate Gate and Terrace"
                {...register("title")}
                error={errors.title?.message}
                helperText="Catchy, descriptive title mentioning portion, floor, or standout features."
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Property Type"
                  {...register("property_type")}
                  error={errors.property_type?.message}
                >
                  <option value="portion">Portion (Upper / Lower)</option>
                  <option value="house">Complete House</option>
                  <option value="flat">Flat / Apartment</option>
                  <option value="room">Single Room / Studio</option>
                </Select>

                <Input
                  label="Monthly Rent (PKR)"
                  type="number"
                  placeholder="e.g. 35000"
                  {...register("rent_price")}
                  error={errors.rent_price?.message}
                />

                <Input
                  label="Security Deposit (PKR)"
                  type="number"
                  placeholder="e.g. 70000"
                  {...register("deposit_amount")}
                  error={errors.deposit_amount?.message}
                />
              </div>

              {/* Discount Functionality */}
              <div className="rounded-xl border border-primary/20 bg-primary-light/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                      Optional Rental Discount
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-primary">
                    <input
                      type="checkbox"
                      className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4 cursor-pointer"
                      {...register("has_discount")}
                    />
                    <span>Enable Promotional Discount</span>
                  </label>
                </div>

                {watchHasDiscount && (
                  <div className="pt-2 border-t border-border space-y-2">
                    <Input
                      label="Discounted Monthly Rent (PKR)"
                      type="number"
                      placeholder="e.g. 30000"
                      helperText={
                        watchRentPrice
                          ? `Must be less than standard rent (PKR ${watchRentPrice})`
                          : "Provide the discounted rate"
                      }
                      {...register("discounted_price")}
                      error={errors.discounted_price?.message}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                  Description & Highlights
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe layout, independent meters, quiet family street, nearby schools, parks or markets..."
                  className="w-full rounded-xl border border-border bg-surface p-3.5 text-xs sm:text-sm text-foreground focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/20"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Step 2: Location & Street Detail */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-card space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Property Location & Address
                  </h2>
                </div>
                <span className="text-[11px] text-muted font-medium">GPS Accurate</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LocationInput
                  label="City & Area / Locality"
                  placeholder="e.g. Singhpura, Lahore or Clifton, Karachi"
                  value={watch("area")}
                  onChange={(e) => setValue("area", e.target.value, { shouldValidate: true })}
                  onLocationDetected={({ area, city, displayName }) => {
                    setValue("area", displayName || area, { shouldValidate: true });
                    if (city) setPropertyCity(city);
                  }}
                  error={errors.area?.message}
                  helperText="Type any neighborhood in Pakistan or click Auto GPS."
                />

                <Input
                  label="Street / Mohalla Address"
                  placeholder="e.g. Street 4, Near Nishat Road"
                  {...register("street_address")}
                  error={errors.street_address?.message}
                />
              </div>
            </div>

            {/* Step 3: Rooms, Condition & Utilities */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-card space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Rooms, Condition & Utilities
                  </h2>
                </div>
                <span className="text-[11px] text-muted font-medium">Detailed specs</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Input
                  label="Bedrooms"
                  type="number"
                  min={1}
                  max={10}
                  {...register("bedrooms")}
                  error={errors.bedrooms?.message}
                />
                <Input
                  label="Bathrooms"
                  type="number"
                  min={1}
                  max={10}
                  {...register("bathrooms")}
                  error={errors.bathrooms?.message}
                />
                <Select label="Lease Duration" {...register("lease_duration")}>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                  <option value="Flexible">Flexible Agreement</option>
                </Select>
              </div>

              <div className="pt-2 space-y-2.5">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">
                  Essential Utilities & Property Condition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-center gap-2 rounded-xl border border-border p-3 hover:bg-background cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4"
                      {...register("has_electricity")}
                    />
                    <span className="font-semibold text-foreground">Electricity Meter</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-border p-3 hover:bg-background cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4"
                      {...register("has_gas")}
                    />
                    <span className="font-semibold text-foreground">Sui Gas Available</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-border p-3 hover:bg-background cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4"
                      {...register("has_water")}
                    />
                    <span className="font-semibold text-foreground">Sweet Water Supply</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-border p-3 hover:bg-background cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4"
                      {...register("has_drainage")}
                    />
                    <span className="font-semibold text-foreground">Clear Drainage</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-border p-3 hover:bg-background cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                      {...register("has_roof_leakage")}
                    />
                    <span className="font-semibold text-foreground">Roof Issue / Seepage</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-border p-3 hover:bg-background cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4"
                      {...register("is_furnished")}
                    />
                    <span className="font-semibold text-foreground">Furnished Status</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Step 4: Deal Status & Vacancy Date */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-card space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Current Deal Status & Vacancy
                  </h2>
                </div>
                <span className="text-[11px] text-muted font-medium">Availability</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Initial Status" {...register("status")}>
                  <option value="available">🟢 Available Immediately</option>
                  <option value="in_deal">🟡 In Deal (Active Negotiation)</option>
                  <option value="sealed">🔒 Sealed (Rented Out)</option>
                </Select>

                <Input
                  label="Expected Vacancy Date (Optional)"
                  type="date"
                  helperText="Set if currently occupied so future tenants can reserve ahead"
                  {...register("expected_vacancy_date")}
                />
              </div>
            </div>

            {/* Step 5: Contact & Photos */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-card space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Direct Contact & Photo Gallery
                  </h2>
                </div>
                <span className="text-[11px] text-muted font-medium">Visuals & Phone</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="WhatsApp Contact Number"
                  placeholder="03001234567"
                  helperText="Tenants will contact you directly on this WhatsApp number."
                  {...register("phone")}
                  error={errors.phone?.message}
                />

                <div className="space-y-2">
                  <Input
                    label="Optional Video Tour URL (YouTube, MP4)"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register("video_url")}
                    error={errors.video_url?.message}
                  />
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center justify-between">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold cursor-pointer transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Videos</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          multiple
                          className="hidden"
                          onChange={handleVideoUpload}
                          disabled={isUploadingVideo}
                        />
                      </label>
                    </div>
                    <span className="text-[10px] text-secondary">
                      Max 5 videos. Up to 20MB each. Format: MP4, WebM
                    </span>
                  </div>
                  {uploadedVideos.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {uploadedVideos.map((vid, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs">
                          <span className="truncate text-secondary max-w-[200px]">Video {idx + 1} (Uploaded)</span>
                          <button type="button" onClick={() => handleRemoveVideo(idx)} className="text-rose-500 hover:text-rose-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Photos Management */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                {/* Cover Image */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                        Main Cover Image <span className="text-rose-500">*</span>
                      </label>
                      <span className="block text-[10px] text-secondary mt-0.5">Max 5MB. Format: JPG, PNG, WebP</span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D382B] text-white hover:bg-[#0D382B]/90 text-xs font-bold cursor-pointer transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Cover</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleCoverUpload}
                        disabled={isUploadingCover}
                      />
                    </label>
                  </div>
                  {coverImage && (
                    <div className="relative h-40 w-full sm:w-64 rounded-xl overflow-hidden border border-border group bg-background">
                      <Image src={coverImage} alt="Cover" fill sizes="300px" className="object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-[#0D382B] text-xs font-bold text-white shadow-xs">
                        Cover Image
                      </div>
                    </div>
                  )}
                </div>

                {/* Gallery Images */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                        Property Gallery ({galleryImages.length}/20)
                      </label>
                      <span className="block text-[10px] text-secondary mt-0.5">Select multiple. Max 5MB each. JPG, PNG, WebP</span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold cursor-pointer transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Add Photos</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={isUploadingGallery}
                      />
                    </label>
                  </div>

                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                      {galleryImages.map((url, index) => (
                        <div
                          key={index}
                          className="relative h-24 rounded-xl overflow-hidden border border-border group bg-background"
                        >
                          <Image src={url} alt="" fill sizes="150px" className="object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(index)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove photo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Error Alert Banner */}
            {submissionError && (
              <div className="rounded-2xl border border-rose-300 bg-rose-50/90 p-4 flex items-start gap-3 text-rose-900 shadow-sm animate-in fade-in">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-sm text-rose-950">Cannot Publish Listing</p>
                  <p className="text-rose-800 leading-relaxed font-medium">{submissionError}</p>
                </div>
              </div>
            )}

            {/* Bottom Submit bar */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="border-border text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="bg-[#0D382B] px-8 font-bold text-sm shadow-md"
              >
                Publish Rental Space
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column (4 cols): Live Renter Preview Card & Quality Score */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Live Renter Preview Card */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Live Renter Preview
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>

            {/* Mock Property Card */}
            <div className="rounded-2xl border border-border overflow-hidden bg-background shadow-sm group">
              <div className="relative h-44 w-full bg-slate-100">
                {coverImage ? (
                  <Image
                    src={coverImage}
                    alt="Property Preview"
                    fill
                    priority={true}
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-secondary text-xs">
                    No cover image
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    {watchPropertyType}
                  </span>
                  {watchStatus === "available" && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      Available
                    </span>
                  )}
                  {watchStatus === "in_deal" && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      In Deal
                    </span>
                  )}
                  {watchStatus === "sealed" && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-white text-[10px] font-bold">
                      Sealed
                    </span>
                  )}
                </div>

                {watchHasDiscount && watchDiscountedPrice && (
                  <div className="absolute bottom-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs">
                    Promo Discount
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    {watchHasDiscount && watchDiscountedPrice ? (
                      <>
                        <span className="text-lg font-black text-[#0D382B]">
                          {formatPKR(watchDiscountedPrice)}
                        </span>
                        <span className="text-xs text-muted line-through">
                          {formatPKR(watchRentPrice)}
                        </span>
                        <span className="text-[10px] text-secondary">/ mo</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-black text-[#0D382B]">
                          {formatPKR(watchRentPrice || 0)}
                        </span>
                        <span className="text-[10px] text-secondary">/ month</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground truncate mt-0.5">
                    {watchTitle || "Your Property Title Will Appear Here"}
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-xs text-secondary">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{watchArea || "Area, City"}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-secondary pt-1 border-t border-border/60">
                  <div className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5 text-muted" />
                    <span className="font-semibold">{watchBedrooms || 1} Bed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5 text-muted" />
                    <span className="font-semibold">{watchBathrooms || 1} Bath</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    {watchElectricity && <span title="Electricity">⚡</span>}
                    {watchGas && <span title="Sui Gas">🔥</span>}
                    {watchWater && <span title="Sweet Water">💧</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listing Completeness & Quality Score */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Listing Completeness
              </h3>
              <span className="text-xs font-black text-primary">{completionPercentage}%</span>
            </div>

            <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
              <div
                className="bg-[#0D382B] h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${watchTitle?.trim() ? "text-emerald-600" : "text-muted"}`}
                />
                <span className={watchTitle?.trim() ? "text-foreground font-semibold" : "text-muted"}>
                  Descriptive Title
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${watchRentPrice ? "text-emerald-600" : "text-muted"}`}
                />
                <span className={watchRentPrice ? "text-foreground font-semibold" : "text-muted"}>
                  Monthly Rent Specified
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${watchArea?.trim() ? "text-emerald-600" : "text-muted"}`}
                />
                <span className={watchArea?.trim() ? "text-foreground font-semibold" : "text-muted"}>
                  Area & Location Identified
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${[coverImage, ...galleryImages].filter(Boolean).length > 0 ? "text-emerald-600" : "text-muted"}`}
                />
                <span className={[coverImage, ...galleryImages].filter(Boolean).length > 0 ? "text-foreground font-semibold" : "text-muted"}>
                  Photos Attached ({[coverImage, ...galleryImages].filter(Boolean).length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    watchElectricity || watchGas || watchWater ? "text-emerald-600" : "text-muted"
                  }`}
                />
                <span
                  className={
                    watchElectricity || watchGas || watchWater
                      ? "text-foreground font-semibold"
                      : "text-muted"
                  }
                >
                  Essential Utilities Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick Publishing Tip */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card space-y-2">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Landlord Pro-Tip</span>
            </h4>
            <p className="text-xs text-secondary leading-relaxed">
              Listings that mention sweet water availability and dedicated electricity meters receive up to 3x more direct WhatsApp inquiries within the first 48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
