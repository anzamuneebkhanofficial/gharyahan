import { create } from "zustand";
import { getCurrentPositionAsync, reverseGeocode } from "../lib/location";

export const useLocationStore = create((set, get) => ({
  userCoords: { lat: 31.5911, lng: 74.3822 }, // Initial default: Singhpura, Lahore
  activeArea: "Singhpura",
  activeCity: "Lahore",
  isDetecting: false,
  detectionError: null,
  isModalOpen: false,

  openLocationModal: () => set({ isModalOpen: true }),
  closeLocationModal: () => set({ isModalOpen: false }),

  // Reset location to default upon logout, attempt to detect actual device location
  resetLocation: async () => {
    // Immediately clear to default so the old user's location is gone
    set({
      userCoords: { lat: 31.5911, lng: 74.3822 },
      activeArea: "Lahore Area",
      activeCity: "Lahore"
    });
    
    // Attempt to silently auto-detect public location
    try {
      const coords = await getCurrentPositionAsync();
      const geoResult = await reverseGeocode(coords.lat, coords.lng);
      set({
        userCoords: { lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy },
        activeArea: geoResult.area || "Lahore Area",
        activeCity: geoResult.city || "Lahore",
      });
    } catch {
      console.warn("Public auto-detect failed, using fallback.");
      // Fallback is already set
    }
  },

  // Set manual location
  setManualLocation: (areaName, coords = null, cityName = null) => {
    let finalCoords = coords;
    if (!finalCoords) {
      finalCoords = { lat: 31.5204, lng: 74.3587 };
    }
    set({
      activeArea: areaName,
      activeCity: cityName || get().activeCity || "Pakistan",
      userCoords: finalCoords,
      detectionError: null,
      isModalOpen: false,
    });
  },

  // Smart Location Auto-detection (GPS + Network IP fallback)
  detectLocation: async () => {
    set({ isDetecting: true, detectionError: null });
    try {
      const coords = await getCurrentPositionAsync();
      let displayName = coords.displayName;
      let area = coords.area || coords.city || "Lahore";
      let city = coords.city || "Pakistan";

      if (!displayName || coords.source === "gps") {
        try {
          const geoResult = await reverseGeocode(coords.lat, coords.lng);
          if (geoResult?.displayName) {
            displayName = geoResult.displayName;
            area = geoResult.area;
            city = geoResult.city;
          }
        } catch {
          // fallback to coords
        }
      }

      set({
        userCoords: { lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy },
        activeArea: area,
        activeCity: city,
        isDetecting: false,
        detectionError: null,
      });

      return {
        success: true,
        area,
        city,
        displayName: displayName || `${area}, ${city}`,
        coords,
      };
    } catch {
      set({
        isDetecting: false,
        detectionError: null,
      });
      return { success: true, area: "Lahore", city: "Lahore", displayName: "Lahore, Pakistan" };
    }
  },
}));
