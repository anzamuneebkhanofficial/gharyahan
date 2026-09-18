"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useLocationStore } from "../../stores/useLocationStore";
import { LAHORE_AREAS, PAKISTAN_POPULAR_AREAS } from "../../lib/location";
import { Navigation, Search, MapPin, Check, CornerDownLeft } from "lucide-react";
import { toast } from "sonner";

export default function LocationPickerModal() {
  const {
    isModalOpen,
    closeLocationModal,
    activeArea,
    setManualLocation,
    detectLocation,
    isDetecting,
  } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState("");

  const allAreasList = [
    ...LAHORE_AREAS,
    ...PAKISTAN_POPULAR_AREAS.filter((p) => p.city !== "Lahore").map((p) => ({
      id: `${p.name.toLowerCase()}-${p.city.toLowerCase()}`,
      name: `${p.name}, ${p.city}`,
      city: p.city,
      mohallas: [p.name, p.city],
    })),
  ];

  const filteredAreas = allAreasList.filter((area) =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (area.mohallas && area.mohallas.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleDetectGPS = async () => {
    const res = await detectLocation();
    if (res.success) {
      toast.success(`Location detected: ${res.displayName || res.area}`);
      closeLocationModal();
    } else {
      toast.error(res.error || "Could not detect GPS location. Please select or type an area below.");
    }
  };

  const handleSelectArea = (areaName, coords = null, cityName = null) => {
    setManualLocation(areaName, coords, cityName);
    toast.success(`Search location set to ${areaName}`);
    closeLocationModal();
  };

  const handleApplyCustomQuery = () => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim();
    const inferredCity = query.includes(",") ? query.split(",").pop().trim() : "Pakistan";
    handleSelectArea(query, null, inferredCity);
  };

  const popularChips = [
    "Lahore",
    "Karachi",
    "Islamabad",
    "Rawalpindi",
    "Singhpura",
    "Gulberg",
    "DHA",
  ];

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeLocationModal}
      title="Select Your Location"
      description="GharYahan prioritizes rental properties closest to your exact street or area."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* GPS Auto Detect CTA */}
        <Button
          variant="primary"
          size="lg"
          className="w-full justify-center gap-2 bg-primary text-white font-bold"
          isLoading={isDetecting}
          onClick={handleDetectGPS}
        >
          <Navigation className="h-4 w-4 text-emerald-300" />
          <span>Auto-Detect My Live Location via GPS</span>
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Or Type Any City / Area
          </span>
        </div>

        {/* Search input with Enter-to-apply */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyCustomQuery();
              }
            }}
            placeholder="Type any city or area (e.g. Clifton, Karachi or F-10, Islamabad)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-24 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[44px]"
          />
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={handleApplyCustomQuery}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-bold rounded-lg bg-primary text-white hover:bg-emerald-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Use</span>
              <CornerDownLeft className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Quick popular chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {popularChips.map((chipName) => {
            const isSelected = activeArea.toLowerCase().includes(chipName.toLowerCase());
            return (
              <button
                key={chipName}
                type="button"
                onClick={() => handleSelectArea(chipName)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {chipName}
              </button>
            );
          })}
        </div>

        {/* Areas list with custom query fallback option */}
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={handleApplyCustomQuery}
              className="w-full text-left px-4 py-2.5 bg-emerald-50/60 hover:bg-emerald-100/60 text-xs font-semibold text-emerald-900 flex items-center justify-between border-b border-emerald-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                <span>Use custom location: &ldquo;<strong>{searchQuery.trim()}</strong>&rdquo;</span>
              </div>
              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded font-bold">Apply</span>
            </button>
          )}

          {filteredAreas.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching pre-seeded areas. Press &ldquo;Use&rdquo; above to apply &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredAreas.map((area) => {
              const isSelected = activeArea.toLowerCase() === area.name.toLowerCase();
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleSelectArea(area.name, area.lat ? { lat: area.lat, lng: area.lng } : null, area.city)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                    isSelected ? "bg-emerald-50/60" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                      <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-emerald-700" : "text-slate-400"}`} />
                      <span>{area.name}</span>
                    </div>
                    {area.mohallas && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
                        {area.mohallas.slice(0, 3).join(", ")}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
