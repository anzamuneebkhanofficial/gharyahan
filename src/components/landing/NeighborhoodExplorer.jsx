"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Navigation, School, ShoppingBag, Hospital, Coffee, Train, ArrowRight } from "lucide-react";

const NEIGHBORHOOD_DATA = {
  gulberg: {
    id: "gulberg",
    name: "Gulberg (II & III)",
    headline: "Central commercial & upscale residential hub",
    desc: "Famous for MM Alam Road dining, Main Market convenience, top corporate offices, and central connectivity to Canal Road.",
    avgRent: "PKR 45,000 – 120,000",
    toTransit: "4 mins to Kalma Chowk Metro",
    availableCount: 42,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
    amenities: [
      { category: "Dining", name: "MM Alam Road Cafes", time: "2 min walk", icon: Coffee },
      { category: "Shopping", name: "Main & Ghalib Markets", time: "5 min walk", icon: ShoppingBag },
      { category: "Healthcare", name: "United Hospital / Hameed Latif", time: "6 min drive", icon: Hospital },
      { category: "Transit", name: "Kalma Chowk Bus / Metro", time: "4 min drive", icon: Train },
    ],
  },
  dha: {
    id: "dha",
    name: "DHA Lahore (Phases 1-6)",
    headline: "Planned gated communities with tranquil living",
    desc: "Modern infrastructure, wide boulevards, Y-Block commercial markets, high security, and premier educational institutes.",
    avgRent: "PKR 65,000 – 220,000",
    toTransit: "8 mins to Ring Road Interchange",
    availableCount: 38,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
    amenities: [
      { category: "Shopping", name: "Y-Block Commercial & Al-Fatah", time: "3 min drive", icon: ShoppingBag },
      { category: "Schools", name: "LUMS & Beaconhouse DHA", time: "5 min drive", icon: School },
      { category: "Healthcare", name: "National Hospital DHA", time: "4 min drive", icon: Hospital },
      { category: "Transit", name: "Lahore Ring Road Access", time: "8 min drive", icon: Train },
    ],
  },
  "johar-town": {
    id: "johar-town",
    name: "Johar Town",
    headline: "Educational, family-friendly & medical capital",
    desc: "Home to Emporium Mall, Shaukat Khanum Hospital, UMT, and diverse choices of upper and lower residential portions.",
    avgRent: "PKR 35,000 – 85,000",
    toTransit: "10 mins to Thokar Niaz Baig",
    availableCount: 56,
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80",
    amenities: [
      { category: "Shopping", name: "Emporium Mall & Carrefour", time: "5 min drive", icon: ShoppingBag },
      { category: "Healthcare", name: "Shaukat Khanum Hospital", time: "3 min drive", icon: Hospital },
      { category: "Schools", name: "UMT & Central Model", time: "4 min drive", icon: School },
      { category: "Dining", name: "Allah Hoo Chowk Food St.", time: "2 min walk", icon: Coffee },
    ],
  },
  "model-town": {
    id: "model-town",
    name: "Model Town",
    headline: "Historic green suburb with sprawling parks",
    desc: "Cooperative society living with lush central parks, Model Town Link Road retail, and quiet residential blocks.",
    avgRent: "PKR 40,000 – 110,000",
    toTransit: "5 mins to Kalma Underpass",
    availableCount: 29,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80",
    amenities: [
      { category: "Parks", name: "Model Town Linear & Circular Parks", time: "1 min walk", icon: Coffee },
      { category: "Shopping", name: "Link Road Commercial Hub", time: "4 min drive", icon: ShoppingBag },
      { category: "Healthcare", name: "Ittefaq Hospital", time: "6 min drive", icon: Hospital },
      { category: "Schools", name: "Divisional Public School (DPS)", time: "3 min drive", icon: School },
    ],
  },
  singhpura: {
    id: "singhpura",
    name: "Singhpura / GT Road",
    headline: "Hyperlocal, affordable community living",
    desc: "Vibrant neighborhood next to Baghbanpura and UET, offering pocket-friendly family portions with immediate GT Road transit.",
    avgRent: "PKR 20,000 – 45,000",
    toTransit: "3 mins to Orange Line Metro",
    availableCount: 31,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80",
    amenities: [
      { category: "Transit", name: "Orange Line Baghbanpura Station", time: "3 min walk", icon: Train },
      { category: "Shopping", name: "Singhpura Main Bazaar", time: "1 min walk", icon: ShoppingBag },
      { category: "Healthcare", name: "Kot Khawaja Saeed Hospital", time: "4 min drive", icon: Hospital },
      { category: "Schools", name: "Govt High School & UET Campus", time: "5 min drive", icon: School },
    ],
  },
};

export default function NeighborhoodExplorer() {
  const [activeKey, setActiveKey] = useState("gulberg");
  const area = NEIGHBORHOOD_DATA[activeKey];

  return (
    <section id="neighborhoods" className="py-16 lg:py-24 bg-surface border-y border-border/70 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold mb-3">
              <MapPin className="h-3.5 w-3.5" />
              Hyperlocal Lahore Guide
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Explore Lahore&apos;s best rental neighborhoods
            </h2>
            <p className="text-sm sm:text-base text-muted mt-2 max-w-2xl">
              Average rental rates, commute benchmarks, and neighborhood amenities to help you choose the right mohalla.
            </p>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors shrink-0"
          >
            <span>View All Mohallas</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Neighborhood Selector Tabs (Heavenly inspired) */}
        <div className="flex items-center gap-2 pb-4 overflow-x-auto no-scrollbar border-b border-border mb-8">
          {Object.entries(NEIGHBORHOOD_DATA).map(([key, data]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveKey(key)}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
                activeKey === key
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-background text-secondary border-border hover:bg-surface-2"
              }`}
            >
              {data.name}
            </button>
          ))}
        </div>

        {/* Neighborhood Spotlight Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-3xl bg-background border border-border p-6 sm:p-8 shadow-sm">
          
          {/* Visual Column */}
          <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-full rounded-2xl overflow-hidden min-h-[260px]">
            <Image
              src={area.image}
              alt={area.name}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                Lahore Mohalla
              </span>
              <h3 className="text-xl font-extrabold">{area.name}</h3>
              <p className="text-xs text-white/80 line-clamp-1">{area.headline}</p>
            </div>
          </div>

          {/* Stats & Amenities Column */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                {area.headline}
              </h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {area.desc}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface border border-border">
                <span className="text-[10px] font-bold text-muted uppercase">Avg Monthly Rent</span>
                <div className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">
                  {area.avgRent}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-border">
                <span className="text-[10px] font-bold text-muted uppercase">Transit Benchmark</span>
                <div className="text-sm sm:text-base font-extrabold text-primary mt-0.5">
                  {area.toTransit}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-border">
                <span className="text-[10px] font-bold text-muted uppercase">Verified Rentals</span>
                <div className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">
                  {area.availableCount}+ active homes
                </div>
              </div>
            </div>

            {/* Amenity Highlights */}
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                Key Local Amenities & Landmarks
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {area.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface border border-border/80 text-xs"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-primary shrink-0">
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{item.name}</div>
                      <div className="text-[10px] text-muted">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-2">
              <Link
                href={`/search?area=${encodeURIComponent(area.name.split(" ")[0])}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
              >
                <span>Browse Homes in {area.name}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
