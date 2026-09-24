"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Search,
  ArrowRight,
  Clock,
  Building2,
  MessageCircle,
  Home,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Button from "../components/ui/Button";
import PropertyCard from "../components/listings/PropertyCard";
import PropertyCardSkeleton from "../components/listings/PropertyCardSkeleton";
import HeroSearchWidget from "../components/landing/HeroSearchWidget";
import TrustPartners from "../components/landing/TrustPartners";
import RentCalculator from "../components/landing/RentCalculator";
import FeatureMatrix from "../components/landing/FeatureMatrix";
import NeighborhoodExplorer from "../components/landing/NeighborhoodExplorer";
import CommunityReviews from "../components/landing/CommunityReviews";
import { usePropertiesStore } from "../stores/usePropertiesStore";
import { formatPKR } from "../lib/utils";

const PROPERTY_TYPES = [
  { id: "all", label: "All Properties", Icon: Layers },
  { id: "portion", label: "Portions", Icon: Home },
  { id: "house", label: "Houses", Icon: Building2 },
  { id: "flat", label: "Flats", Icon: Building2 },
  { id: "room", label: "Rooms", Icon: Home },
];

export default function HomePage() {
  const { properties, isLoading, fetchHomeProperties } = usePropertiesStore();
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetchHomeProperties();
  }, [fetchHomeProperties]);

  const sortedProperties = useMemo(() => {
    const filtered = properties.filter((p) =>
      selectedType === "all" ? true : p.property_type === selectedType
    );
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
      const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
      return dateB - dateA;
    });
  }, [properties, selectedType]);

  const featured = sortedProperties.slice(0, 6);
  const upcoming = properties
    .filter((p) => p.expected_vacancy_date)
    .slice(0, 3);

  return (
    <main id="main-content" className="w-full bg-background text-foreground overflow-hidden">

      {/* ── HERO SECTION (RubyHome + Modern Hybrid) ─────────────────────────── */}
      <section
        aria-label="Find rental homes in Lahore"
        className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-surface via-background to-surface/40 overflow-hidden"
      >
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-primary-light/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent-light/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

            {/* Left Column: Copy & Interactive Search Widget */}
            <div className="lg:col-span-7 space-y-6 z-10">

              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border shadow-xs text-xs font-bold text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>Hyperlocal Lahore Rental Network</span>
                <span className="text-subtle">·</span>
                <span className="text-muted font-medium">0% Broker Commission</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-foreground text-pretty">
                Find the perfect place to stay with your family
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-secondary leading-relaxed max-w-xl">
                Direct WhatsApp contact with verified landlords across Lahore. Transparent utility meters, real-time deal status, and zero middleman agency charges.
              </p>

              {/* RubyHome-style Segmented Search Card */}
              <div className="pt-2">
                <HeroSearchWidget />
              </div>

            </div>

            {/* Right Column: Architectural Visual & Floating Deal Badges (RubyHome style) */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative w-full h-[540px] rounded-3xl overflow-hidden shadow-2xl border border-border group">
                <Image
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80"
                  alt="Modern residential architecture in Lahore"
                  fill
                  priority
                  sizes="(max-width: 1280px) 40vw, 500px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />

                {/* Floating Top Card: Live Verified Rental Badge */}
                <div className="absolute top-6 left-6 right-6 p-4 rounded-2xl bg-surface/95 backdrop-blur-md border border-white/50 shadow-lg animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shrink-0">
                      <Home className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        Verified Listing · Gulberg III
                      </div>
                      <div className="text-xs font-extrabold text-foreground truncate">
                        2 Bed Upper Portion with Separate Gate
                      </div>
                    </div>
                    <span className="text-xs font-black text-primary bg-primary-light px-2.5 py-1 rounded-lg">
                      Rs 45,000
                    </span>
                  </div>
                </div>

                {/* Floating Bottom Card: Direct WhatsApp Connect */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-surface/95 backdrop-blur-md border border-white/50 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Direct WhatsApp Chat</div>
                      <div className="text-[11px] text-muted">Direct to Landlord · Zero Broker Fee</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TRUST & VERIFICATION PARTNERS STRIP ───────────────────────────── */}
      <TrustPartners />

      {/* ── POPULAR RENTAL PROPERTIES ─────────────────────────────────────── */}
      <section aria-labelledby="popular-heading" className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-light px-3 py-1 rounded-full">
                Curated Spaces
              </span>
              <h2
                id="popular-heading"
                className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2"
              >
                Popular properties for rent
              </h2>
              <p className="text-sm text-muted mt-1.5">
                Explore hand-picked portions, flats, and houses across Lahore with live deal status.
              </p>
            </div>

            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors shrink-0"
            >
              <span>View All Properties</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Property Category Filter Chips (RubyHome style) */}
          <div
            className="flex items-center gap-2 pb-4 overflow-x-auto no-scrollbar mb-8 border-b border-border"
            role="group"
            aria-label="Filter by property category"
          >
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                aria-pressed={selectedType === t.id}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer border ${selectedType === t.id
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface text-secondary border-border hover:bg-surface-2"
                  }`}
              >
                <t.Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p, index) => (
                <PropertyCard key={p.id} property={p} priority={index < 2} />
              ))}
            </div>
          )}

          {/* Bottom Call to Action */}
          <div className="mt-12 text-center">
            <Button
              href="/search"
              variant="outline"
              size="md"
              className="px-8 py-3 rounded-xl border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all shadow-xs"
            >
              <Search className="h-4 w-4 mr-2" />
              <span>Explore All Lahore Listings</span>
            </Button>
          </div>

        </div>
      </section>

      {/* ── RENT AFFORDABILITY CALCULATOR ─────────────────────────────────── */}
      <RentCalculator />

      {/* ── 3-COLUMN FEATURE MATRIX (RubyHome Inspired) ───────────────────── */}
      <FeatureMatrix />

      {/* ── NEIGHBORHOOD EXPLORER (Heavenly Inspired) ─────────────────────── */}
      <NeighborhoodExplorer />

      {/* ── UPCOMING VACANCIES ─────────────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section aria-labelledby="vacancies-heading" className="py-14 bg-surface border-t border-border/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 shrink-0">
                  <Clock className="h-4.5 w-4.5 text-amber-700" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="vacancies-heading" className="text-lg font-bold text-foreground">
                    Upcoming vacancies in Lahore
                  </h2>
                  <p className="text-xs text-muted">Currently occupied — reserve your visit before they hit the open market</p>
                </div>
              </div>

              <Link
                href="/search?status=vacancy_only"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <span>View all vacancies</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-background overflow-hidden divide-y divide-border">
              {upcoming.map((p) => (
                <Link
                  key={p.id}
                  href={`/listing/${p.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-surface-2 transition-colors group bg-surface"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {p.title}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {p.area} · {p.property_type} · {p.bedrooms} Bed
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-foreground">{formatPKR(p.rent_price)}</div>
                    <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-0.5 border border-amber-200">
                      Available {p.expected_vacancy_date ? new Date(p.expected_vacancy_date).toLocaleDateString("en-PK", { month: "short", day: "numeric" }) : "Soon"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── COMMUNITY REVIEWS / WHAT LOCALS SAY ───────────────────────────── */}
      <CommunityReviews />

      {/* ── GET LISTED YOUR HOME AS AN OWNER (RubyHome Inspired CTA) ──────── */}
      <section aria-labelledby="owner-cta-heading" className="py-16 lg:py-24 bg-primary text-white relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/15">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              For Property Owners & Landlords
            </span>

            <h2
              id="owner-cta-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
            >
              Get listed your home as an owner
            </h2>

            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              Have a portion, complete house, flat, or room to rent in Lahore? List in under 2 minutes. Tenants message you directly on WhatsApp — zero agency fees.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                href="/dashboard/listings/new"
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-foreground font-extrabold text-sm sm:text-base shadow-lg transition-all"
              >
                <span>List Your Property Free</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Button
                href="/login?redirect=/dashboard"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-white/30 text-white bg-transparent hover:bg-white/10 font-bold text-sm"
              >
                <span>Landlord Portal</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Zero Commission Charged
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Direct WhatsApp Messages
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Full Control Over Availability
              </span>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
