import { create } from "zustand";
import { createClient, isSupabaseConfigured } from "../lib/supabase/client";
import { useFavoritesStore } from "./useFavoritesStore";
import { useLocationStore } from "./useLocationStore";

export const useAuthStore = create((set, get) => ({
  user: null, // Starts as null for guest / unauthorized visitors
  role: null, // 'tenant', 'landlord', or 'admin'
  isAuthenticated: false,
  isLoadingAuth: true,

  // Initialize auth state on mount (checks Supabase session or local storage)
  initAuth: async () => {
    let hadCachedUser = false;
    try {
      // 1. Instant Cache Hydration: Check if user session is stored in localStorage
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("gharyahan_demo_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.id || parsed.email)) {
              hadCachedUser = true;
              set({
                user: {
                  ...parsed,
                  full_name: parsed.full_name?.trim() || "User",
                  cnic: parsed.cnic?.trim() || "",
                  phone: parsed.phone?.trim() || "",
                  whatsapp_number: parsed.whatsapp_number?.trim() || parsed.phone?.trim() || "",
                },
                role: parsed.role || "tenant",
                isAuthenticated: true,
                isLoadingAuth: false,
              });

              if (parsed.area) {
                useLocationStore.getState().setManualLocation(parsed.area, null, parsed.city);
              }

              // Admin session is managed locally/server-side
              if (parsed.role === "admin") {
                return;
              }
            }
          } catch {
            // ignore JSON parse error
          }
        }
      }

      // 2. Background Fresh Verification via Supabase Auth
      const supabase = createClient();

      if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          const rawName = (profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User").trim();
          const resolvedUser = {
            id: user.id,
            email: user.email,
            full_name: rawName,
            phone: (profile?.phone || user.user_metadata?.phone || "")?.trim(),
            whatsapp_number: (profile?.whatsapp_number || user.user_metadata?.whatsapp_number || profile?.phone || user.user_metadata?.phone || "")?.trim(),
            cnic: (profile?.cnic || user.user_metadata?.cnic || "")?.trim(),
            role: profile?.role || user.user_metadata?.role || "tenant",
            city: profile?.city || user.user_metadata?.city || "Lahore",
            area: profile?.area || user.user_metadata?.area || "Singhpura",
            avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || "",
            email_confirmed_at: user.email_confirmed_at || null,
          };

          if (typeof window !== "undefined") {
            localStorage.setItem("gharyahan_demo_user", JSON.stringify(resolvedUser));
          }

          set({
            user: resolvedUser,
            role: resolvedUser.role,
            isAuthenticated: true,
            isLoadingAuth: false,
          });

          if (resolvedUser.area) {
            useLocationStore.getState().setManualLocation(resolvedUser.area, null, resolvedUser.city);
          }

          // Fetch favorites now that we are authenticated
          useFavoritesStore.getState().fetchFavorites(resolvedUser.id);
          
          return;
        } else if (hadCachedUser) {
          // If Supabase has no active session and user wasn't admin, clear stale auth
          const currentUser = get().user;
          if (currentUser?.role !== "admin") {
            if (typeof window !== "undefined") {
              localStorage.removeItem("gharyahan_demo_user");
            }
            set({ user: null, role: null, isAuthenticated: false, isLoadingAuth: false });
            useFavoritesStore.getState().clearFavorites();
            return;
          }
        }
      }
    } catch (err) {
      console.warn("Auth initialization check:", err);
    }

    if (!hadCachedUser) {
      set({ user: null, role: null, isAuthenticated: false, isLoadingAuth: false });
      useFavoritesStore.getState().clearFavorites();
    }
  },

  // Switch role (e.g. tenant becomes landlord to list a property per PRD §3)
  setRole: async (newRole) => {
    const currentUser = get().user;
    if (!currentUser) return;

    try {
      const supabase = createClient();
      if (isSupabaseConfigured() && supabase) {
        await supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", currentUser.id);
      }
    } catch {
      // ignore
    }

    const updated = { ...currentUser, role: newRole };
    if (typeof window !== "undefined") {
      localStorage.setItem("gharyahan_demo_user", JSON.stringify(updated));
    }

    set({
      role: newRole,
      user: updated,
    });
  },

  login: (userData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gharyahan_demo_user", JSON.stringify(userData));
      document.cookie = "gharyahan_user_session=true; path=/; max-age=604800; SameSite=Lax";
    }
    set({
      user: userData,
      role: userData.role || "tenant",
      isAuthenticated: true,
      isLoadingAuth: false,
    });
    
    if (userData?.area) {
      useLocationStore.getState().setManualLocation(userData.area, null, userData.city);
    }
    
    if (userData?.id) {
      useFavoritesStore.getState().fetchFavorites(userData.id);
    }
  },

  logout: async () => {
    if (typeof window !== "undefined") {
      document.cookie = "gharyahan_user_session=; path=/; max-age=0";
      localStorage.removeItem("gharyahan_demo_user");
    }

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }

    try {
      const supabase = createClient();
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // ignore
    }

    set({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoadingAuth: false,
    });
    useFavoritesStore.getState().clearFavorites();
  },
}));
