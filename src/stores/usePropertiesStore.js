import { create } from "zustand";
import { createClient, isSupabaseConfigured } from "../lib/supabase/client";

export const usePropertiesStore = create((set, get) => ({
  properties: [],
  landlords: [],
  tenants: [],
  isLoading: false,

  // Fetch initial data from Supabase
  fetchInitialData: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    if (!isSupabaseConfigured() || !supabase) {
      set({ isLoading: false });
      return;
    }

    try {
      // Fetch active properties with landlord profiles and images
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*, landlord:landlord_id(*), property_images(*)');

      if (propError) {
        console.error("Error fetching properties:", propError);
      }

      // Fetch all landlords
      const { data: landlords } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'landlord');

      // Fetch all tenants
      const { data: tenants } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'tenant');

      // Read cached user session for cross-referencing auth metadata (e.g. email/cnic)
      let cachedUser = null;
      if (typeof window !== "undefined") {
        try {
          cachedUser = JSON.parse(localStorage.getItem("gharyahan_demo_user") || "null");
        } catch {}
      }

      const sanitizedLandlords = (landlords || []).map((l) => {
        const isCurrent = cachedUser && cachedUser.id === l.id;
        return {
          ...l,
          full_name: (l.full_name || "Landlord").trim(),
          email: l.email || (isCurrent ? cachedUser.email : "") || "",
          phone: (l.phone || "").trim(),
          whatsapp_number: (l.whatsapp_number || l.phone || "").trim(),
          cnic: (l.cnic || (isCurrent ? cachedUser.cnic : "") || "").trim(),
          area: (l.area || "").trim(),
          city: (l.city || "Lahore").trim(),
        };
      });

      const sanitizedTenants = (tenants || []).map((t) => {
        const isCurrent = cachedUser && cachedUser.id === t.id;
        return {
          ...t,
          full_name: (t.full_name || "Tenant").trim(),
          email: t.email || (isCurrent ? cachedUser.email : "") || "",
          phone: (t.phone || "").trim(),
          whatsapp_number: (t.whatsapp_number || t.phone || "").trim(),
          cnic: (t.cnic || (isCurrent ? cachedUser.cnic : "") || "").trim(),
          area: (t.area || "").trim(),
          city: (t.city || "Lahore").trim(),
        };
      });

      const formattedProperties = (properties || []).map((p) => {
        const sortedImages = p.property_images && Array.isArray(p.property_images)
          ? [...p.property_images]
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((img) => img.storage_path)
          : [];
        return {
          ...p,
          images: sortedImages,
        };
      });

      set({
        properties: formattedProperties,
        landlords: sanitizedLandlords,
        tenants: sanitizedTenants,
        isLoading: false
      });
    } catch (err) {
      console.error("Error fetching initial data", err);
      set({ isLoading: false });
    }
  },

  // Add new property
  addProperty: async (propertyData) => {
    try {
      const supabase = createClient();
      if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: "Database not connected. Please verify your Supabase configuration." };
      }

      // 1. Resolve Landlord ID safely
      let landlordId = propertyData.landlord_id || propertyData.landlord?.id;
      if (!landlordId) {
        const { data: authData } = await supabase.auth.getUser();
        landlordId = authData?.user?.id;
      }

      if (!landlordId) {
        return { success: false, error: "User session expired or landlord ID missing. Please log in again." };
      }

      const newPropertyData = {
        landlord_id: landlordId,
        title: propertyData.title,
        description: propertyData.description,
        property_type: propertyData.property_type,
        bedrooms: Number(propertyData.bedrooms) || 1,
        bathrooms: Number(propertyData.bathrooms) || 1,
        has_electricity: propertyData.has_electricity !== undefined ? Boolean(propertyData.has_electricity) : true,
        has_gas: propertyData.has_gas !== undefined ? Boolean(propertyData.has_gas) : true,
        has_water: propertyData.has_water !== undefined ? Boolean(propertyData.has_water) : true,
        is_furnished: Boolean(propertyData.is_furnished),
        has_drainage: propertyData.has_drainage !== undefined ? Boolean(propertyData.has_drainage) : true,
        has_roof_leakage: Boolean(propertyData.has_roof_leakage),
        lease_duration: propertyData.lease_duration || "1 Year",
        has_discount: Boolean(propertyData.has_discount),
        discounted_price: propertyData.has_discount && propertyData.discounted_price ? Number(propertyData.discounted_price) : null,
        video_url: propertyData.video_url || "",
        rent_price: Number(propertyData.rent_price),
        deposit_amount: propertyData.deposit_amount ? Number(propertyData.deposit_amount) : null,
        city: propertyData.city || 'Lahore',
        area: propertyData.area,
        street_address: propertyData.street_address,
        status: propertyData.status || 'available',
        expected_vacancy_date: propertyData.expected_vacancy_date || null,
        lat: propertyData.lat || null,
        lng: propertyData.lng || null,
      };

      const { data: newProperty, error } = await supabase
        .from('properties')
        .insert([newPropertyData])
        .select('*, landlord:landlord_id(*)')
        .single();

      if (error || !newProperty) {
        console.error("Error adding property to Supabase:", error);
        return { success: false, error: error?.message || "Failed to add property record to database." };
      }

      // Also insert images if any
      const propertyImages = Array.isArray(propertyData.images) ? propertyData.images.filter(Boolean) : [];
      if (propertyImages.length > 0) {
        const imagesToInsert = propertyImages.map((url, i) => ({
          property_id: newProperty.id,
          storage_path: url,
          sort_order: i
        }));
        const { error: imageError } = await supabase.from('property_images').insert(imagesToInsert);
        if (imageError) {
          console.error("Error adding property images:", imageError);
          return {
            success: false,
            error: "Property was created, but failed to save attached images: " + imageError.message
          };
        }
      }

      const fullProperty = {
        ...newProperty,
        images: propertyImages,
      };

      set((state) => ({
        properties: [fullProperty, ...state.properties],
      }));

      return { success: true, data: fullProperty };
    } catch (err) {
      console.error("Unexpected failure in addProperty:", err);
      return { success: false, error: err.message || "An unexpected error occurred while saving the property." };
    }
  },

  // Update property with ownership validation
  updateProperty: async (id, updates, requestingUserId = null, isAdmin = false) => {
    try {
      const target = get().properties.find((p) => p.id === id);
      if (!target) return { success: false, error: "Property not found." };

      if (requestingUserId && !isAdmin && target.landlord?.id !== requestingUserId && target.landlord_id !== requestingUserId) {
        return { success: false, error: "Unauthorized: You can only edit your own properties." };
      }

      const supabase = createClient();
      if (!isSupabaseConfigured() || !supabase) return { success: false, error: "Supabase not configured." };

      // Separate images & landlord object from direct property table columns
      const { images: newImages, landlord: _landlord, ...propertyColumns } = updates;

      const { error } = await supabase
        .from('properties')
        .update(propertyColumns)
        .eq('id', id);

      if (error) {
        console.error("Error updating property in Supabase:", error);
        return { success: false, error: error.message };
      }

      // Synchronize property_images if images provided
      if (newImages && Array.isArray(newImages)) {
        await supabase.from('property_images').delete().eq('property_id', id);
        const validImages = newImages.filter(Boolean);
        if (validImages.length > 0) {
          const imagesToInsert = validImages.map((url, i) => ({
            property_id: id,
            storage_path: url,
            sort_order: i,
          }));
          const { error: imageErr } = await supabase.from('property_images').insert(imagesToInsert);
          if (imageErr) {
            console.warn("Failed to update images:", imageErr);
          }
        }
      }

      // Update in local Zustand state
      set((state) => ({
        properties: state.properties.map((p) =>
          p.id === id
            ? {
                ...p,
                ...propertyColumns,
                images: newImages || p.images,
                updated_at: new Date().toISOString()
              }
            : p
        ),
      }));

      return { success: true };
    } catch (err) {
      console.error("Error in updateProperty:", err);
      return { success: false, error: err.message || "Failed to update property." };
    }
  },

  // Fast 1-click status change: available, in_deal, sealed
  changeStatus: async (id, newStatus, requestingUserId = null, isAdmin = false) => {
    const target = get().properties.find((p) => p.id === id);
    if (!target) return false;

    if (requestingUserId && !isAdmin && target.landlord?.id !== requestingUserId && target.landlord_id !== requestingUserId) {
      return false;
    }

    // Optimistic update
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? { ...p, status: newStatus, updated_at: new Date().toISOString() } : p
      ),
    }));

    const supabase = createClient();
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('properties').update({ status: newStatus }).eq('id', id);
    }

    return true;
  },

  // Delete property with ownership validation
  deleteProperty: async (id, requestingUserId = null, isAdmin = false) => {
    const target = get().properties.find((p) => p.id === id);
    if (!target) return { success: false, error: "Property not found" };

    if (requestingUserId && !isAdmin && target.landlord?.id !== requestingUserId && target.landlord_id !== requestingUserId) {
      return { success: false, error: "Unauthorized: You can only delete your own properties." };
    }

    // Optimistic delete
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    }));

    const supabase = createClient();
    if (isSupabaseConfigured() && supabase) {
      // Explicitly delete associated images first to prevent orphaned resources
      await supabase.from('property_images').delete().eq('property_id', id);
      
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  },

  // Get specific property by ID from local state
  getPropertyById: (id) => {
    return get().properties.find((p) => p.id === id);
  },

  // Server-side optimized search & filtering with SQL pagination
  searchProperties: async (filters = {}) => {
    const supabase = createClient();
    if (!isSupabaseConfigured() || !supabase) {
      return { properties: [], totalCount: 0 };
    }

    const {
      searchTerm = "",
      activeArea = "",
      filterByLocation = false,
      selectedType = "all",
      selectedStatus = "all",
      minBudget = 0,
      maxBudget = null,
      minBedrooms = "all",
      hasDiscountOnly = false,
      sortBy = "newest",
      page = 1,
      pageSize = 9,
    } = filters;

    try {
      let query = supabase
        .from("properties")
        .select(`
          id,
          landlord_id,
          title,
          description,
          property_type,
          bedrooms,
          bathrooms,
          has_electricity,
          has_gas,
          has_water,
          is_furnished,
          has_drainage,
          has_roof_leakage,
          lease_duration,
          has_discount,
          discounted_price,
          video_url,
          rent_price,
          deposit_amount,
          status,
          expected_vacancy_date,
          city,
          area,
          street_address,
          lat,
          lng,
          created_at,
          updated_at,
          landlord:landlord_id(id, full_name, phone, whatsapp_number, avatar_url, city, area),
          property_images(storage_path, sort_order)
        `, { count: "exact" });

      // 1. Location filter
      if (filterByLocation && activeArea && activeArea !== "All Lahore" && activeArea !== "all") {
        query = query.ilike("area", `%${activeArea}%`);
      }

      // 2. Search term (title, description, area, street_address)
      if (searchTerm && searchTerm.trim()) {
        const cleanTerm = searchTerm.trim().replace(/[%_,()]/g, " ");
        if (cleanTerm.length > 0) {
          query = query.or(`title.ilike.%${cleanTerm}%,description.ilike.%${cleanTerm}%,area.ilike.%${cleanTerm}%,street_address.ilike.%${cleanTerm}%`);
        }
      }

      // 3. Property type
      if (selectedType && selectedType !== "all") {
        query = query.eq("property_type", selectedType);
      }

      // 4. Deal status
      if (selectedStatus === "available_only") {
        query = query.eq("status", "available");
      } else if (selectedStatus === "in_deal") {
        query = query.eq("status", "in_deal");
      } else if (selectedStatus === "vacancy_only") {
        query = query.not("expected_vacancy_date", "is", null);
      }

      // 5. Min Budget
      if (minBudget && Number(minBudget) > 0) {
        query = query.gte("rent_price", Number(minBudget));
      }

      // 6. Max Budget (only if specified and not unlimited / 0)
      if (maxBudget && Number(maxBudget) > 0 && Number(maxBudget) < 10000000) {
        query = query.lte("rent_price", Number(maxBudget));
      }

      // 7. Bedrooms
      if (minBedrooms && minBedrooms !== "all") {
        query = query.gte("bedrooms", Number(minBedrooms));
      }

      // 8. Discounted only
      if (hasDiscountOnly) {
        query = query.eq("has_discount", true);
      }

      // 9. Sorting
      if (sortBy === "price_asc") {
        query = query.order("rent_price", { ascending: true });
      } else if (sortBy === "price_desc") {
        query = query.order("rent_price", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // 10. Range / Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error("Error searching properties:", error);
        return { properties: [], totalCount: 0, error };
      }

      const formatted = (data || []).map((p) => {
        const sortedImages = p.property_images && Array.isArray(p.property_images)
          ? [...p.property_images]
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((img) => img.storage_path)
          : [];
        return {
          ...p,
          images: sortedImages,
        };
      });

      return { properties: formatted, totalCount: count || 0 };
    } catch (err) {
      console.error("searchProperties exception:", err);
      return { properties: [], totalCount: 0, error: err };
    }
  },

  // Fetch single property on demand by ID without downloading the full database
  fetchSingleProperty: async (id) => {
    if (!id) return null;
    const existing = get().properties.find((p) => p.id === id);
    if (existing && existing.images && existing.landlord) {
      return existing;
    }

    const supabase = createClient();
    if (!isSupabaseConfigured() || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          landlord:landlord_id(*),
          property_images(*)
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching single property:", error);
        return null;
      }

      const sortedImages = data.property_images && Array.isArray(data.property_images)
        ? [...data.property_images]
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((img) => img.storage_path)
        : [];

      const formatted = {
        ...data,
        images: sortedImages,
      };

      set((state) => ({
        properties: state.properties.some((p) => p.id === id)
          ? state.properties.map((p) => (p.id === id ? formatted : p))
          : [formatted, ...state.properties],
      }));

      return formatted;
    } catch (err) {
      console.error("fetchSingleProperty exception:", err);
      return null;
    }
  },

  // Fetch related properties in the same locality on demand
  fetchRelatedProperties: async (area, excludeId, limit = 3) => {
    const supabase = createClient();
    if (!isSupabaseConfigured() || !supabase || !area) return [];

    try {
      let query = supabase
        .from("properties")
        .select(`
          id,
          title,
          description,
          property_type,
          bedrooms,
          bathrooms,
          rent_price,
          has_discount,
          discounted_price,
          status,
          expected_vacancy_date,
          city,
          area,
          street_address,
          created_at,
          landlord:landlord_id(id, full_name, phone, whatsapp_number, avatar_url),
          property_images(storage_path, sort_order)
        `)
        .ilike("area", `%${area}%`);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query.limit(limit);
      if (error) {
        console.error("Error fetching related properties:", error);
        return [];
      }

      return (data || []).map((p) => {
        const sortedImages = p.property_images && Array.isArray(p.property_images)
          ? [...p.property_images]
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((img) => img.storage_path)
          : [];
        return {
          ...p,
          images: sortedImages,
        };
      });
    } catch (err) {
      console.error("fetchRelatedProperties exception:", err);
      return [];
    }
  },

  // Fetch only 6 featured and 3 upcoming vacancy properties for Home page
  fetchHomeProperties: async () => {
    const supabase = createClient();
    if (!isSupabaseConfigured() || !supabase) return;

    set({ isLoading: true });
    try {
      const [featuredRes, upcomingRes] = await Promise.all([
        supabase
          .from("properties")
          .select(`
            id,
            title,
            description,
            property_type,
            bedrooms,
            bathrooms,
            rent_price,
            has_discount,
            discounted_price,
            status,
            expected_vacancy_date,
            city,
            area,
            street_address,
            created_at,
            landlord:landlord_id(id, full_name, phone, whatsapp_number, avatar_url),
            property_images(storage_path, sort_order)
          `)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("properties")
          .select(`
            id,
            title,
            description,
            property_type,
            bedrooms,
            bathrooms,
            rent_price,
            has_discount,
            discounted_price,
            status,
            expected_vacancy_date,
            city,
            area,
            street_address,
            created_at,
            landlord:landlord_id(id, full_name, phone, whatsapp_number, avatar_url),
            property_images(storage_path, sort_order)
          `)
          .not("expected_vacancy_date", "is", null)
          .order("expected_vacancy_date", { ascending: true })
          .limit(3),
      ]);

      const formatList = (list) =>
        (list || []).map((p) => {
          const sortedImages = p.property_images && Array.isArray(p.property_images)
            ? [...p.property_images]
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((img) => img.storage_path)
            : [];
          return {
            ...p,
            images: sortedImages,
          };
        });

      const featured = formatList(featuredRes.data);
      const upcoming = formatList(upcomingRes.data);

      const mergedMap = new Map();
      featured.forEach((p) => mergedMap.set(p.id, p));
      upcoming.forEach((p) => mergedMap.set(p.id, p));

      set({
        properties: Array.from(mergedMap.values()),
        isLoading: false,
      });
    } catch (err) {
      console.error("fetchHomeProperties exception:", err);
      set({ isLoading: false });
    }
  },

  // Fetch landlord specific properties on demand
  fetchLandlordProperties: async (landlordId) => {
    if (!landlordId) return;
    const supabase = createClient();
    if (!isSupabaseConfigured() || !supabase) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          landlord:landlord_id(*),
          property_images(*)
        `)
        .eq("landlord_id", landlordId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching landlord properties:", error);
        set({ isLoading: false });
        return;
      }

      const formatted = (data || []).map((p) => {
        const sortedImages = p.property_images && Array.isArray(p.property_images)
          ? [...p.property_images]
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((img) => img.storage_path)
          : [];
        return {
          ...p,
          images: sortedImages,
        };
      });

      set((state) => {
        const otherProps = state.properties.filter((p) => p.landlord_id !== landlordId);
        return {
          properties: [...formatted, ...otherProps],
          isLoading: false,
        };
      });
    } catch (err) {
      console.error("fetchLandlordProperties exception:", err);
      set({ isLoading: false });
    }
  },

  // Filter properties belonging to a specific landlord from local state
  getPropertiesByLandlord: (landlordId) => {
    if (!landlordId) return [];
    return get().properties.filter((p) => p.landlord?.id === landlordId || p.landlord_id === landlordId);
  },

  // Admin Landlord Management: Delete Landlord and safely remove their properties
  deleteLandlord: async (landlordId) => {
    // Optimistic
    set((state) => ({
      landlords: state.landlords.filter((l) => l.id !== landlordId),
      properties: state.properties.filter((p) => p.landlord?.id !== landlordId && p.landlord_id !== landlordId),
    }));
    
    // In a real app we would call a secure admin API to delete the user entirely.
    // For now we just delete their profile (and cascade properties).
    const supabase = createClient();
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('profiles').delete().eq('id', landlordId);
    }
    return true;
  },

  // Admin Tenant Management: Delete Tenant
  deleteTenant: async (tenantId) => {
    // Optimistic
    set((state) => ({
      tenants: state.tenants.filter((t) => t.id !== tenantId),
    }));

    const supabase = createClient();
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('profiles').delete().eq('id', tenantId);
    }
    return true;
  },
}));
