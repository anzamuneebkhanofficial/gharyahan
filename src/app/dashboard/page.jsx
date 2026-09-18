"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  Lock,
  Trash2,
  ExternalLink,
  Edit3,
  AlertTriangle,
  Tag,
  Building2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatusBadge from "../../components/listings/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import { usePropertiesStore } from "../../stores/usePropertiesStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { formatPKR, formatDate } from "../../lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 10;

import TableSkeleton from "../../components/skeletons/TableSkeleton";

export default function LandlordDashboardPage() {
  const {
    properties,
    deleteProperty,
    isLoading,
    fetchLandlordProperties,
  } = usePropertiesStore();
  const { user, isLoadingAuth } = useAuthStore();
  const [page, setPage] = useState(1);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchLandlordProperties(user.id);
    }
  }, [user?.id, fetchLandlordProperties]);

  // Strict Data Isolation: Filter properties by currently logged in landlord
  // Default to usr-01 for demo landlord if not specified
  const currentLandlordId = user?.id || "usr-01";
  const myProperties = properties.filter(
    (p) =>
      p.landlord?.id === currentLandlordId ||
      (user?.email && p.landlord?.email === user.email)
  );

  const countAvailable = myProperties.filter((p) => p.status === "available").length;
  const countInDeal = myProperties.filter((p) => p.status === "in_deal").length;
  const countSealed = myProperties.filter((p) => p.status === "sealed").length;

  const paginatedProperties = myProperties.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleConfirmDelete = () => {
    if (!propertyToDelete) return;
    const res = deleteProperty(propertyToDelete.id, currentLandlordId, false);
    if (res.success) {
      toast.success("Listing removed successfully.");
      setPropertyToDelete(null);
      const remaining = myProperties.length - 1;
      const maxPage = Math.max(1, Math.ceil(remaining / PAGE_SIZE));
      if (page > maxPage) setPage(maxPage);
    } else {
      toast.error(res.error || "Failed to delete property.");
    }
  };

  if (isLoading || isLoadingAuth) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              My Properties
            </h1>
            <p className="text-sm text-secondary mt-0.5">
              Loading your properties...
            </p>
          </div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <span>My Listed Spaces</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#0D382B]/10 text-primary">
              {myProperties.length} Total Units
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Manage real-time availability, deal progress, pricing, and vacancy dates for your rental spaces.
          </p>
        </div>
        <Button
          href="/dashboard/listings/new"
          variant="primary"
          size="md"
          className="gap-2 shrink-0 font-bold text-xs sm:text-sm shadow-sm"
        >
          <PlusCircle className="h-4 w-4 text-amber-400" aria-hidden="true" />
          Add New Listing
        </Button>
      </div>

      {/* 4 Balanced KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Total Units</span>
            <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-foreground tabular-nums">{myProperties.length}</div>
          <p className="text-xs text-secondary mt-0.5">Portfolio count</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Available</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tabular-nums">{countAvailable}</div>
          <p className="text-xs text-secondary mt-0.5">Ready for visits</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">In Deal</span>
            <Clock className="h-4 w-4 text-amber-600" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-amber-700 tabular-nums">{countInDeal}</div>
          <p className="text-xs text-secondary mt-0.5">Active negotiation</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Sealed</span>
            <Lock className="h-4 w-4 text-muted" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-foreground tabular-nums">{countSealed}</div>
          <p className="text-xs text-secondary mt-0.5">Rented out</p>
        </div>
      </div>

      {/* Properties List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">
            Portfolio Listings ({myProperties.length})
          </h2>
        </div>

        {myProperties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center shadow-card">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background mb-3">
              <PlusCircle className="h-6 w-6 text-muted" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No properties listed yet</h3>
            <p className="text-xs text-secondary mt-1">
              Add your first property to start receiving direct WhatsApp messages from verified tenants.
            </p>
            <Button
              href="/dashboard/listings/new"
              variant="primary"
              size="sm"
              className="mt-4 shadow-sm"
            >
              Add your first listing
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedProperties.map((property, index) => {
              const imageUrl =
                property.images?.[0] ??
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80";

              return (
                <div
                  key={property.id}
                  className="rounded-xl border border-border bg-surface p-4 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-primary/20 hover:shadow-md transition-all duration-300 shadow-card"
                >
                  {/* Thumbnail & Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-background shrink-0 border border-border">
                      <Image
                        src={imageUrl}
                        alt={property.title}
                        fill
                        sizes="96px"
                        priority={index === 0}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge
                          status={property.status}
                          expectedVacancyDate={property.expected_vacancy_date}
                        />
                        <Badge variant="default" size="sm" className="capitalize text-[10px]">
                          {property.property_type}
                        </Badge>
                        {property.has_discount && property.discounted_price && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 text-primary px-1.5 py-0.5 text-[10px] font-bold">
                            <Tag className="h-2.5 w-2.5" />
                            Discounted
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {property.title}
                      </h3>
                      <div className="text-xs text-secondary">
                        {property.area}, Lahore ·{" "}
                        {property.has_discount && property.discounted_price ? (
                          <>
                            <span className="font-bold text-primary">
                              {formatPKR(property.discounted_price)}
                            </span>
                            <span className="line-through text-muted text-[11px] ml-1">
                              {formatPKR(property.rent_price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-foreground">
                            {formatPKR(property.rent_price)}
                          </span>
                        )}
                        <span className="text-muted"> /mo</span>
                        <span className="text-slate-300 mx-1">·</span>
                        {property.bedrooms} Bed · {property.bathrooms} Bath
                        {property.expected_vacancy_date && (
                          <>
                            <span className="text-slate-300 mx-1">·</span>
                            <span className="text-accent font-semibold">
                              Vacancy: {formatDate(property.expected_vacancy_date)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/50">
                    <div className="flex items-center gap-1 mt-auto">
                      {/* Edit button */}
                      <Button
                        href={`/dashboard/listings/${property.id}/edit`}
                        variant="outline"
                        size="sm"
                        className="gap-1 border-border text-foreground hover:bg-background font-semibold"
                        title="Edit property details"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-secondary" />
                        <span>Edit</span>
                      </Button>

                      {/* View button */}
                      <Button
                        href={`/listing/${property.id}`}
                        variant="outline"
                        size="sm"
                        className="gap-1 border-border text-foreground"
                        title="View public listing"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>View</span>
                      </Button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setPropertyToDelete(property)}
                        aria-label={`Delete listing: ${property.title}`}
                        className="p-2 rounded-lg text-muted hover:bg-rose-50 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        title="Delete listing"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          total={myProperties.length}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => {
            setPage(p);
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(propertyToDelete)}
        onClose={() => setPropertyToDelete(null)}
        title="Confirm Listing Deletion"
        maxWidth="max-w-md"
      >
        {propertyToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900">
                <p className="font-bold">Permanently Remove Property</p>
                <p className="mt-0.5">
                  Are you sure you want to remove <strong>"{propertyToDelete.title}"</strong> from your listings? Tenants will no longer be able to find or contact you for this space.
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
                onClick={handleConfirmDelete}
              >
                Yes, Delete Listing
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
