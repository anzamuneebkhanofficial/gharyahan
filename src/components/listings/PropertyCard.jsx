"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Bed, Bath, Zap, Flame, Droplets, Tag } from "lucide-react";
import StatusBadge from "./StatusBadge";
import WhatsAppButton from "./WhatsAppButton";
import Badge from "../ui/Badge";
import { formatPKR } from "../../lib/utils";
import { calculateDistanceKm } from "../../lib/location";
import { useLocationStore } from "../../stores/useLocationStore";
import { useFavoritesStore } from "../../stores/useFavoritesStore";
import { useAuthStore } from "../../stores/useAuthStore";

export default function PropertyCard({ property, priority = false }) {
  const { userCoords } = useLocationStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const favorite = isFavorite(property.id);

  const distanceKm =
    userCoords && property.lat && property.lng
      ? calculateDistanceKm(userCoords.lat, userCoords.lng, property.lat, property.lng)
      : null;

  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0]
      : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80";

  const isDiscountActive =
    property.has_discount && property.discounted_price && property.discounted_price < property.rent_price;
  const discountSavings = isDiscountActive ? property.rent_price - property.discounted_price : 0;

  const displayPrice = isDiscountActive ? property.discounted_price : property.rent_price;

  return (
    <article className="group relative flex flex-col rounded-2xl bg-surface border border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">

      {/* ── Image ──────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] w-full bg-background overflow-hidden">
        <Link href={`/listing/${property.id}`} className="block absolute inset-0">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          <StatusBadge status={property.status} expectedVacancyDate={property.expected_vacancy_date} />
          <Badge
            variant="default"
            size="sm"
            className="bg-surface/90 backdrop-blur-sm shadow-sm capitalize font-semibold text-secondary border-transparent"
          >
            {property.property_type}
          </Badge>
          {isDiscountActive && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide shadow-sm">
              <Tag className="h-2.5 w-2.5" aria-hidden="true" />
              Save {formatPKR(discountSavings)}
            </span>
          )}
        </div>

        {/* Heart / favorite (hidden for admin) */}
        {(!isAuthenticated || user?.role !== "admin") && (
          <button
            onClick={(e) => { 
              e.preventDefault(); 
              if (!isAuthenticated || !user) {
                router.push("/login?redirect=" + encodeURIComponent(`/listing/${property.id}`));
                return;
              }
              toggleFavorite(property.id, user.id); 
            }}
            type="button"
            aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 text-secondary shadow-md hover:bg-surface hover:text-rose-600 transition-colors"
          >
            <Heart
              className={`h-4 w-4 transition-transform ${favorite ? "fill-rose-600 text-rose-600 scale-110" : ""}`}
              aria-hidden="true"
            />
          </button>
        )}

        {/* Distance pill */}
        {distanceKm !== null && (
          <div className="absolute bottom-3 right-3 z-10 rounded-lg bg-foreground/85 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-white shadow-sm flex items-center gap-1">
            <MapPin className="h-3 w-3 text-emerald-400" aria-hidden="true" />
            <span>{distanceKm} km</span>
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">

        {/* Area */}
        <div className="flex items-center gap-1 text-xs text-muted mb-1.5">
          <MapPin className="h-3 w-3 text-primary shrink-0" aria-hidden="true" />
          <span className="truncate">{property.area}, Lahore</span>
        </div>

        {/* Title */}
        <Link href={`/listing/${property.id}`}>
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Price row */}
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-black text-foreground tracking-tight">
            {formatPKR(displayPrice)}
          </span>
          <span className="text-xs font-normal text-muted">/ month</span>
          {isDiscountActive && (
            <span className="text-xs line-through text-subtle font-medium ml-1">
              {formatPKR(property.rent_price)}
            </span>
          )}
        </div>

        {/* Specs */}
        <div className="mt-3 flex items-center justify-between border-t border-[#F0F0EF] pt-3 text-xs text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5 text-subtle" aria-hidden="true" />
              <span>{property.bedrooms} Bed</span>
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-subtle" aria-hidden="true" />
              <span>{property.bathrooms} Bath</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5" aria-label="Available utilities">
            {property.has_gas && (
              <span title="Sui Gas" aria-label="Sui Gas available">
                <Flame className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
              </span>
            )}
            {property.has_electricity && (
              <span title="Electricity meter" aria-label="Electricity meter">
                <Zap className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              </span>
            )}
            {property.has_water && (
              <span title="Water supply" aria-label="Water supply">
                <Droplets className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
              </span>
            )}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-3 pt-3 border-t border-[#F0F0EF]">
          <WhatsAppButton
            phone={property.landlord?.whatsapp_number || property.landlord?.phone || "03001234567"}
            title={property.title}
            rentPrice={displayPrice}
            area={property.area}
            size="sm"
            className="w-full justify-center"
            disabled={property.status === "sealed"}
            label={property.status === "sealed" ? "Rented Out" : "WhatsApp Landlord"}
          />
        </div>
      </div>
    </article>
  );
}
