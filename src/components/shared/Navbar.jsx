"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Shield,
  Building2,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Search,
} from "lucide-react";
import Button from "../ui/Button";
import { useLocationStore } from "../../stores/useLocationStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useFavoritesStore } from "../../stores/useFavoritesStore";
import { toast } from "sonner";

export default function Navbar() {
  const router = useRouter();
  const { user, role, isAuthenticated, initAuth, logout } =
    useAuthStore();
  const { clearFavorites } = useFavoritesStore();
  const { activeArea, openLocationModal, resetLocation } = useLocationStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    await logout();
    clearFavorites();
    resetLocation();
    setIsDropdownOpen(false);
    toast.success("Signed out successfully");
    router.push("/");
  };

  return (
    <header className="site-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm group-hover:bg-primary-hover transition-colors">
              <Building2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                Ghar<span className="text-primary">Yahan</span>
              </span>
              <span className="block text-[10px] font-medium text-muted -mt-0.5">
                گھر یہاں · LAHORE RENTALS
              </span>
            </div>
          </Link>        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-8" aria-label="Main navigation">
          <Link
            href="/search"
            className="text-sm font-bold text-secondary hover:text-primary transition-colors"
          >
            Explore Rentals
          </Link>
          <Link
            href="/#neighborhoods"
            className="text-sm font-bold text-secondary hover:text-primary transition-colors"
          >
            Neighborhoods
          </Link>
          <Link
            href="/#calculator"
            className="text-sm font-bold text-secondary hover:text-primary transition-colors"
          >
            Rent Calculator
          </Link>
          <Link
            href="/#features"
            className="text-sm font-bold text-secondary hover:text-primary transition-colors"
          >
            Why GharYahan
          </Link>
        </nav>

        {/* Right CTA Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hyperlocal Location Chip */}
          <button
            onClick={openLocationModal}
            type="button"
            className="hidden md:flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-secondary hover:bg-border transition-all cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium">{activeArea}</span>
            <span className="text-subtle">·</span>
            <span className="text-primary font-semibold">Change</span>
          </button>


          {/* Mobile location trigger */}
          <button
            onClick={openLocationModal}
            type="button"
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-background text-secondary"
            aria-label="Change location"
          >
            <MapPin className="h-4 w-4 text-primary" />
          </button>

          {/* Unauthenticated */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button href="/login" variant="ghost" size="sm" className="font-semibold text-xs">
                <LogIn className="h-3.5 w-3.5 mr-1" />
                <span>Sign In</span>
              </Button>
              <Button
                href="/signup"
                variant="primary"
                size="sm"
                className="bg-primary font-semibold text-xs gap-1"
              >
                <UserPlus className="h-3.5 w-3.5 text-accent" />
                <span>Sign Up</span>
              </Button>
            </div>
          ) : (
            /* Authenticated */
            <div className="flex items-center gap-3">
              {/* User Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1.5 sm:px-3 sm:py-1.5 hover:bg-background transition-all cursor-pointer shadow-card"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">
                    {user?.full_name ? user.full_name[0].toUpperCase() : (role === "admin" ? "A" : "U")}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-foreground leading-tight">
                      {user?.full_name || (role === "admin" ? "Master Admin" : "Account")}
                    </div>
                    <div className="text-[10px] font-semibold text-primary capitalize leading-tight">
                      {role || "Tenant"}
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-subtle transition-transform duration-150 ${isDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-surface p-2 shadow-xl z-50"
                    >
                      {/* User details header */}
                      <div className="px-3 py-2 border-b border-border">
                        <div className="text-sm font-bold text-foreground truncate">
                          {user?.full_name || (role === "admin" ? "Platform Administrator" : "User")}
                        </div>
                        <div className="text-xs text-subtle truncate">{user?.email}</div>
                        <div className="mt-1.5">
                          <span className="inline-block rounded-md bg-primary-light text-primary px-2 py-0.5 text-[10px] font-bold capitalize">
                            {role || "Tenant"}
                          </span>
                        </div>
                      </div>

                      {/* Role-specific Menu links */}
                      <div className="py-1 text-xs space-y-0.5 font-medium">
                        {role === "admin" && (
                          <>
                            <Link
                              href="/admin"
                              role="menuitem"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-3 py-2 rounded-xl text-foreground hover:bg-primary-light font-bold transition-colors flex items-center gap-2"
                            >
                              <Shield className="h-4 w-4 text-primary" />
                              <span>Admin Panel</span>
                            </Link>
                          </>
                        )}

                        {role === "landlord" && (
                          <>
                            <Link
                              href="/dashboard"
                              role="menuitem"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-3 py-2 rounded-xl text-secondary hover:bg-background transition-colors flex items-center gap-2"
                            >
                              <Building2 className="h-4 w-4 text-primary" />
                              <span>My Properties Hub</span>
                            </Link>
                          </>
                        )}

                        {role === "tenant" && (
                          <>
                            <Link
                              href="/tenant"
                              role="menuitem"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-3 py-2 rounded-xl text-secondary hover:bg-background transition-colors flex items-center gap-2"
                            >
                              <Shield className="h-4 w-4 text-primary" />
                              <span>Tenant Hub</span>
                            </Link>
                          </>
                        )}

                      </div>

                      {/* Sign out */}
                      <div className="border-t border-border pt-1">
                        <button
                          onClick={handleSignOut}
                          role="menuitem"
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 font-semibold hover:bg-rose-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
