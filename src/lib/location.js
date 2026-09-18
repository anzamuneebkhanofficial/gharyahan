/**
 * GharYahan Hyperlocal Location Module
 * Handles GPS Geolocation, Nominatim Reverse-Geocoding with client-side cache & rate limit,
 * Lahore area taxonomy reference, and Haversine distance calculations.
 */

export const LAHORE_AREAS = [
  {
    id: "singhpura",
    name: "Singhpura",
    city: "Lahore",
    lat: 31.5911,
    lng: 74.3822,
    mohallas: ["Main Bazaar", "Baghbanpura Road", "Nishat Road", "Kot Khawaja Saeed"],
  },
  {
    id: "bhagwanpura",
    name: "Bhagwanpura",
    city: "Lahore",
    lat: 31.5982,
    lng: 74.3791,
    mohallas: ["Mohalla Shahi", "Daroghawala", "G.T. Road Link", "Salamatpura"],
  },
  {
    id: "gulberg",
    name: "Gulberg",
    city: "Lahore",
    lat: 31.5204,
    lng: 74.3587,
    mohallas: ["Gulberg II", "Gulberg III", "Main Market", "Ghalib Market", "Gurumangat Road"],
  },
  {
    id: "model-town",
    name: "Model Town",
    city: "Lahore",
    lat: 31.4855,
    lng: 74.3264,
    mohallas: ["Block A", "Block B", "Block C", "Block K", "Block M", "Model Town Link Road"],
  },
  {
    id: "johar-town",
    name: "Johar Town",
    city: "Lahore",
    lat: 31.4697,
    lng: 74.2728,
    mohallas: ["Phase 1 - Block G", "Phase 1 - Block R", "Phase 2 - Block J", "Allah Hoo Chowk", "Shaukat Khanum Vicinity"],
  },
  {
    id: "dha",
    name: "DHA (Defence)",
    city: "Lahore",
    lat: 31.4805,
    lng: 74.4098,
    mohallas: ["Phase 1 - Sector H", "Phase 3 - Y Block", "Phase 5 - Sector C", "Phase 6 - Main Boulevard"],
  },
  {
    id: "shadman",
    name: "Shadman",
    city: "Lahore",
    lat: 31.5385,
    lng: 74.3195,
    mohallas: ["Shadman 1", "Shadman 2", "Jail Road Border", "Canal Park"],
  },
  {
    id: "iqbal-town",
    name: "Allama Iqbal Town",
    city: "Lahore",
    lat: 31.5057,
    lng: 74.2854,
    mohallas: ["Moon Market", "Kashmir Block", "Hunza Block", "Raza Block"],
  },
  {
    id: "faisal-town",
    name: "Faisal Town",
    city: "Lahore",
    lat: 31.4800,
    lng: 74.3012,
    mohallas: ["Block A", "Block B", "Block C", "Kotha Pind Link"],
  },
  {
    id: "walled-city",
    name: "Walled City (Androon Lahore)",
    city: "Lahore",
    lat: 31.5881,
    lng: 74.3150,
    mohallas: ["Delhi Gate", "Bhati Gate", "Mochi Gate", "Shah Alam Market"],
  }
];

// In-memory cache for reverse geocoding to respect OSM Nominatim rate limit
const geocodeCache = new Map();

/**
 * Request coordinates: First attempts browser HTML5 Geolocation (fast timeout).
 * If hardware GPS times out, is unavailable, or permission is denied,
 * seamlessly falls back to Network IP Geolocation so the user is never stuck.
 */
export async function getCurrentPositionAsync(options = {}) {
  // 1. Try browser HTML5 Geolocation with a reasonable 4s timeout and low accuracy first
  if (typeof window !== "undefined" && navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false, // low accuracy works on WiFi / desktops without GPS hardware
            timeout: 4000,
            maximumAge: 120000,
            ...options,
          }
        );
      });

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        source: "gps",
      };
    } catch (geoErr) {
      console.warn("Browser GPS unavailable or timed out, falling back to Network IP:", geoErr?.message);
    }
  }

  // 2. Seamless fallback: Network IP Geolocation via internal server endpoint
  try {
    const res = await fetch("/api/geocode/ip");
    if (res.ok) {
      const ipData = await res.json();
      if (ipData.success && ipData.lat && ipData.lng) {
        return {
          lat: ipData.lat,
          lng: ipData.lng,
          accuracy: 5000,
          source: "network-ip",
          city: ipData.city,
          area: ipData.area,
          displayName: ipData.displayName,
        };
      }
    }
  } catch (ipErr) {
    console.warn("IP Geolocation endpoint fallback error:", ipErr);
  }

  // 3. Direct client fallback to ipwho.is if internal route is inaccessible
  if (typeof window !== "undefined") {
    try {
      const directRes = await fetch("https://ipwho.is/");
      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData.success && directData.latitude && directData.longitude) {
          const city = directData.city || directData.region || "Lahore";
          return {
            lat: directData.latitude,
            lng: directData.longitude,
            accuracy: 5000,
            source: "network-ip",
            city,
            area: city,
            displayName: `${city}, ${directData.region || "Pakistan"}`,
          };
        }
      }
    } catch (directErr) {
      console.warn("Direct IP fallback error:", directErr);
    }
  }

  // 4. Default coordinates for Pakistan (Lahore center)
  return {
    lat: 31.5204,
    lng: 74.3587,
    accuracy: 10000,
    source: "default",
    city: "Lahore",
    area: "Lahore",
    displayName: "Lahore, Pakistan",
  };
}

export const PAKISTAN_POPULAR_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Abbottabad",
];

export const PAKISTAN_POPULAR_AREAS = [
  // Lahore
  { name: "Singhpura", city: "Lahore" },
  { name: "Bhagwanpura", city: "Lahore" },
  { name: "Gulberg", city: "Lahore" },
  { name: "Model Town", city: "Lahore" },
  { name: "Johar Town", city: "Lahore" },
  { name: "DHA (Defence)", city: "Lahore" },
  { name: "Bahria Town", city: "Lahore" },
  { name: "Shadman", city: "Lahore" },
  { name: "Allama Iqbal Town", city: "Lahore" },
  // Karachi
  { name: "Clifton", city: "Karachi" },
  { name: "DHA", city: "Karachi" },
  { name: "Gulshan-e-Iqbal", city: "Karachi" },
  { name: "North Nazimabad", city: "Karachi" },
  { name: "PECHS", city: "Karachi" },
  { name: "Bahria Town", city: "Karachi" },
  // Islamabad
  { name: "F-10", city: "Islamabad" },
  { name: "F-11", city: "Islamabad" },
  { name: "G-11", city: "Islamabad" },
  { name: "G-13", city: "Islamabad" },
  { name: "Blue Area", city: "Islamabad" },
  { name: "Bahria Town", city: "Islamabad" },
  { name: "DHA", city: "Islamabad" },
  // Rawalpindi
  { name: "Saddar", city: "Rawalpindi" },
  { name: "Satellite Town", city: "Rawalpindi" },
  { name: "Westridge", city: "Rawalpindi" },
  { name: "Bahria Town", city: "Rawalpindi" },
];

/**
 * Reverse geocode lat/lng to neighborhood and city using our secure server endpoint
 * with client-side cache
 */
export async function reverseGeocode(lat, lng) {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // Check localStorage cache
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`geo_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        geocodeCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {
      // ignore storage errors
    }
  }

  try {
    const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
    if (!res.ok) {
      throw new Error(`Server geocode error: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Geocoding failed");
    }

    const result = {
      displayName: data.displayName || data.area,
      area: data.area || "Current Location",
      city: data.city || "Pakistan",
      lat,
      lng,
    };

    geocodeCache.set(cacheKey, result);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`geo_${cacheKey}`, JSON.stringify(result));
      } catch {
        // ignore
      }
    }

    return result;
  } catch (err) {
    console.warn("API geocode failed, evaluating coordinate proximity:", err);
    // If coordinates are reasonably near Lahore (approx 35km radius from 31.52, 74.35)
    const distToLahore = calculateDistanceKm(lat, lng, 31.5204, 74.3587);
    if (distToLahore !== null && distToLahore < 35) {
      const closest = findClosestLahoreArea(lat, lng);
      return {
        displayName: `${closest.name}, Lahore`,
        area: closest.name,
        city: "Lahore",
        lat,
        lng,
        isFallback: true,
      };
    }

    // Otherwise return coordinates-based fallback without forcing Lahore
    return {
      displayName: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
      area: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
      city: "Pakistan",
      lat,
      lng,
      isFallback: true,
    };
  }
}

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place (e.g. 1.2 km)
}

/**
 * Find the closest pre-seeded Lahore area given lat and lng
 */
export function findClosestLahoreArea(lat, lng) {
  let closest = LAHORE_AREAS[0];
  let minDistance = Infinity;

  for (const area of LAHORE_AREAS) {
    const dist = calculateDistanceKm(lat, lng, area.lat, area.lng);
    if (dist !== null && dist < minDistance) {
      minDistance = dist;
      closest = area;
    }
  }

  return { ...closest, distanceKm: minDistance };
}
