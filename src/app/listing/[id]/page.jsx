"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Zap,
  Flame,
  Droplets,
  Calendar,
  ShieldCheck,
  Phone,
  AlertCircle,
  Sofa,
  FileText,
  Tag,
  Video,
  Play,
  Waves,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import StatusBadge from "../../../components/listings/StatusBadge";
import WhatsAppButton from "../../../components/listings/WhatsAppButton";
import Badge from "../../../components/ui/Badge";
import PropertyCard from "../../../components/listings/PropertyCard";
import { usePropertiesStore } from "../../../stores/usePropertiesStore";
import { useFavoritesStore } from "../../../stores/useFavoritesStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { formatPKR, formatDate, getDaysUntilVacancy } from "../../../lib/utils";
import { toast } from "sonner";
import ListingSkeleton from "../../../components/skeletons/ListingSkeleton";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Modal from "../../../components/ui/Modal";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { fetchSingleProperty, fetchRelatedProperties } = usePropertiesStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { isAuthenticated, user } = useAuthStore();

  const [property, setProperty] = useState(null);
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setIsFetching(true);

    const loadData = async () => {
      const prop = await fetchSingleProperty(id);
      if (!isMounted) return;

      if (prop) {
        setProperty(prop);
        if (prop.area) {
          const related = await fetchRelatedProperties(prop.area, prop.id, 3);
          if (isMounted) {
            setRelatedProperties(related || []);
          }
        }
      }
      setIsFetching(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, fetchSingleProperty, fetchRelatedProperties]);

  if (isFetching) {
    return <ListingSkeleton />;
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Property Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          This rental space may have been removed or the link is invalid.
        </p>
        <Button href="/search" variant="primary" className="mt-6 bg-[#0D382B]">
          Browse Available Rentals
        </Button>
      </div>
    );
  }

  const favorite = isFavorite(property.id);
  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80"];

  const daysLeft = property.expected_vacancy_date
    ? getDaysUntilVacancy(property.expected_vacancy_date)
    : null;

  const isDiscountActive =
    property.has_discount &&
    property.discounted_price &&
    property.discounted_price < property.rent_price;
  const discountSavings = isDiscountActive ? property.rent_price - property.discounted_price : 0;
  const effectiveRent = isDiscountActive ? property.discounted_price : property.rent_price;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: property.title,
          text: `Check out this rental property in ${property.area}, Lahore on GharYahan!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
  };

  // The database stores videos as a comma-separated string, but base64 strings also contain commas.
  // We split by ',http' or ',data:' to safely extract individual video strings.
  const getVideosList = (str) => {
    if (!str) return [];
    // A trick to split safely: replace joining commas with a unique delimiter
    const normalized = str.replace(/,(data:|https?:)/g, '|||$1');
    return normalized.split('|||').filter(Boolean);
  };

  const allVideos = getVideosList(property?.video_url);
  const primaryVideo = allVideos.length > 0 ? allVideos[0] : null;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(primaryVideo);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Search</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Share property"
          >
            <Share2 className="h-4 w-4" />
          </button>
          {/* Heart / favorite (hidden for admin) */}
          {(!isAuthenticated || user?.role !== "admin") && (
            <button
              onClick={() => {
                if (!isAuthenticated || !user) {
                  router.push("/login?redirect=" + encodeURIComponent(`/listing/${property.id}`));
                  return;
                }
                toggleFavorite(property.id, user.id);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              title={favorite ? "Saved" : "Save"}
            >
              <Heart
                className={`h-4 w-4 ${
                  favorite ? "fill-rose-600 text-rose-600" : "text-slate-700"
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Gallery Section — themed Swiper, no dots, proper spacing */}
      <style>{`
        .listing-swiper .swiper-button-prev,
        .listing-swiper .swiper-button-next {
          width: auto;
          height: auto;
          background: transparent;
          box-shadow: none;
          color: white;
          margin: 0 8px;
          opacity: 0.85;
          transition: all 0.2s ease;
        }
        .listing-swiper .swiper-button-prev:hover,
        .listing-swiper .swiper-button-next:hover {
          background: transparent;
          color: white;
          opacity: 1;
          transform: scale(1.15);
        }
        .listing-swiper .swiper-button-prev::after,
        .listing-swiper .swiper-button-next::after {
          font-size: 26px;
          font-weight: bold;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
        .listing-swiper .swiper-button-disabled {
          opacity: 0 !important;
        }
      `}</style>
      <div className="rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 relative">
        <Swiper
          modules={[Navigation]}
          navigation
          grabCursor
          className="listing-swiper w-full aspect-[16/9] lg:aspect-[21/9]"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx} className="relative h-full w-full">
              <Image
                src={img}
                alt={`${property.title} - Image ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="(max-width: 1400px) 100vw, 1400px"
                className="object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="pointer-events-auto">
            <StatusBadge
              status={property.status}
              expectedVacancyDate={property.expected_vacancy_date}
            />
          </div>
          <Badge variant="default" size="sm" className="bg-white/95 backdrop-blur-sm capitalize font-semibold shadow-xs pointer-events-auto w-fit">
            {property.property_type}
          </Badge>
          {isDiscountActive && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/95 text-white px-2.5 py-1 text-xs font-black uppercase tracking-wider shadow-sm pointer-events-auto w-fit">
              <Tag className="h-3 w-3" />
              Special Discount: Save {formatPKR(discountSavings)}
            </span>
          )}
          {images.length > 1 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/50 text-white px-2.5 py-1 text-xs font-semibold backdrop-blur-sm pointer-events-auto w-fit">
              1 / {images.length} photos
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Landlord Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Info & Pricing */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <MapPin className="h-4 w-4" />
              <span>{property.street_address}, {property.area}, {property.city}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              {property.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-4 border-b border-slate-200 pb-4">
              {isDiscountActive ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-emerald-950">
                      {formatPKR(property.discounted_price)}
                    </span>
                    <span className="text-base line-through text-slate-400 font-medium">
                      {formatPKR(property.rent_price)}
                    </span>
                    <span className="text-sm font-normal text-slate-500"> / month</span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Tag className="h-3 w-3" />
                    <span>Promotional Discount: You save {formatPKR(discountSavings)} per month</span>
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-extrabold text-slate-900">
                  {formatPKR(property.rent_price)}
                  <span className="text-sm font-normal text-slate-500"> / month</span>
                </div>
              )}

              {property.deposit_amount && (
                <div className="text-xs text-slate-500 font-medium ml-auto">
                  Security Deposit:{" "}
                  <span className="text-slate-800 font-bold">
                    {formatPKR(property.deposit_amount)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Expected Vacancy Banner */}
          {property.expected_vacancy_date && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 flex items-start gap-3">
              <Calendar className="h-5 w-5 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-indigo-950">
                  Expected Vacancy: {formatDate(property.expected_vacancy_date)}
                </h4>
                <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                  This property is currently occupied, but the tenant is vacating soon{" "}
                  {daysLeft && daysLeft > 0 ? `(in ~${daysLeft} days)` : ""}.
                  You can contact the landlord now to lock the deal in advance and avoid last-minute moving hassles.
                </p>
              </div>
            </div>
          )}

          {/* Deal status notice if in_deal */}
          {property.status === "in_deal" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Currently Under Negotiation (In Deal)
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Another tenant is actively discussing terms with the landlord. You may still message
                  the landlord to be next in line if the deal falls through.
                </p>
              </div>
            </div>
          )}

          {/* Key Specs Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
              <Bed className="h-5 w-5 text-slate-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-slate-900">{property.bedrooms} Bedrooms</div>
              <div className="text-[11px] text-slate-500">Living space</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
              <Bath className="h-5 w-5 text-slate-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-slate-900">{property.bathrooms} Bathrooms</div>
              <div className="text-[11px] text-slate-500">Fitted bath</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
              <Sofa className="h-5 w-5 text-slate-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-slate-900">
                {property.is_furnished ? "Furnished" : "Unfurnished"}
              </div>
              <div className="text-[11px] text-slate-500">Furniture status</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
              <MapPin className="h-5 w-5 text-emerald-700 mx-auto mb-1" />
              <div className="text-sm font-bold text-slate-900 truncate">{property.area}</div>
              <div className="text-[11px] text-slate-500">Lahore locality</div>
            </div>
          </div>

          {/* Utilities & Property Condition */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Utilities & Property Condition
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-lg ${
                    property.has_electricity
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Electricity</span>
                  <p className="text-slate-500 text-[11px]">
                    {property.has_electricity ? "Dedicated electric meter" : "Shared meter"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-lg ${
                    property.has_gas
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Sui Gas Connection</span>
                  <p className="text-slate-500 text-[11px]">
                    {property.has_gas ? "Operational Sui Gas connection" : "LPG cylinder required"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-lg ${
                    property.has_water
                      ? "bg-sky-100 text-sky-800"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Sweet Water Supply</span>
                  <p className="text-slate-500 text-[11px]">
                    {property.has_water ? "Boring & water motor installed" : "Check with owner"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-lg ${
                    property.has_drainage !== false
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  <Waves className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Sewage & Drainage</span>
                  <p className="text-slate-500 text-[11px]">
                    {property.has_drainage !== false ? "Clear working street drainage" : "Needs inspection"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-lg ${
                    !property.has_roof_leakage
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <Home className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Roof Condition</span>
                  <p className="text-slate-500 text-[11px]">
                    {!property.has_roof_leakage ? "Sound roof, no water seepage" : "Water seepage reported"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Neighborhood Safety</span>
                  <p className="text-slate-500 text-[11px]">Family residential neighborhood</p>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Video Tour Section */}
          {primaryVideo && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-[#0D382B]" />
                  <h3 className="text-sm font-bold text-slate-900">Video Walkthrough</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">{allVideos.length} video{allVideos.length > 1 ? 's' : ''}</span>
              </div>

              {youtubeEmbedUrl ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-sm">
                  <iframe
                    src={youtubeEmbedUrl}
                    title="Property Walkthrough Video"
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {allVideos.map((vid, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setActiveVideoIndex(idx); setIsVideoModalOpen(true); }}
                      className="w-full flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#0D382B]/5 hover:border-[#0D382B]/30 transition-all p-3.5 group text-left"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0D382B] text-white shadow-sm group-hover:scale-105 transition-transform">
                        <Play className="h-4 w-4 fill-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-800">Video Tour {idx + 1}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Tap to play full walkthrough</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#0D382B] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Description & Street Details
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Tenancy Terms & Lock-in Notice */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0D382B]" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Tenancy Terms & Lock-in Agreement
              </h3>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1.5">
              <p>
                <strong>Lease Duration:</strong> {property.lease_duration || "1 Year"} standard tenancy agreement.
              </p>
              <p>
                <strong>Notice Period:</strong> Landlord & Tenant agree to give at least 30–60 days prior notice before vacating.
              </p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                * GharYahan records these terms to reduce eviction disputes and protect both parties.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Landlord Action Card */}
        <div className="space-y-6">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Monthly Rent
              </div>
              {isDiscountActive ? (
                <div className="mt-0.5 space-y-1">
                  <div className="text-3xl font-black text-emerald-950">
                    {formatPKR(property.discounted_price)}
                    <span className="text-xs font-normal text-slate-500"> / mo</span>
                  </div>
                  <div className="text-xs text-slate-400 line-through">
                    Standard Rent: {formatPKR(property.rent_price)}
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                  {formatPKR(property.rent_price)}
                  <span className="text-xs font-normal text-slate-500"> / month</span>
                </div>
              )}
            </div>

            {/* Landlord profile */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                <Image
                  src={
                    property.landlord?.avatar_url ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                  }
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {property.landlord?.full_name || "Property Owner"}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Direct Landlord · Verified</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <WhatsAppButton
              phone={property.landlord?.whatsapp_number || property.landlord?.phone || "03001234567"}
              title={property.title}
              rentPrice={effectiveRent}
              area={property.area}
              size="lg"
              className="w-full justify-center text-sm font-bold"
              disabled={property.status === "sealed"}
              label={
                property.status === "sealed"
                  ? "Property Sealed (Rented)"
                  : "Contact on WhatsApp"
              }
            />

            {/* Phone button */}
            <Button
              href={`tel:${property.landlord?.phone || "03001234567"}`}
              variant="outline"
              size="md"
              className="w-full justify-center gap-2 border-slate-300 font-bold"
            >
              <Phone className="h-4 w-4 text-slate-600" />
              <span>Call Landlord Directly</span>
            </Button>

            <div className="text-center text-[11px] text-slate-400">
              No middleman commission · No hidden booking charges
            </div>
          </div>
        </div>
      </div>

      {/* Similar Rentals in Area */}
      {relatedProperties.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Similar Rentals in {property.area}
              </h2>
              <p className="text-xs text-slate-500">
                Other curated rental spaces available nearby in this locality
              </p>
            </div>
            <Button href="/search" variant="outline" size="sm" className="text-xs">
              View all listings
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProperties.map((relProp) => (
              <PropertyCard key={relProp.id} property={relProp} />
            ))}
          </div>
        </div>
      )}

      {/* Video Modal — native HTML5 video handles Base64 perfectly */}
      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => { setIsVideoModalOpen(false); }}
        title={`Video Tour ${allVideos.length > 1 ? `${activeVideoIndex + 1} of ${allVideos.length}` : ''}`}
        maxWidth="max-w-4xl"
      >
        {isVideoModalOpen && allVideos[activeVideoIndex] && (
          <div className="bg-black rounded-xl overflow-hidden">
            <video
              key={activeVideoIndex}
              src={allVideos[activeVideoIndex]}
              controls
              autoPlay
              className="w-full max-h-[70vh] outline-none"
              playsInline
            />
          </div>
        )}
        {allVideos.length > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setActiveVideoIndex(i => Math.max(0, i - 1))}
              disabled={activeVideoIndex === 0}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#0D382B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-xs text-slate-400">{activeVideoIndex + 1} / {allVideos.length}</span>
            <button
              onClick={() => setActiveVideoIndex(i => Math.min(allVideos.length - 1, i + 1))}
              disabled={activeVideoIndex === allVideos.length - 1}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#0D382B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
