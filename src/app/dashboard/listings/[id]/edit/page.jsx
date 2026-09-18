"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { propertySchema } from "../../../../../lib/validators/propertySchema";
import { usePropertiesStore } from "../../../../../stores/usePropertiesStore";
import { useAuthStore } from "../../../../../stores/useAuthStore";
import { LAHORE_AREAS } from "../../../../../lib/location";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import LocationInput from "../../../../../components/ui/LocationInput";
import {
  ArrowLeft,
  Tag,
  Plus,
  Trash2,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import FormSkeleton from "../../../../../components/skeletons/FormSkeleton";

const readAsDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { getPropertyById, updateProperty, isLoading } = usePropertiesStore();
  const { user } = useAuthStore();

  const property = getPropertyById(params.id);
  const currentUserId = user?.id;
  const isAdmin = user?.role === "admin";

  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [propertyCity, setPropertyCity] = useState("Lahore");
  const [submissionError, setSubmissionError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(propertySchema),
  });

  useEffect(() => {
    if (property) {
      if (property.city) setPropertyCity(property.city);
      reset({
        title: property.title || "",
        description: property.description || "",
        property_type: property.property_type || "portion",
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        rent_price: property.rent_price || 0,
        has_discount: Boolean(property.has_discount),
        discounted_price: property.discounted_price || "",
        deposit_amount: property.deposit_amount || "",
        area: property.area || "Singhpura",
        street_address: property.street_address || "",
        phone: property.landlord?.whatsapp_number || property.landlord?.phone || user?.phone || "03001234567",
        status: property.status || "available",
        expected_vacancy_date: property.expected_vacancy_date || "",
        has_electricity: Boolean(property.has_electricity),
        has_gas: Boolean(property.has_gas),
        has_water: Boolean(property.has_water),
        is_furnished: Boolean(property.is_furnished),
        has_drainage: property.has_drainage !== undefined ? Boolean(property.has_drainage) : true,
        has_roof_leakage: Boolean(property.has_roof_leakage),
        lease_duration: property.lease_duration || "1 Year",
        lease_duration: property.lease_duration || "1 Year",
        video_url: (property.video_url || "").split(',').filter(Boolean).filter(v => !v.startsWith('data:')).join(','),
      });
      
      if (property.images && property.images.length > 0) {
        setCoverImage(property.images[0]);
        setGalleryImages(property.images.slice(1));
      } else {
        setCoverImage("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80");
        setGalleryImages([]);
      }
      
      const b64Vids = (property.video_url || "").split(',').filter(Boolean).filter(v => v.startsWith('data:'));
      setUploadedVideos(b64Vids);
    }
  }, [property, reset, user]);

  const isDiscountEnabled = watch("has_discount");
  const rentPriceValue = watch("rent_price");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <FormSkeleton />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          The requested rental property could not be found or has been removed.
        </p>
        <Button href="/dashboard" variant="primary" size="sm" className="mt-4 bg-[#0D382B]">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Strict Authorization & Data Isolation Check
  const isOwner = property.landlord?.id === currentUserId || (user?.email && property.landlord?.email === user.email);
  if (!isOwner && !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Unauthorized Property Edit</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have permission to edit this property because it belongs to another landlord.
        </p>
        <Button href="/dashboard" variant="primary" size="sm" className="bg-[#0D382B]">
          Back to My Listings
        </Button>
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
      toast.success("Cover image updated!");
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

  const onSubmit = async (data) => {
    try {
      setSubmissionError(null);

      // Check total combined media payload size before submission
      const allMedia = [coverImage, ...galleryImages, ...uploadedVideos].filter(Boolean);
      // Rough byte calculation for base64
      const totalBytes = allMedia.reduce((acc, curr) => acc + (curr.length * 0.75), 0);
      const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

      // 20MB hard safety limit for total request payload
      if (totalBytes > 20 * 1024 * 1024) {
        const msg = `Total media payload is too large (${totalMB} MB). Maximum allowed limit is 20MB. Please remove some photos or videos before saving.`;
        setSubmissionError(msg);
        toast.error(msg);
        return;
      }

      const resolvedCity =
        propertyCity ||
        (data.area && data.area.includes(",")
          ? data.area.split(",").pop().trim()
          : (property?.city || "Pakistan"));

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
        ? 73.0169
        : 74.3587;

      const updates = {
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
        street_address: data.street_address,
        has_electricity: Boolean(data.has_electricity),
        has_gas: Boolean(data.has_gas),
        has_water: Boolean(data.has_water),
        is_furnished: Boolean(data.is_furnished),
        has_drainage: Boolean(data.has_drainage),
        has_roof_leakage: Boolean(data.has_roof_leakage),
        lease_duration: data.lease_duration || "1 Year",
        video_url: [data.video_url, ...uploadedVideos].filter(Boolean).join(',') || "",
        status: data.status,
        expected_vacancy_date: data.expected_vacancy_date || null,
        lat: matchedArea ? matchedArea.lat : defaultLat,
        lng: matchedArea ? matchedArea.lng : defaultLng,
        images: [coverImage, ...galleryImages].filter(Boolean),
        landlord: {
          ...property.landlord,
          phone: data.phone,
          whatsapp_number: data.phone,
        },
      };

      const result = await updateProperty(property.id, updates, currentUserId, isAdmin);

      // Strict contract: ONLY proceed if result explicitly succeeded
      if (!result || !result.success) {
        let errorMsg = result?.error || "Failed to update listing. Please verify your data and try again.";
        if (errorMsg.toLowerCase().includes("payload too large") || errorMsg.includes("413")) {
          errorMsg = `Media files are too large for server payload (${totalMB}MB). Please remove some gallery photos or video files.`;
        }
        setSubmissionError(errorMsg);
        toast.error(errorMsg);
        return; // NEVER REDIRECT OR SHOW SUCCESS!
      }

      toast.success("Listing updated successfully!");
      router.push("/dashboard");
    } catch (err) {
      const errorMsg = err.message || "Failed to update listing.";
      setSubmissionError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Edit Property Listing
          </h1>
          <p className="text-xs text-slate-500">
            Update rental terms, price discounts, condition info, and media for your space.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Top Error Alert Banner */}
        {submissionError && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50/90 p-4 flex items-start gap-3 text-rose-900 shadow-sm animate-in fade-in">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-sm text-rose-950">Cannot Save Listing</p>
              <p className="text-rose-800 leading-relaxed font-medium">{submissionError}</p>
            </div>
          </div>
        )}

        {/* Step 1: Basic Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Property Details & Pricing
          </h2>

          <Input
            label="Property Title"
            {...register("title")}
            error={errors.title?.message}
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
              {...register("rent_price")}
              error={errors.rent_price?.message}
            />

            <Input
              label="Security Deposit (PKR)"
              type="number"
              {...register("deposit_amount")}
              error={errors.deposit_amount?.message}
            />
          </div>

          {/* Discount Section */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-800" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Optional Rental Discount
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-900">
                <input
                  type="checkbox"
                  className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4 cursor-pointer"
                  {...register("has_discount")}
                />
                <span>Enable Promotional Discount</span>
              </label>
            </div>

            {isDiscountEnabled && (
              <div className="pt-2 border-t border-emerald-100 space-y-2">
                <Input
                  label="Discounted Monthly Rent (PKR)"
                  type="number"
                  helperText={
                    rentPriceValue
                      ? `Must be less than standard rent (PKR ${rentPriceValue})`
                      : "Provide the discounted rate"
                  }
                  {...register("discounted_price")}
                  error={errors.discounted_price?.message}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Highlights
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-[#0D382B] focus:outline-none focus:ring-2 focus:ring-[#0D382B]/20"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 font-medium mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Step 2: Location */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Property Location & Address
          </h2>

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
              helperText="Type any neighborhood in Pakistan or use Auto GPS."
            />

            <Input
              label="Street / Mohalla Address"
              placeholder="e.g. Street 4, Near Nishat Road"
              {...register("street_address")}
              error={errors.street_address?.message}
            />
          </div>
        </div>

        {/* Step 3: Condition & Utilities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Rooms, Condition & Utilities
          </h2>

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

          <div className="pt-2 space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Essential Utilities & Property Condition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4"
                  {...register("has_electricity")}
                />
                <span className="font-semibold text-slate-800">Electricity Meter</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4"
                  {...register("has_gas")}
                />
                <span className="font-semibold text-slate-800">Sui Gas Available</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4"
                  {...register("has_water")}
                />
                <span className="font-semibold text-slate-800">Sweet Water Supply</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4"
                  {...register("has_drainage")}
                />
                <span className="font-semibold text-slate-800">Clear Sewage & Drainage</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                  {...register("has_roof_leakage")}
                />
                <span className="font-semibold text-slate-800">Roof Seepage / Issue</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-[#0D382B] focus:ring-[#0D382B] h-4 w-4"
                  {...register("is_furnished")}
                />
                <span className="font-semibold text-slate-800">Furnished Status</span>
              </label>
            </div>
          </div>
        </div>

        {/* Step 4: Status & Vacancy Date */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            4. Deal Status & Vacancy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Listing Status" {...register("status")}>
              <option value="available">🟢 Available</option>
              <option value="in_deal">🟡 In Deal (Active Negotiation)</option>
              <option value="sealed">🔒 Sealed (Rented Out)</option>
            </Select>

            <Input
              label="Expected Vacancy Date"
              type="date"
              {...register("expected_vacancy_date")}
            />
          </div>
        </div>

        {/* Step 5: Contact & Media */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            5. Contact Information & Media
          </h2>

          <Input
            label="WhatsApp Contact Number"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="WhatsApp Contact Number"
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
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold cursor-pointer transition-colors">
                    <Plus className="h-3.5 w-3.5" />
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
                <span className="text-[10px] text-slate-500">
                  Max 5 videos. Up to 20MB each. Format: MP4, WebM
                </span>
              </div>
              {uploadedVideos.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {uploadedVideos.map((vid, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <span className="truncate text-slate-600 max-w-[200px]">Video {idx + 1} (Uploaded)</span>
                      <button type="button" onClick={() => handleRemoveVideo(idx)} className="text-rose-500 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* Cover Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Main Cover Image <span className="text-rose-500">*</span>
                  </label>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Max 5MB. Format: JPG, PNG, WebP</span>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D382B] text-white hover:bg-[#0D382B]/90 text-xs font-bold cursor-pointer transition-colors">
                  <Plus className="h-3.5 w-3.5" />
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
                <div className="relative h-40 w-full sm:w-64 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                  <Image src={coverImage} alt="Cover" fill priority={true} sizes="300px" className="object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-[#0D382B] text-xs font-bold text-white shadow-xs">
                    Cover Image
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Property Gallery ({galleryImages.length}/20)
                  </label>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Select multiple. Max 5MB each. JPG, PNG, WebP</span>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold cursor-pointer transition-colors">
                  <Plus className="h-3.5 w-3.5" />
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
                <div className="flex flex-wrap gap-2 pt-2">
                  {galleryImages.map((url, index) => (
                    <div
                      key={index}
                      className="relative h-20 w-32 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
                    >
                      <Image src={url} alt="" fill sizes="128px" className="object-cover" />
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
              <p className="font-bold text-sm text-rose-950">Cannot Save Listing</p>
              <p className="text-rose-800 leading-relaxed font-medium">{submissionError}</p>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="bg-[#0D382B] px-8 font-bold"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
