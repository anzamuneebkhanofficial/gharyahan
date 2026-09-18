"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, Building2, Shield, LogIn } from "lucide-react";
import { useFavoritesStore } from "../../stores/useFavoritesStore";
import { useAuthStore } from "../../stores/useAuthStore";

export default function MobileNav() {
  const pathname = usePathname();
  const { favorites } = useFavoritesStore();
  const { isAuthenticated, role } = useAuthStore();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
  ];

  if (isAuthenticated) {
    navItems.push({
      label: "Saved",
      href: "/favorites",
      icon: Heart,
      badge: favorites.length > 0 ? favorites.length : null,
    });
  }

  if (!isAuthenticated) {
    // Unauthenticated guest sees Sign In
    navItems.push({
      label: "Sign In",
      href: "/login",
      icon: LogIn,
    });
  } else {
    // Logged in user sees Landlord hub if landlord or admin
    if (role === "landlord" || role === "admin") {
      navItems.push({
        label: "Landlord",
        href: "/dashboard",
        icon: Building2,
      });
    }

    // Admin sees Admin platform
    if (role === "admin") {
      navItems.push({
        label: "Admin",
        href: "/admin",
        icon: Shield,
      });
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-bottom-bar pb-safe">
      <nav className="flex h-16 items-center justify-around px-2" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium transition-colors ${
                isActive ? "text-primary font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-slate-400"}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1">{item.label}</span>
                <span className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-primary" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
