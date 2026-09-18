"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Heart,
  Search,
  Shield,
  Home,
  LogOut,
  X,
  ChevronRight,
  Users,
  User,
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useFavoritesStore } from "../../stores/useFavoritesStore";
import { toast } from "sonner";

// ── Strict Role-specific nav config ──────────────────────────────────────────
const NAV_CONFIG = {
  tenant: {
    label: "Tenant Hub",
    badgeColor: "bg-primary-light text-primary border border-primary/20",
    groups: [
      {
        heading: "Rental Discovery",
        items: [
          { label: "Tenant Dashboard", href: "/tenant", icon: LayoutDashboard, exact: true },
          { label: "Explore Rentals", href: "/search", icon: Search, exact: true },
          { label: "Saved Properties", href: "/favorites", icon: Heart, exact: true },
        ],
      },
      {
        heading: "My Account",
        items: [
          { label: "Tenant Profile", href: "/profile", icon: User, exact: true },
        ],
      },
    ],
  },
  landlord: {
    label: "Landlord Hub",
    badgeColor: "bg-primary-light text-primary border border-primary/20",
    groups: [
      {
        heading: "My Properties",
        items: [
          { label: "My Listings", href: "/dashboard", icon: LayoutDashboard, exact: true },
          { label: "Add New Listing", href: "/dashboard/listings/new", icon: PlusCircle, exact: true },
        ],
      },
      {
        heading: "Browse & Market",
        items: [
          { label: "Explore Rentals", href: "/search", icon: Search, exact: true },
          { label: "Saved Properties", href: "/favorites", icon: Heart, exact: true },
        ],
      },
      {
        heading: "Account",
        items: [
          { label: "Landlord Profile", href: "/dashboard/profile", icon: User, exact: true },
        ],
      },
    ],
  },
  admin: {
    label: "Platform Admin",
    badgeColor: "bg-primary text-accent border border-primary-hover",
    groups: [
      {
        heading: "Management & Control",
        items: [
          { label: "Platform Overview", href: "/admin", icon: Shield, exact: true },
          { label: "Landlord Management", href: "/admin?tab=landlords", icon: Building2, exact: true },
          { label: "Tenant Management", href: "/admin?tab=tenants", icon: Users, exact: true },
        ],
      },
      {
        heading: "Account",
        items: [
          { label: "Admin Profile", href: "/admin/profile", icon: User, exact: true },
        ],
      },
    ],
  },
};

function NavItem({ item, pathname, searchParams, onClick }) {
  const currentTab = searchParams.get("tab");
  let isActive = false;

  if (item.href.includes("?tab=")) {
    const itemTab = item.href.split("?tab=")[1];
    isActive = pathname === "/admin" && currentTab === itemTab;
  } else if (item.href === "/admin") {
    isActive = pathname === "/admin" && !currentTab;
  } else if (item.exact) {
    isActive = pathname === item.href;
  } else {
    isActive = pathname.startsWith(item.href);
  }

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${isActive
          ? "bg-primary text-white shadow-card"
          : "text-secondary hover:bg-background hover:text-foreground"
        }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${isActive ? "text-accent" : "text-subtle"}`}
        aria-hidden="true"
      />
      <span className="truncate">{item.label}</span>
      {isActive && (
        <ChevronRight className="h-3.5 w-3.5 ml-auto text-accent/80 shrink-0" aria-hidden="true" />
      )}
    </Link>
  );
}

export function DashboardSidebar({ isOpen, onClose, variant = null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, role, logout } = useAuthStore();
  const { favorites } = useFavoritesStore();

  const effectiveRole = variant || role || "tenant";
  const config = NAV_CONFIG[effectiveRole] ?? NAV_CONFIG.tenant;

  const handleSignOut = async () => {
    await logout();
    toast.success("Signed out successfully");
    router.push("/");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* User info + role badge */}
      <div className="px-4 py-4 border-b border-border shrink-0 relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 md:hidden p-1.5 rounded-lg text-subtle hover:bg-background transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold shrink-0">
            {user?.full_name?.[0]?.toUpperCase() ?? (effectiveRole === "admin" ? "A" : "U")}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-foreground truncate">
              {user?.full_name ?? (effectiveRole === "admin" ? "Master Admin" : "Account")}
            </div>
            <div className="text-xs text-muted truncate">{user?.email || (effectiveRole === "admin" ? "admin@gharyahan.pk" : "")}</div>
          </div>
        </div>
        <div className="mt-3">
          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${config.badgeColor}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-3 space-y-5"
        aria-label="Dashboard navigation"
      >
        {config.groups.map((group) => (
          <div key={group.heading}>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-subtle uppercase tracking-widest">
              {group.heading}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const label =
                  item.href === "/favorites" && favorites.length > 0
                    ? `${item.label} (${favorites.length})`
                    : item.label;
                return (
                  <NavItem
                    key={item.href + item.label}
                    item={{ ...item, label }}
                    pathname={pathname}
                    searchParams={searchParams}
                    onClick={onClose}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="shrink-0 p-3 border-t border-border space-y-2 bg-surface">
        {effectiveRole !== "admin" && (
          <>
            <div className="space-y-0.5">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-secondary hover:bg-background hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                <Home className="h-4 w-4 text-muted" aria-hidden="true" />
                Public Site
              </Link>
            </div>
          </>
        )}

        <div className="space-y-0.5">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — sticky viewport height */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 border-r border-border bg-surface sticky top-0 h-screen z-30"
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            className="md:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-surface shadow-2xl"
            aria-label="Navigation drawer"
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
