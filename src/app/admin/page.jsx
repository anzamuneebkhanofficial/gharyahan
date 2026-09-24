"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  CheckCircle2,
  Clock,
  Lock,
  Trash2,
  ExternalLink,
  Plus,
  Users,
  Building2,
  Eye,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Heart,
} from "lucide-react";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/listings/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import { usePropertiesStore } from "../../stores/usePropertiesStore";
import { LAHORE_AREAS } from "../../lib/location";
import { formatPKR } from "../../lib/utils";
import AdminSkeleton from "../../components/skeletons/AdminSkeleton";
import { toast } from "sonner";

const PAGE_SIZE = 12;

function formatLocationDisplay(area, city) {
  if (!area) return city ? `${city}` : "Lahore";
  if (city && area.toLowerCase().includes(city.toLowerCase())) return area;
  return `${area}${city ? `, ${city}` : ""}`;
}

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const {
    properties,
    landlords,
    tenants,
    changeStatus,
    deleteProperty,
    deleteLandlord,
    deleteTenant,
    getPropertiesByLandlord,
    fetchInitialData,
  } = usePropertiesStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const [areasList, setAreasList] = useState(LAHORE_AREAS);
  const [tablePage, setTablePage] = useState(1);

  // Modals state
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [landlordPropertiesPage, setLandlordPropertiesPage] = useState(1);
  const [landlordToDelete, setLandlordToDelete] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Statistics
  const totalListings = properties.length;
  const totalLandlords = landlords.length;
  const totalTenants = tenants.length;
  const availableCount = properties.filter((p) => p.status === "available").length;
  const inDealCount = properties.filter((p) => p.status === "in_deal").length;
  const sealedCount = properties.filter((p) => p.status === "sealed").length;

  const isLoading = usePropertiesStore((state) => state.isLoading);

  const paginatedProperties = properties.slice(
    (tablePage - 1) * PAGE_SIZE,
    tablePage * PAGE_SIZE
  );

  const {
    register: registerArea,
    handleSubmit: handleAreaSubmit,
    reset: resetArea,
  } = useForm({
    defaultValues: {
      newAreaName: ""
    }
  });

  const handleAddArea = (data) => {
    const trimmed = data.newAreaName.trim();
    if (!trimmed) return;
    const newEntry = {
      id: trimmed.toLowerCase().replace(/\s+/g, "-"),
      name: trimmed,
      city: "Lahore",
      lat: 31.5204,
      lng: 74.3587,
      mohallas: ["Main Bazaar", "Block 1"],
    };
    setAreasList((prev) => [...prev, newEntry]);
    resetArea();
    toast.success(`Added locality: ${trimmed}`);
  };

  if (isLoading) {
    return <AdminSkeleton />;
  }

  const handleConfirmDeleteProperty = () => {
    if (!propertyToDelete) return;
    deleteProperty(propertyToDelete.id, null, true);
    toast.success(`Listing "${propertyToDelete.title}" deleted.`);
    setPropertyToDelete(null);
  };

  const handleConfirmDeleteLandlord = () => {
    if (!landlordToDelete) return;
    deleteLandlord(landlordToDelete.id);
    toast.success(`Landlord "${landlordToDelete.full_name}" and associated listings removed.`);
    setLandlordToDelete(null);
  };

  const handleConfirmDeleteTenant = () => {
    if (!tenantToDelete) return;
    deleteTenant(tenantToDelete.id);
    toast.success(`Tenant "${tenantToDelete.full_name}" removed from platform.`);
    setTenantToDelete(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-7 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light border border-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Master Platform Administration
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-secondary mt-1.5 ml-12">
            Complete management, monitoring, landlord/tenant controls, and inventory oversight.
          </p>
        </div>
      </div>

      {/* Top Universal Monitoring Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Properties */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Properties</span>
            <div className="h-6 w-6 rounded-md bg-primary-light/60 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground tabular-nums">{totalListings}</div>
          <p className="text-[11px] text-secondary mt-1 font-medium">Total inventory</p>
        </div>

        {/* Landlords */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Landlords</span>
            <div className="h-6 w-6 rounded-md bg-primary-light/60 flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground tabular-nums">{totalLandlords}</div>
          <p className="text-[11px] text-secondary mt-1 font-medium">Verified owners</p>
        </div>

        {/* Tenants */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Tenants</span>
            <div className="h-6 w-6 rounded-md bg-primary-light/60 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground tabular-nums">{totalTenants}</div>
          <p className="text-[11px] text-secondary mt-1 font-medium">Active seekers</p>
        </div>

        {/* Available */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Available</span>
            <div className="h-6 w-6 rounded-md bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 tabular-nums">{availableCount}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Ready for visits</p>
        </div>

        {/* In Deal */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-t-2 border-t-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">In Deal</span>
            <div className="h-6 w-6 rounded-md bg-amber-50 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800 tabular-nums">{inDealCount}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Negotiations</p>
        </div>

        {/* Sealed */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-t-2 border-t-slate-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Sealed</span>
            <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center">
              <Lock className="h-3.5 w-3.5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 tabular-nums">{sealedCount}</div>
          <p className="text-[11px] text-slate-600 font-medium mt-1">Rented out</p>
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW ──────────────────────────────────────────────── */}
      {currentTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2.5 text-secondary mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light border border-primary/20">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Landlord Management Hub</h3>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  Monitor {totalLandlords} registered landlords, review their uploaded properties, check contact numbers, or safely remove accounts.
                </p>
              </div>
              <Button
                onClick={() => router.push("/admin?tab=landlords")}
                variant="outline"
                size="sm"
                className="self-start text-xs border-border font-bold hover:bg-surface-2"
              >
                Manage Landlords
              </Button>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2.5 text-secondary mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light border border-primary/20">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Tenant Management Hub</h3>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  Monitor {totalTenants} active tenants, inspect their selected locations, saved property activity, and maintain user directory integrity.
                </p>
              </div>
              <Button
                onClick={() => router.push("/admin?tab=tenants")}
                variant="outline"
                size="sm"
                className="self-start text-xs border-border font-bold hover:bg-surface-2"
              >
                Manage Tenants
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: LANDLORD MANAGEMENT ───────────────────────────────────── */}
      {currentTab === "landlords" && (
        <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Landlords Directory</h2>
              <p className="text-xs text-secondary mt-0.5">
                Full platform landlords overview, profile inspection, and removal.
              </p>
            </div>
            <span className="text-xs font-semibold text-muted bg-background px-2.5 py-1 rounded-lg">
              {landlords.length} Landlords
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-background border-b border-border/50 text-[11px] font-bold text-secondary uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-5">Landlord</th>
                  <th scope="col" className="py-3 px-5">Location</th>
                  <th scope="col" className="py-3 px-5">Contact</th>
                  <th scope="col" className="py-3 px-5">Properties</th>
                  <th scope="col" className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {landlords.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-secondary font-medium">
                      No landlords found in the database.
                    </td>
                  </tr>
                ) : (
                  landlords.map((l) => {
                    const landlordProps = getPropertiesByLandlord(l.id);
                    return (
                      <tr key={l.id} className="hover:bg-background/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-full overflow-hidden bg-background shrink-0 border border-border">
                            {l.avatar_url ? (
                              <Image src={l.avatar_url} alt="" fill sizes="36px" className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-secondary text-xs bg-primary/10 select-none">
                                {l.full_name?.trim()?.[0]?.toUpperCase() || "L"}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-sm">{l.full_name?.trim()}</div>
                            <div className="text-[11px] text-muted">{l.email || "No email"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-medium text-foreground">
                        {formatLocationDisplay(l.area, l.city)}
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="text-foreground font-semibold">{l.phone || l.whatsapp_number}</div>
                        <div className="text-[10px] text-primary font-medium">WhatsApp Enabled</div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center rounded-lg bg-primary-light border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary">
                          {landlordProps.length} Listed
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLandlord(l);
                              setLandlordPropertiesPage(1);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-background transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted" />
                            <span>View Profile</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setLandlordToDelete(l)}
                            className="p-1.5 rounded-lg text-muted hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete landlord"
                            aria-label="Delete landlord"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: TENANT MANAGEMENT ─────────────────────────────────────── */}
      {currentTab === "tenants" && (
        <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Tenants Directory</h2>
              <p className="text-xs text-secondary mt-0.5">
                Full platform tenants overview, location preferences, and account management.
              </p>
            </div>
            <span className="text-xs font-semibold text-muted bg-background px-2.5 py-1 rounded-lg">
              {tenants.length} Tenants
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-background border-b border-border/50 text-[11px] font-bold text-secondary uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-5">Tenant</th>
                  <th scope="col" className="py-3 px-5">Preferred Area</th>
                  <th scope="col" className="py-3 px-5">Contact</th>
                  <th scope="col" className="py-3 px-5">Saved Activity</th>
                  <th scope="col" className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-secondary font-medium">
                      No tenants found in the database.
                    </td>
                  </tr>
                ) : (
                  tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-background/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 rounded-full overflow-hidden bg-background shrink-0 border border-border">
                          {t.avatar_url ? (
                            <Image src={t.avatar_url} alt="" fill sizes="36px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-secondary text-xs">
                              {t.full_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm">{t.full_name}</div>
                          <div className="text-[11px] text-muted">{t.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="inline-flex items-center gap-1 rounded-lg bg-primary-light border border-primary/20 px-2 py-1 text-xs font-bold text-primary">
                        <MapPin className="h-3 w-3 text-secondary" />
                        <span>{t.area || "Singhpura"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="text-foreground font-semibold">{t.phone || "No phone"}</div>
                      <div className="text-[10px] text-muted">Direct Contact</div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 text-secondary font-medium">
                        <Heart className="h-3.5 w-3.5 text-rose-500" />
                        <span>{t.saved_favorites_count || 0} Favorites</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTenant(t)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-background transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-muted" />
                          <span>View Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTenantToDelete(t)}
                          className="p-1.5 rounded-lg text-muted hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete tenant"
                          aria-label="Delete tenant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: PROPERTY MODERATION ──────────────────────────────────── */}
      {currentTab === "moderation" && (
        <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Moderation Queue</h2>
              <p className="text-xs text-secondary mt-0.5">
                Oversight of all active rental inventory across Lahore.
              </p>
            </div>
            <span className="text-xs text-muted">
              Showing {paginatedProperties.length} of {properties.length} listings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-background border-b border-border/50 text-[11px] font-bold text-secondary uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-5">Listing Title & Area</th>
                  <th scope="col" className="py-3 px-5">Rent & Terms</th>
                  <th scope="col" className="py-3 px-5">Status</th>
                  <th scope="col" className="py-3 px-5">Landlord</th>
                  <th scope="col" className="py-3 px-5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProperties.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-secondary font-medium">
                      No properties found in the database.
                    </td>
                  </tr>
                ) : (
                  paginatedProperties.map((p) => (
                    <tr key={p.id} className="hover:bg-background/80 transition-colors">
                    <td className="py-3.5 px-5 max-w-[280px]">
                      <div className="font-bold text-foreground truncate">{p.title}</div>
                      <div className="text-[11px] text-muted mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span>{p.area}, Lahore · {p.property_type}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-bold text-foreground tabular-nums whitespace-nowrap">
                      {p.has_discount && p.discounted_price ? (
                        <div>
                          <span className="text-primary">{formatPKR(p.discounted_price)}</span>
                          <span className="text-[11px] line-through text-muted ml-1.5 font-normal">
                            {formatPKR(p.rent_price)}
                          </span>
                        </div>
                      ) : (
                        formatPKR(p.rent_price)
                      )}
                      <span className="text-[10px] text-muted font-normal"> /mo</span>
                    </td>

                    <td className="py-3.5 px-5">
                      <StatusBadge status={p.status} expectedVacancyDate={p.expected_vacancy_date} />
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-foreground">{p.landlord?.full_name || "Owner"}</div>
                      <div className="text-[11px] text-muted">{p.landlord?.phone}</div>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={p.status}
                          onChange={(e) => {
                            changeStatus(p.id, e.target.value, null, true);
                            toast.success(`Status changed to ${e.target.value}`);
                          }}
                          className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#0D382B]/20 cursor-pointer"
                        >
                          <option value="available">Available</option>
                          <option value="in_deal">In Deal</option>
                          <option value="sealed">Sealed</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => router.push(`/listing/${p.id}`)}
                          className="p-1.5 rounded-lg text-muted hover:bg-background hover:text-foreground transition-colors"
                          title="View public listing"
                          aria-label="View public listing"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPropertyToDelete(p)}
                          className="p-1.5 rounded-lg text-muted hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete listing"
                          aria-label="Delete listing"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))
                }
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-border/50">
            <Pagination
              page={tablePage}
              total={properties.length}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => setTablePage(p)}
            />
          </div>
        </div>
      )}

      {/* ── TAB 5: LOCALITY TAXONOMY ────────────────────────────────────── */}
      {currentTab === "taxonomy" && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Lahore Neighborhood & Locality Taxonomy
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              {areasList.length} active areas. Add new mohallas or towns to extend hyperlocal search.
            </p>
          </div>

          <form onSubmit={handleAreaSubmit(handleAddArea)} className="flex gap-2 max-w-sm">
            <input
              type="text"
              {...registerArea("newAreaName", { required: true })}
              placeholder="e.g. Garhi Shahu, Mughalpura…"
              className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:bg-surface focus:outline-none focus:ring-2 focus:ring-[#0D382B]/20"
            />
            <Button type="submit" variant="primary" size="sm" className="gap-1 shrink-0 font-bold shadow-sm">
              <Plus className="h-4 w-4" />
              Add Locality
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {areasList.map((a) => (
              <span
                key={a.id}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground font-semibold flex items-center gap-1.5"
              >
                <MapPin className="h-3 w-3 text-primary" />
                {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW LANDLORD PROFILE ─────────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedLandlord)}
        onClose={() => setSelectedLandlord(null)}
        title={selectedLandlord?.full_name || "Landlord Profile"}
        description="Comprehensive landlord details and associated properties."
        maxWidth="max-w-2xl"
      >
        {selectedLandlord && (
          <div className="space-y-6">
            {/* Landlord Header */}
            <div className="flex items-center gap-4 border-b border-border/50 pb-4">
              <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-background border border-border shrink-0">
                {selectedLandlord.avatar_url ? (
                  <img src={selectedLandlord.avatar_url} alt="Landlord avatar" width="96" height="96" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-extrabold text-foreground text-xl bg-primary/10 select-none">
                    {selectedLandlord.full_name?.trim()?.[0]?.toUpperCase() || "L"}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  {selectedLandlord.full_name?.trim()}
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </div>
                </h3>
                <span className="inline-block rounded-md bg-primary-light border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary mt-1">
                  Verified Landlord
                </span>
              </div>
            </div>

            {/* Contact & Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-background p-3">
                <span className="text-muted font-bold block mb-0.5">Email</span>
                <span className="text-foreground font-semibold break-all">{selectedLandlord.email || "Contact via Phone"}</span>
              </div>
              <div className="rounded-xl bg-background p-3">
                <span className="text-muted font-bold block mb-0.5">Phone / WhatsApp</span>
                <span className="text-foreground font-semibold">{selectedLandlord.phone || selectedLandlord.whatsapp_number || "Not specified"}</span>
              </div>
              <div className="rounded-xl bg-background p-3">
                <span className="text-muted font-bold block mb-0.5">CNIC (National ID)</span>
                <span className="text-foreground font-semibold">{selectedLandlord.cnic || "Not provided"}</span>
              </div>
              <div className="rounded-xl bg-background p-3">
                <span className="text-muted font-bold block mb-0.5">Primary Locality</span>
                <span className="text-foreground font-semibold">{formatLocationDisplay(selectedLandlord.area, selectedLandlord.city)}</span>
              </div>
              <div className="rounded-xl bg-background p-3 col-span-2">
                <span className="text-muted font-bold block mb-0.5">Platform Role</span>
                <span className="text-foreground font-semibold capitalize">{selectedLandlord.role || "Landlord"}</span>
              </div>
            </div>

            {/* Associated Properties */}
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Properties Listed by this Landlord ({getPropertiesByLandlord(selectedLandlord.id).length})
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {getPropertiesByLandlord(selectedLandlord.id).length === 0 ? (
                  <p className="text-xs text-muted py-3 text-center border border-dashed rounded-xl">
                    No active properties currently listed by this landlord.
                  </p>
                ) : (
                  <>
                    {getPropertiesByLandlord(selectedLandlord.id)
                      .slice((landlordPropertiesPage - 1) * 6, landlordPropertiesPage * 6)
                      .map((prop) => (
                      <div
                        key={prop.id}
                        className="rounded-xl border border-border p-3 flex items-center justify-between hover:bg-background transition-colors text-xs"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="font-bold text-foreground truncate">{prop.title}</div>
                          <div className="text-[11px] text-muted mt-0.5">
                            {prop.area} · {formatPKR(prop.rent_price)}/mo · Status: {prop.status}
                          </div>
                        </div>
                        <Button
                          href={`/listing/${prop.id}`}
                          variant="outline"
                          size="sm"
                          className="shrink-0 text-[11px] gap-1 border-border"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Button>
                      </div>
                    ))}
                    {getPropertiesByLandlord(selectedLandlord.id).length > 6 && (
                      <div className="pt-2">
                        <Pagination
                          currentPage={landlordPropertiesPage}
                          totalPages={Math.ceil(getPropertiesByLandlord(selectedLandlord.id).length / 6)}
                          onPageChange={setLandlordPropertiesPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLandlord(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: VIEW TENANT PROFILE ───────────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedTenant)}
        onClose={() => setSelectedTenant(null)}
        title={selectedTenant?.full_name || "Tenant Profile"}
        description="Tenant account preferences, location settings, and activity."
        maxWidth="max-w-md"
      >
        {selectedTenant && (
          <div className="space-y-5">
            <div className="flex items-center gap-3.5 border-b border-border/50 pb-3">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-background border border-border shrink-0">
                {selectedTenant.avatar_url ? (
                  <img src={selectedTenant.avatar_url} alt="Tenant avatar" width="96" height="96" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-extrabold text-foreground text-lg bg-primary/10 select-none">
                    {selectedTenant.full_name?.trim()?.[0]?.toUpperCase() || "T"}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  {selectedTenant.full_name?.trim()}
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </div>
                </h3>
                <span className="inline-block rounded-md bg-primary-light border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary mt-0.5">
                  Tenant Profile
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="rounded-xl bg-background p-3 flex justify-between items-center">
                <span className="text-secondary font-medium">Email:</span>
                <span className="font-bold text-foreground break-all">{selectedTenant.email || "Contact via Phone"}</span>
              </div>
              <div className="rounded-xl bg-background p-3 flex justify-between items-center">
                <span className="text-secondary font-medium">Phone / WhatsApp:</span>
                <span className="font-bold text-foreground">{selectedTenant.phone || selectedTenant.whatsapp_number || "Not specified"}</span>
              </div>
              <div className="rounded-xl bg-background p-3 flex justify-between items-center">
                <span className="text-secondary font-medium">CNIC (National ID):</span>
                <span className="font-bold text-foreground">{selectedTenant.cnic || "Not provided"}</span>
              </div>
              <div className="rounded-xl bg-background p-3 flex justify-between items-center">
                <span className="text-secondary font-medium">Preferred Area:</span>
                <span className="font-bold text-primary">{formatLocationDisplay(selectedTenant.area, selectedTenant.city)}</span>
              </div>
              <div className="rounded-xl bg-background p-3 flex justify-between items-center">
                <span className="text-secondary font-medium">Saved Properties:</span>
                <span className="font-bold text-foreground">{selectedTenant.saved_favorites_count || 0} Saved</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTenant(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: CONFIRM DELETE LANDLORD ───────────────────────────────── */}
      <Modal
        isOpen={Boolean(landlordToDelete)}
        onClose={() => setLandlordToDelete(null)}
        title="Confirm Landlord Deletion"
        maxWidth="max-w-md"
      >
        {landlordToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900">
                <p className="font-bold">Permanent Removal Action</p>
                <p className="mt-0.5">
                  Are you sure you want to delete landlord <strong>{landlordToDelete.full_name}</strong>?
                  All listings belonging to this landlord will also be safely removed from the platform.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLandlordToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleConfirmDeleteLandlord}
              >
                Yes, Delete Landlord
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: CONFIRM DELETE TENANT ─────────────────────────────────── */}
      <Modal
        isOpen={Boolean(tenantToDelete)}
        onClose={() => setTenantToDelete(null)}
        title="Confirm Tenant Deletion"
        maxWidth="max-w-md"
      >
        {tenantToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900">
                <p className="font-bold">Delete Tenant Account</p>
                <p className="mt-0.5">
                  Are you sure you want to remove tenant <strong>{tenantToDelete.full_name}</strong> ({tenantToDelete.email})?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTenantToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleConfirmDeleteTenant}
              >
                Yes, Delete Tenant
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: CONFIRM DELETE PROPERTY ───────────────────────────────── */}
      <Modal
        isOpen={Boolean(propertyToDelete)}
        onClose={() => setPropertyToDelete(null)}
        title="Confirm Property Deletion"
        maxWidth="max-w-md"
      >
        {propertyToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900">
                <p className="font-bold">Remove Listing</p>
                <p className="mt-0.5">
                  Are you sure you want to delete listing <strong>"{propertyToDelete.title}"</strong> in {propertyToDelete.area}?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPropertyToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleConfirmDeleteProperty}
              >
                Yes, Remove Property
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted text-xs">Loading Admin Panel...</div>}>
      <AdminContent />
    </Suspense>
  );
}
