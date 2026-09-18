"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShieldCheck, Quote } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    name: "Kamran Shahzad",
    role: "Software Engineer",
    location: "Gulberg III, Lahore",
    duration: "Resident 2 yrs",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    quote:
      "We were tired of paying 1 month's commission to street brokers who never picked up after the lease was signed. On GharYahan, I messaged the landlord directly on WhatsApp, inspected the 2-bed upper portion next day, and signed with zero extra charges.",
    tag: "family",
    rating: 5,
  },
  {
    id: 2,
    name: "Ayesha Farooq",
    role: "Architect & Lecturer",
    location: "Johar Town, Phase 1",
    duration: "Resident 1 yr",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    quote:
      "The utility transparency is what impressed me the most. In Lahore, you never know if a portion has an independent electricity meter or water issues. The listing clearly stated all utility specs, and the landlord was genuinely cooperative.",
    tag: "professional",
    rating: 5,
  },
  {
    id: 3,
    name: "Malik Usman",
    role: "Property Owner / Landlord",
    location: "Singhpura, Lahore",
    duration: "Landlord 3 yrs",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    quote:
      "I listed my first floor 2-bed portion on GharYahan and got 5 inquiries within 48 hours from genuine working families. Updating the deal status to 'In Deal' and then 'Sealed' prevented unnecessary calls. Seamless platform for owners.",
    tag: "landlord",
    rating: 5,
  },
  {
    id: 4,
    name: "Dr. Bilal Tariq",
    role: "Resident Physician",
    location: "Model Town, Block C",
    duration: "Resident 8 mos",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    quote:
      "Finding a quiet rental portion near Ittefaq Hospital was critical for my night shifts. The hyperlocal filter let me zero in on Model Town blocks specifically. Direct contact with the landlord made move-in effortless.",
    tag: "professional",
    rating: 5,
  },
];

const FILTER_TAGS = [
  { id: "all", label: "All Stories" },
  { id: "family", label: "Family Portions" },
  { id: "professional", label: "Working Professionals" },
  { id: "landlord", label: "Landlords" },
];

export default function CommunityReviews() {
  const [filter, setFilter] = useState("all");

  const filtered = REVIEWS.filter((r) => (filter === "all" ? true : r.tag === filter));

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-primary text-xs font-bold mb-3">
              <Quote className="h-3.5 w-3.5" />
              Community Trust
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              What Lahore tenants and owners say
            </h2>
            <p className="text-sm sm:text-base text-muted mt-2 max-w-xl">
              Real experiences from families and property owners renting through our direct marketplace.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {FILTER_TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  filter === t.id
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface text-secondary border-border hover:bg-surface-2"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-card transition-all"
            >
              <div>
                {/* 5 Star Rating */}
                <div className="flex items-center gap-1 text-amber-500 mb-3" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-secondary leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="flex items-center gap-3 pt-5 mt-5 border-t border-border/80">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-primary-light shrink-0 border border-border">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{item.name}</div>
                  <div className="text-[10px] text-muted truncate">{item.role}</div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-primary mt-0.5">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
