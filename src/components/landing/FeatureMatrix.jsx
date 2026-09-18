import Image from "next/image";
import { ShieldCheck, Banknote, MessageCircle, Clock, Zap, CalendarCheck } from "lucide-react";

export default function FeatureMatrix() {
  const LEFT_FEATURES = [
    {
      Icon: ShieldCheck,
      title: "100% Verified Mohallas",
      desc: "Every listing is mapped to authentic street coordinates in Lahore — zero phantom or duplicate ads.",
    },
    {
      Icon: Banknote,
      title: "Zero Broker Commission",
      desc: "Save 15 to 30 days rent. Dealing directly with landlords means zero middleman brokerage fees.",
    },
    {
      Icon: MessageCircle,
      title: "Direct WhatsApp Inquiries",
      desc: "One-tap direct chat with property owners, pre-filled with property title and rental details.",
    },
  ];

  const RIGHT_FEATURES = [
    {
      Icon: Clock,
      title: "Live Deal Status Tracking",
      desc: "Properties update in real-time to Available, In Deal, or Sealed so you never waste time visiting taken spaces.",
    },
    {
      Icon: Zap,
      title: "Verified Utility Sub-Meters",
      desc: "Upfront disclosure of Wapda separate meters, Sui gas connection, and motor/water supply status.",
    },
    {
      Icon: CalendarCheck,
      title: "Fast Move-In Scheduling",
      desc: "Coordinate direct walk-ins and key handover dates directly with the landlord on your schedule.",
    },
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-background scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-light px-3 py-1 rounded-full">
            The GharYahan Advantage
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Designed for transparent renting
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
            Eliminating the traditional hassles of rental searches in Lahore with modern digital tooling and direct verified owner connections.
          </p>
        </div>

        {/* 3-Column Matrix (RubyHome Inspired) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
          
          {/* Left Feature Column */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {LEFT_FEATURES.map((feat, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-card transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary mb-3">
                  <feat.Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{feat.title}</h3>
                <p className="mt-1.5 text-xs sm:text-sm text-muted leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Center Column: Hero Architectural Perspective Image */}
          <div className="relative h-[420px] sm:h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-border group">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80"
              alt="Modern Lahore architectural home"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />

            {/* Bottom floating badge */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-surface/95 backdrop-blur-md border border-white/40 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Verified Lahore Spaces
                  </div>
                  <div className="text-sm font-extrabold text-foreground">
                    Direct Landlord Deals
                  </div>
                </div>
                <span className="text-xs font-bold bg-accent text-primary px-3 py-1 rounded-full shadow-xs">
                  0% Commission
                </span>
              </div>
            </div>
          </div>

          {/* Right Feature Column */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {RIGHT_FEATURES.map((feat, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-card transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light text-amber-800 mb-3">
                  <feat.Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{feat.title}</h3>
                <p className="mt-1.5 text-xs sm:text-sm text-muted leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
