"use client";

import { forwardRef, useState } from "react";
import { Navigation, MapPin, Check, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { getCurrentPositionAsync, reverseGeocode, PAKISTAN_POPULAR_CITIES, PAKISTAN_POPULAR_AREAS } from "../../lib/location";
import { toast } from "sonner";

const LocationInput = forwardRef(
  (
    {
      label = "City & Area / Locality",
      placeholder = "e.g. Singhpura, Lahore or Gulshan, Karachi",
      value,
      defaultValue,
      onChange,
      onLocationDetected,
      error,
      helperText,
      id,
      name,
      className,
      showQuickTags = true,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value !== undefined ? value : (defaultValue || ""));
    const [isDetecting, setIsDetecting] = useState(false);
    const [gpsDetectedBadge, setGpsDetectedBadge] = useState(null);

    const inputId = id || (name ? name : "location-input");
    const datalistId = `${inputId}-suggestions`;

    // Keep internal state in sync if controlled
    const effectiveValue = value !== undefined ? value : inputValue;

    const handleInputChange = (e) => {
      const val = e.target.value;
      setInputValue(val);
      if (gpsDetectedBadge && val !== gpsDetectedBadge) {
        setGpsDetectedBadge(null);
      }
      if (onChange) {
        onChange(e);
      }
    };

    const handleSelectTag = (tagName) => {
      if (disabled || isDetecting) return;
      setInputValue(tagName);
      setGpsDetectedBadge(null);
      if (onChange) {
        // Create synthetic event for react-hook-form or standard handlers
        const syntheticEvent = {
          target: { name: name || inputId, value: tagName },
        };
        onChange(syntheticEvent);
      }
      if (onLocationDetected) {
        onLocationDetected({
          area: tagName,
          city: tagName.includes(",") ? tagName.split(",")[1].trim() : "Pakistan",
          displayName: tagName,
        });
      }
    };

    const handleDetectGPS = async () => {
      if (disabled || isDetecting) return;
      setIsDetecting(true);

      try {
        const coords = await getCurrentPositionAsync();
        let detectedName = coords.displayName;
        let detectedArea = coords.area || coords.city || "Lahore";
        let detectedCity = coords.city || "Pakistan";

        if (!detectedName || coords.source === "gps") {
          try {
            const geoResult = await reverseGeocode(coords.lat, coords.lng);
            if (geoResult?.displayName) {
              detectedName = geoResult.displayName;
              detectedArea = geoResult.area;
              detectedCity = geoResult.city;
            }
          } catch (geoErr) {
            console.warn("Reverse geocode fallback to coords display:", geoErr);
          }
        }

        if (!detectedName) {
          detectedName = `${detectedArea}, ${detectedCity}`;
        }

        setInputValue(detectedName);
        setGpsDetectedBadge(detectedName);

        if (onChange) {
          const syntheticEvent = {
            target: { name: name || inputId, value: detectedName },
          };
          onChange(syntheticEvent);
        }

        if (onLocationDetected) {
          onLocationDetected({
            area: detectedArea,
            city: detectedCity,
            displayName: detectedName,
            lat: coords.lat,
            lng: coords.lng,
          });
        }

        const label = coords.source === "gps" ? "GPS Location detected" : "Location detected";
        toast.success(`${label}: ${detectedName}`);
      } catch (err) {
        console.warn("Location detection notice:", err);
        toast.error("Could not auto-detect location. Please type your location manually or pick from quick tags.");
      } finally {
        setIsDetecting(false);
      }
    };

    // Combined list of datalist options
    const suggestionList = [
      ...PAKISTAN_POPULAR_CITIES,
      ...PAKISTAN_POPULAR_AREAS.map((a) => `${a.name}, ${a.city}`),
    ];

    // Popular quick tags to render
    const quickTags = [
      "Lahore",
      "Karachi",
      "Islamabad",
      "Rawalpindi",
      "Singhpura, Lahore",
      "Gulberg, Lahore",
      "DHA, Lahore",
      "Gulshan, Karachi",
    ];

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-foreground"
            >
              {label}
            </label>
            <span className="text-[11px] text-muted hidden sm:inline">
              Type manually or use GPS
            </span>
          </div>
        )}

        <div className="relative">
          {/* Leading Icon */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
            <MapPin className="h-4 w-4 text-emerald-700" />
          </div>

          {/* Location Input with Datalist */}
          <input
            id={inputId}
            name={name}
            ref={ref}
            type="text"
            list={datalistId}
            value={effectiveValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled || isDetecting}
            className={cn(
              "w-full rounded-xl border border-border bg-surface pl-10 pr-28 py-2.5 text-foreground placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm min-h-[48px]",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              disabled && "opacity-60 cursor-not-allowed bg-slate-50",
              className
            )}
            {...props}
          />

          {/* HTML5 Datalist for autocomplete while keeping free typing */}
          <datalist id={datalistId}>
            {suggestionList.map((item, idx) => (
              <option key={`${item}-${idx}`} value={item} />
            ))}
          </datalist>

          {/* Integrated GPS Auto-Detect Button */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={disabled || isDetecting}
            title="Auto-detect current location via GPS"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-light text-primary hover:bg-primary hover:text-white border border-primary/20 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Navigation className="h-3.5 w-3.5 text-amber-500" />
                <span>Auto GPS</span>
              </>
            )}
          </button>
        </div>

        {/* GPS Verified Status Badge */}
        {gpsDetectedBadge && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg w-fit animate-in fade-in duration-200">
            <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span>GPS Verified: {gpsDetectedBadge}</span>
          </div>
        )}

        {/* Quick Location Tags */}
        {showQuickTags && (
          <div className="pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Quick:
              </span>
              {quickTags.map((tag) => {
                const isSelected = effectiveValue.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors border cursor-pointer",
                      isSelected
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-surface text-secondary border-border hover:bg-background hover:text-foreground"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>}

        {/* Helper text */}
        {helperText && !error && (
          <p className="text-xs text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

LocationInput.displayName = "LocationInput";
export default LocationInput;
