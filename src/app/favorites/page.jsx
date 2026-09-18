"use client";

import { Heart, Search } from "lucide-react";
import Button from "../../components/ui/Button";
import PropertyCard from "../../components/listings/PropertyCard";
import { usePropertiesStore } from "../../stores/usePropertiesStore";
import { useFavoritesStore } from "../../stores/useFavoritesStore";
import { useAuthStore } from "../../stores/useAuthStore";

import PropertyCardSkeleton from "../../components/listings/PropertyCardSkeleton";

export default function FavoritesPage() {
  const { properties, isLoading } = usePropertiesStore();
  const { favorites, isLoading: isLoadingFavorites } = useFavoritesStore();
  const { isAuthenticated, isLoadingAuth, user } = useAuthStore();

  const favoriteProperties = properties.filter((p) => favorites.includes(p.id));

  if (isLoadingAuth || isLoadingFavorites) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Saved Rentals
          </h1>
          <p className="text-sm text-secondary mt-1">
            Loading your favorites...
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="rounded-2xl border border-border bg-surface p-12 text-center max-w-md mx-auto my-12 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary mb-4">
            <Heart className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Sign in to view Saved Rentals</h3>
          <p className="text-xs text-secondary mt-2 leading-relaxed">
            Please log in or create an account to view and manage your saved properties.
          </p>
          <Button href="/login" variant="primary" className="mt-6 w-full">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role === "admin") {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="rounded-2xl border border-border bg-surface p-12 text-center max-w-md mx-auto my-12 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary mb-4">
            <Heart className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Admins do not use favorites</h3>
          <p className="text-xs text-secondary mt-2 leading-relaxed">
            The saved properties feature is intended for tenants and landlords.
          </p>
          <Button href="/admin" variant="primary" className="mt-6 w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Saved Rentals ({favoriteProperties.length})
        </h1>
        <p className="text-sm text-secondary mt-1">
          Quickly access your shortlisted properties and contact landlords before deals are sealed.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : favoriteProperties.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center max-w-md mx-auto my-12 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-400 mb-4">
            <Heart className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No saved properties yet</h3>
          <p className="text-xs text-secondary mt-2 leading-relaxed">
            Tap the heart icon on any rental card while searching to save it here for fast comparison.
          </p>
          <Button href="/search" variant="primary" className="mt-6 gap-2">
            <Search className="h-4 w-4 text-accent" />
            <span>Browse Rental Spaces</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
