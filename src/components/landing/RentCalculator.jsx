"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Info, Zap } from "lucide-react";
import { formatPKR } from "../../lib/utils";
import { LAHORE_AREAS } from "../../lib/location";

export default function RentCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState(120000);
  const [targetArea, setTargetArea] = useState("Gulberg");
  const [propertyType, setPropertyType] = useState("portion");
  const [familyMembers, setFamilyMembers] = useState(4);

  // Financial Calculations
  const stats = useMemo(() => {
    // 30% rule for healthy housing expense
    const recommendedMaxRent = Math.round(monthlyIncome * 0.30);
    const conservativeRent = Math.round(monthlyIncome * 0.25);
    const stretchRent = Math.round(monthlyIncome * 0.40);

    // Estimated Utilities based on property type & family size
    let baseUtility = 6000;
    if (propertyType === "house") baseUtility = 14000;
    else if (propertyType === "portion") baseUtility = 8000;
    else if (propertyType === "flat") baseUtility = 7000;
    else if (propertyType === "room") baseUtility = 3500;

    const utilityWithFamily = Math.round(baseUtility + (familyMembers - 2) * 1200);

    // Security deposit in Pakistan (typically 2 months advance rent)
    const securityDeposit = recommendedMaxRent * 2;

    // Total First Month Move-In Cost
    const firstMonthTotal = recommendedMaxRent + securityDeposit + utilityWithFamily;

    return {
      recommendedMaxRent,
      conservativeRent,
      stretchRent,
      estimatedUtilities: Math.max(utilityWithFamily, 3000),
      securityDeposit,
      firstMonthTotal,
    };
  }, [monthlyIncome, propertyType, familyMembers]);

  return (
    <section id="calculator" className="py-16 lg:py-24 bg-surface border-y border-border/70 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          
          {/* Left Column: Context & Inputs */}
          <div className="w-full lg:max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold border border-primary/20">
              <Calculator className="h-3.5 w-3.5" />
              Smart Rent Affordability Calculator
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Calculate the right rent for your budget
            </h2>

            <p className="text-sm sm:text-base text-muted leading-relaxed">
              In Pakistan&apos;s rental market, overspending on rent leaves families vulnerable to utility bill spikes. We calculate your recommended ceiling based on verified Lahore living expenses.
            </p>

            {/* Income Slider */}
            <div className="p-5 rounded-2xl bg-background border border-border space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="income-slider" className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Monthly Household Income
                </label>
                <span className="text-lg sm:text-xl font-black text-primary">
                  {formatPKR(monthlyIncome)}
                </span>
              </div>

              <input
                id="income-slider"
                type="range"
                min="30000"
                max="500000"
                step="5000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full h-2.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Monthly Household Income slider"
              />

              <div className="flex justify-between text-[10px] font-semibold text-muted">
                <span>PKR 30,000</span>
                <span>PKR 250,000</span>
                <span>PKR 500,000+</span>
              </div>

              {/* Quick preset buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[60000, 100000, 150000, 250000, 400000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMonthlyIncome(val)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
                      monthlyIncome === val
                        ? "bg-primary text-white border-primary"
                        : "bg-surface text-secondary border-border hover:bg-surface-2"
                    }`}
                  >
                    {val >= 100000 ? `${val / 100000} Lakh` : `${val / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Area & Space Type Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Desired Mohalla
                </label>
                <select
                  value={targetArea}
                  onChange={(e) => setTargetArea(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {LAHORE_AREAS.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Space Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="portion">Upper / Lower Portion</option>
                  <option value="house">Complete House</option>
                  <option value="flat">Apartment / Flat</option>
                  <option value="room">Single Room / Shared</option>
                </select>
              </div>
            </div>

            {/* Family Members / Occupants */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Number of Occupants ({familyMembers} persons)
              </label>
              <div className="flex gap-2">
                {[1, 2, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFamilyMembers(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                      familyMembers === num
                        ? "bg-primary text-white border-primary"
                        : "bg-background text-secondary border-border hover:bg-surface-2"
                    }`}
                  >
                    {num === 8 ? "8+" : num}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Calculation Result Card */}
          <div className="w-full lg:max-w-md">
            <div className="rounded-3xl bg-primary text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-emerald-800">
              {/* Background gradient embellishment */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                
                {/* Main Recommended Rent Result */}
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    Recommended Maximum Rent
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {formatPKR(stats.recommendedMaxRent)}
                    <span className="text-sm font-normal text-emerald-200"> / month</span>
                  </div>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Based on standard 30% rent-to-income ratio for {familyMembers} occupants in {targetArea}.
                  </p>
                </div>

                {/* Breakdown Tiles */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/15">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                    <span className="block text-[11px] font-semibold text-emerald-200">
                      Estimated Utilities
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                      {formatPKR(stats.estimatedUtilities)}
                    </span>
                    <span className="text-[10px] text-emerald-300/80">Wapda + Sui Gas + Water</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                    <span className="block text-[11px] font-semibold text-emerald-200">
                      Security Deposit
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                      {formatPKR(stats.securityDeposit)}
                    </span>
                    <span className="text-[10px] text-emerald-300/80">2 Months (Refundable)</span>
                  </div>
                </div>

                {/* Total Move-In Budget */}
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-200">
                    <span>Total Move-in Capital Needed:</span>
                    <span className="font-bold text-accent text-sm sm:text-base">
                      {formatPKR(stats.firstMonthTotal)}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-300/70 leading-normal">
                    Includes 1st month advance rent + 2 months security deposit + estimated 1st month utility reserves.
                  </p>
                </div>

                {/* CTA to Search matching listings */}
                <Link
                  href={`/search?area=${encodeURIComponent(targetArea)}&type=${propertyType}&maxBudget=${stats.recommendedMaxRent}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-accent hover:bg-accent-hover text-foreground font-extrabold text-sm transition-all shadow-md group cursor-pointer"
                >
                  <span>Explore Listings Up to {formatPKR(stats.recommendedMaxRent)}</span>
                  <ArrowRight className="h-4 w-4 text-foreground transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-200/90 text-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  <span>Zero brokerage fee saves you ~{formatPKR(stats.recommendedMaxRent)} upfront!</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
