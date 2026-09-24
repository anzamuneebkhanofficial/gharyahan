"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building, Banknote, Navigation, ChevronDown } from "lucide-react";
import { useLocationStore } from "../../stores/useLocationStore";
import { LAHORE_AREAS } from "../../lib/location";

const BUDGET_PRESETS = [
  { label: "Any Budget", min: 0, max: "" },
  { label: "Under PKR 30k", min: 0, max: 30000 },
  { label: "PKR 30k - 50k", min: 30000, max: 50000 },
  { label: "PKR 50k - 90k", min: 50000, max: 90000 },
  { label: "PKR 90k - 150k", min: 90000, max: 150000 },
  { label: "PKR 150k+", min: 150000, max: 1000000 },
];

const SEARCH_TABS = [
  { id: "all", label: "All Rentals" },
  { id: "portion", label: "Portions" },
  { id: "house", label: "Houses" },
  { id: "flat", label: "Flats" },
  { id: "room", label: "Rooms" },
];

export default function HeroSearchWidget() {
  const router = useRouter();
  const { activeArea, openLocationModal, detectLocation, isDetecting } = useLocationStore();

  const [activeTab, setActiveTab] = useState("all");
  const [selectedArea, setSelectedArea] = useState(activeArea || "Gulberg");
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(0);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();

    if (selectedArea && selectedArea !== "All Lahore") {
      params.set("area", selectedArea);
    }
    if (activeTab !== "all") {
      params.set("type", activeTab);
    }
    const budget = BUDGET_PRESETS[selectedBudgetIndex];
    if (budget.min > 0) {
      params.set("minBudget", String(budget.min));
    }
    if (budget.max) {
      params.set("maxBudget", String(budget.max));
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl bg-surface/95 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-3 sm:p-4 text-foreground">
      {/* Segmented Mode Tabs (RubyHome style) */}
      <div className="flex items-center gap-1 sm:gap-2 pb-3 border-b border-border/70 overflow-x-auto no-scrollbar">
        {SEARCH_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground hover:bg-surface-2"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3">
        {/* Location Selector */}
        <div className="relative group">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1 px-1">
            Location
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-background py-2.5 pl-9 pr-8 text-xs font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-surface-2 transition-colors"
            >
              <option value="All Lahore">All Lahore Areas</option>
              {LAHORE_AREAS.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-subtle">
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Property Type Selector */}
        <div className="relative group">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1 px-1">
            Property Type
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-primary">
              <Building className="h-4 w-4" />
            </div>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-background py-2.5 pl-9 pr-8 text-xs font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-surface-2 transition-colors"
            >
              <option value="all">Any Space</option>
              <option value="portion">Upper / Lower Portion</option>
              <option value="house">Complete House</option>
              <option value="flat">Apartment / Flat</option>
              <option value="room">Single Room / Hostel</option>
            </select>
            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-subtle">
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Budget Selector */}
        <div className="relative group">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1 px-1">
            Monthly Budget
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-primary">
              <Banknote className="h-4 w-4" />
            </div>
            <select
              value={selectedBudgetIndex}
              onChange={(e) => setSelectedBudgetIndex(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-border bg-background py-2.5 pl-9 pr-8 text-xs font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-surface-2 transition-colors"
            >
              {BUDGET_PRESETS.map((b, idx) => (
                <option key={b.label} value={idx}>
                  {b.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-subtle">
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 mt-3 border-t border-border/70">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetecting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-secondary hover:text-primary hover:bg-primary-light/40 border border-border transition-colors cursor-pointer"
          >
            <Navigation className={`h-3.5 w-3.5 text-primary ${isDetecting ? "animate-spin" : ""}`} />
            <span>{isDetecting ? "Detecting GPS..." : "Near My Location"}</span>
          </button>
          <button
            type="button"
            onClick={openLocationModal}
            className="text-xs font-medium text-muted hover:text-primary transition-colors cursor-pointer px-1"
          >
            Choose on Map
          </button>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer group"
        >
          <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span>Search Rentals</span>
        </button>
      </div>
    </div>
  );
}
