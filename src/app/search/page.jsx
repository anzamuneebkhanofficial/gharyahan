"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  X,
} from "lucide-react";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import PropertyCard from "../../components/listings/PropertyCard";
import PropertyCardSkeleton from "../../components/listings/PropertyCardSkeleton";
import { usePropertiesStore } from "../../stores/usePropertiesStore";
import { useLocationStore } from "../../stores/useLocationStore";
import { LAHORE_AREAS } from "../../lib/location";

const PAGE_SIZE = 9;

const BUDGET_PRESETS = [
  { label: "All Budgets", min: "", max: "" },
  { label: "< Rs 25k", min: "", max: "25000" },
  { label: "Rs 25k–50k", min: "25000", max: "50000" },
  { label: "Rs 50k–100k", min: "50000", max: "100000" },
  { label: "Rs 100k–250k", min: "100000", max: "250000" },
  { label: "Rs 250k+", min: "250000", max: "" },
];

export default function SearchPage() {
  const { searchProperties } = usePropertiesStore();
  const { activeArea, openLocationModal, setManualLocation, userCoords } =
    useLocationStore();

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterByLocation, setFilterByLocation] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Budget Range States (no artificial cap)
  const [minBudget, setMinBudget] = useState("");
  const [debouncedMinBudget, setDebouncedMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [debouncedMaxBudget, setDebouncedMaxBudget] = useState("");

  const [minBedrooms, setMinBedrooms] = useState("all");
  const [hasDiscountOnly, setHasDiscountOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Server Data States
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Request counter to avoid stale race conditions
  const requestIdRef = useRef(0);

  // Debounce text search and budget inputs by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedMinBudget(minBudget);
      setDebouncedMaxBudget(maxBudget);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, minBudget, maxBudget]);

  // Server-side search execution
  useEffect(() => {
    let isCurrent = true;
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);

    const executeSearch = async () => {
      const result = await searchProperties({
        searchTerm: debouncedSearchTerm,
        activeArea,
        filterByLocation,
        selectedType,
        selectedStatus,
        minBudget: debouncedMinBudget ? Number(debouncedMinBudget) : 0,
        maxBudget: debouncedMaxBudget ? Number(debouncedMaxBudget) : null,
        minBedrooms,
        hasDiscountOnly,
        sortBy,
        page,
        pageSize: PAGE_SIZE,
        userCoords,
      });

      if (isCurrent && currentRequestId === requestIdRef.current) {
        setProperties(result.properties || []);
        setTotalCount(result.totalCount || 0);
        setIsLoading(false);
      }
    };

    executeSearch();

    return () => {
      isCurrent = false;
    };
  }, [
    debouncedSearchTerm,
    activeArea,
    filterByLocation,
    selectedType,
    selectedStatus,
    debouncedMinBudget,
    debouncedMaxBudget,
    minBedrooms,
    hasDiscountOnly,
    sortBy,
    page,
    searchProperties,
    userCoords,
  ]);

  const resetPage = useCallback(() => setPage(1), []);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterByLocation(false);
    setSelectedType("all");
    setSelectedStatus("all");
    setMinBudget("");
    setMaxBudget("");
    setMinBedrooms("all");
    setHasDiscountOnly(false);
    setSortBy("newest");
    setPage(1);
  };

  const handleSelectAreaPill = (areaName) => {
    if (areaName === "all") {
      setFilterByLocation(false);
    } else {
      setManualLocation(areaName);
      setFilterByLocation(true);
    }
    resetPage();
  };

  const handlePresetBudget = (preset) => {
    setMinBudget(preset.min);
    setMaxBudget(preset.max);
    resetPage();
  };

  // Check if any filter is active for indicator dot (without resizing the button)
  const hasActiveFilters =
    selectedType !== "all" ||
    selectedStatus !== "all" ||
    minBedrooms !== "all" ||
    (minBudget && Number(minBudget) > 0) ||
    (maxBudget && Number(maxBudget) > 0) ||
    hasDiscountOnly;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Search Header Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <MapPin className="h-4 w-4 text-emerald-700" />
              <span>Rental marketplace location:</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {filterByLocation ? `${activeArea}, Lahore` : "All Properties"}
              </h1>
              <button
                onClick={openLocationModal}
                type="button"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer underline"
              >
                {filterByLocation ? "Change Area" : "Filter by Area"}
              </button>
            </div>
          </div>

          {/* Search input with stable dimensions */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  resetPage();
                }}
                placeholder="Search portion, rooms, bazaar, road..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    resetPage();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle with stable width (no shift when active) */}
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="relative gap-2 border-slate-200 shrink-0 font-bold min-w-[92px] justify-center"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-700" />
              <span className="text-xs hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>
        </div>

        {/* Location Filter Tag & Quick Switch Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Quick Locality:</span>

          <button
            type="button"
            onClick={() => handleSelectAreaPill("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !filterByLocation
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All
          </button>

          {LAHORE_AREAS.slice(0, 6).map((area) => {
            const isSelected =
              filterByLocation &&
              activeArea.toLowerCase() === area.name.toLowerCase();
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => handleSelectAreaPill(area.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {area.name}
              </button>
            );
          })}

          {filterByLocation && (
            <button
              type="button"
              onClick={() => setFilterByLocation(false)}
              className="inline-flex items-center gap-1 ml-auto text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear Location Filter</span>
            </button>
          )}
        </div>

        {/* Filter Panel with Zero CLS Guaranteed Fixed-Dimension Grid */}
        <div
          className={`mt-4 pt-4 border-t border-slate-100 ${
            isFilterOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* 1. Property Type */}
            <div className="flex flex-col">
              <label className="h-4 leading-4 mb-1.5 font-semibold text-slate-600 truncate block">
                Property type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  resetPage();
                }}
                className="h-10 min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="all">All types</option>
                <option value="portion">Portion (Upper / Lower)</option>
                <option value="house">Complete house</option>
                <option value="flat">Flat / Apartment</option>
                <option value="room">Single room</option>
              </select>
            </div>

            {/* 2. Deal Status */}
            <div className="flex flex-col">
              <label className="h-4 leading-4 mb-1.5 font-semibold text-slate-600 truncate block">
                Deal status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  resetPage();
                }}
                className="h-10 min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="all">All statuses</option>
                <option value="available_only">Available now</option>
                <option value="vacancy_only">Expected vacancy</option>
                <option value="in_deal">In deal</option>
              </select>
            </div>

            {/* 3. Min Bedrooms */}
            <div className="flex flex-col">
              <label className="h-4 leading-4 mb-1.5 font-semibold text-slate-600 truncate block">
                Min bedrooms
              </label>
              <select
                value={minBedrooms}
                onChange={(e) => {
                  setMinBedrooms(e.target.value);
                  resetPage();
                }}
                className="h-10 min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="all">Any</option>
                <option value="1">1+ bed</option>
                <option value="2">2+ bed</option>
                <option value="3">3+ bed</option>
              </select>
            </div>

            {/* 4. Min Budget (PKR) - Stable layout, no artificial caps */}
            <div className="flex flex-col">
              <label className="h-4 leading-4 mb-1.5 font-semibold text-slate-600 truncate block">
                Min budget (PKR)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                placeholder="0 (Any)"
                value={minBudget}
                onChange={(e) => {
                  setMinBudget(e.target.value);
                  resetPage();
                }}
                className="h-10 min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 text-xs tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            {/* 5. Max Budget (PKR) - Stable layout, no artificial caps */}
            <div className="flex flex-col">
              <label className="h-4 leading-4 mb-1.5 font-semibold text-slate-600 truncate block">
                Max budget (PKR)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                placeholder="No limit"
                value={maxBudget}
                onChange={(e) => {
                  setMaxBudget(e.target.value);
                  resetPage();
                }}
                className="h-10 min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 text-xs tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            {/* 6. Sort Order */}
            <div className="flex flex-col">
              <label className="h-4 leading-4 mb-1.5 font-semibold text-slate-600 truncate block">
                Sort order
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  resetPage();
                }}
                className="h-10 min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="newest">Latest listings first</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>
          </div>

          {/* Quick Budget Presets Bar */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium mr-1">Budget presets:</span>
            {BUDGET_PRESETS.map((preset, idx) => {
              const isSelected =
                String(minBudget) === preset.min && String(maxBudget) === preset.max;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetBudget(preset)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Bottom Filter Options */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDiscountOnly}
                onChange={(e) => {
                  setHasDiscountOnly(e.target.checked);
                  resetPage();
                }}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Show Discounted Rentals Only</span>
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Section with Zero Layout Shift Guaranteed */}
      {isLoading ? (
        <div>
          <div className="min-h-[28px] flex items-center justify-between mb-4">
            <p className="text-xs text-slate-500">
              Searching {filterByLocation ? activeArea : "rental listings"}...
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {filterByLocation
              ? `No rental spaces found in ${activeArea}`
              : "No properties match your filters"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {filterByLocation
              ? "You can clear the location filter to browse all properties across Lahore or try another locality."
              : "Try adjusting your budget, selecting all property types, or resetting your search."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {filterByLocation && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setFilterByLocation(false)}
                className="bg-primary"
              >
                Show All Lahore Rentals
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset all
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="min-h-[28px] flex items-center justify-between mb-4">
            <p className="text-xs text-slate-500">
              Found <strong className="text-slate-900">{totalCount}</strong> rental{" "}
              {totalCount === 1 ? "space" : "spaces"}{" "}
              {filterByLocation ? `in ${activeArea}` : "across all listings"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, idx) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={idx < 3}
              />
            ))}
          </div>

          <div className="mt-8">
            <Pagination
              page={page}
              total={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => {
                setPage(p);
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
