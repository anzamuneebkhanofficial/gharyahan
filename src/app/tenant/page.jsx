"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Building2, Eye, ExternalLink, ShieldCheck, Heart } from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { usePropertiesStore } from "../../stores/usePropertiesStore";
import { useFavoritesStore } from "../../stores/useFavoritesStore";
import { formatPKR } from "../../lib/utils";

const PAGE_SIZE = 10;

function formatLocationDisplay(area, city) {
  if (!area) return city ? `${city}` : "Lahore";
  if (city && area.toLowerCase().includes(city.toLowerCase())) return area;
  return `${area}${city ? `, ${city}` : ""}`;
}

export default function TenantDashboardPage() {
  const { landlords, properties, getPropertiesByLandlord } = usePropertiesStore();
  const { favorites } = useFavoritesStore();

  const [tablePage, setTablePage] = useState(1);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [landlordPropertiesPage, setLandlordPropertiesPage] = useState(1);

  const totalLandlords = landlords.length;
  const activeProperties = properties.filter((p) => p.status === "available").length;

  const paginatedLandlords = landlords.slice(
    (tablePage - 1) * PAGE_SIZE,
    tablePage * PAGE_SIZE
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Tenant Hub Overview</h1>
        <p className="text-sm text-secondary mt-1">Platform statistics and landlord directory.</p>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Users className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Registered Landlords</span>
          </div>
          <div className="text-2xl font-black text-foreground tabular-nums">{totalLandlords}</div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Building2 className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Active Properties</span>
          </div>
          <div className="text-2xl font-black text-foreground tabular-nums">{activeProperties}</div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Heart className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">My Saved Properties</span>
          </div>
          <div className="text-2xl font-black text-foreground tabular-nums">{favorites.length}</div>
        </div>
      </div>

      {/* Landlords Directory */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Platform Landlords Directory</h2>
            <p className="text-xs text-secondary mt-0.5">
              Browse registered landlords and their listed properties.
            </p>
          </div>
          <span className="text-xs font-semibold text-muted bg-background px-2.5 py-1 rounded-lg">
            {totalLandlords} Landlords
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
                    No landlords found.
                  </td>
                </tr>
              ) : (
                paginatedLandlords.map((l) => {
                  const landlordProps = getPropertiesByLandlord(l.id);
                  return (
                    <tr key={l.id} className="hover:bg-background/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-full overflow-hidden bg-background shrink-0 border border-border">
                            {l.avatar_url ? (
                              <Image src={l.avatar_url} alt="" fill sizes="36px" className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-secondary text-xs">
                                {l.full_name?.[0]}
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
                        <div className="text-[10px] text-primary font-medium">Verified</div>
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalLandlords > PAGE_SIZE && (
          <div className="p-4 border-t border-border/50 bg-background">
            <Pagination
              currentPage={tablePage}
              totalPages={Math.ceil(totalLandlords / PAGE_SIZE)}
              onPageChange={setTablePage}
            />
          </div>
        )}
      </div>

      {/* Landlord Profile Modal (Read Only) */}
      <Modal
        isOpen={Boolean(selectedLandlord)}
        onClose={() => setSelectedLandlord(null)}
        title="Landlord Profile"
        description="Comprehensive landlord details and associated properties."
        maxWidth="max-w-xl"
      >
        {selectedLandlord && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-background border border-border shrink-0 shadow-sm">
                {selectedLandlord.avatar_url ? (
                  <Image src={selectedLandlord.avatar_url} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-black text-secondary text-xl bg-primary/5 select-none">
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
                <span className="inline-block rounded-md bg-background border border-border px-2 py-0.5 text-[10px] font-bold text-secondary mt-1">
                  Verified Landlord
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-background border border-border/50 p-3">
                <p className="text-secondary font-medium mb-0.5">Email</p>
                <p className="font-bold text-foreground truncate">{selectedLandlord.email}</p>
              </div>
              <div className="rounded-xl bg-background border border-border/50 p-3">
                <p className="text-secondary font-medium mb-0.5">Phone / WhatsApp</p>
                <p className="font-bold text-foreground">{selectedLandlord.phone || selectedLandlord.whatsapp_number}</p>
              </div>
              <div className="rounded-xl bg-background border border-border/50 p-3">
                <p className="text-secondary font-medium mb-0.5">Primary Locality</p>
                <p className="font-bold text-foreground">{formatLocationDisplay(selectedLandlord.area, selectedLandlord.city)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">
                PROPERTIES LISTED BY THIS LANDLORD ({getPropertiesByLandlord(selectedLandlord.id).length})
              </h4>
              <div className="space-y-2">
                {getPropertiesByLandlord(selectedLandlord.id).length === 0 ? (
                  <p className="text-xs text-muted italic bg-background p-3 rounded-xl border border-border/50">
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
    </div>
  );
}
