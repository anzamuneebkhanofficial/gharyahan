import { create } from "zustand";
import { createClient, isSupabaseConfigured } from "../lib/supabase/client";

export const useFavoritesStore = create((set, get) => ({
  favorites: [],
  isLoading: false,

  fetchFavorites: async (userId) => {
    if (!userId || !isSupabaseConfigured()) return;
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("favorites")
        .select("property_id")
        .eq("tenant_id", userId);
      
      if (!error && data) {
        set({ favorites: data.map(f => f.property_id) });
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (propertyId, userId) => {
    if (!userId || !isSupabaseConfigured()) return;
    
    const { favorites } = get();
    const isFav = favorites.includes(propertyId);
    
    // Optimistic UI update
    if (isFav) {
      set({ favorites: favorites.filter((id) => id !== propertyId) });
    } else {
      set({ favorites: [...favorites, propertyId] });
    }

    try {
      const supabase = createClient();
      if (isFav) {
        await supabase
          .from("favorites")
          .delete()
          .eq("tenant_id", userId)
          .eq("property_id", propertyId);
      } else {
        await supabase
          .from("favorites")
          .insert({ tenant_id: userId, property_id: propertyId });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      // Revert optimistic update on failure
      if (isFav) {
        set({ favorites: [...favorites, propertyId] });
      } else {
        set({ favorites: favorites.filter((id) => id !== propertyId) });
      }
    }
  },

  isFavorite: (propertyId) => {
    return get().favorites.includes(propertyId);
  },

  clearFavorites: () => set({ favorites: [], isLoading: false }),
}));
