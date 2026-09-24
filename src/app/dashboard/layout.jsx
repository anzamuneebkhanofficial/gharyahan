"use client";

import { useState, Suspense } from "react";
import { Menu, Building2 } from "lucide-react";
import { DashboardSidebar } from "../../components/shared/DashboardSidebar";
import { useAuthStore } from "../../stores/useAuthStore";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role } = useAuthStore();

  const roleLabel =
    role === "admin" ? "Admin Hub" :
      role === "landlord" ? "Landlord Hub" :
        "My Account";

  return (
    <div className="flex min-h-screen bg-background">
      <Suspense fallback={<div className="w-64 shrink-0 sidebar-dark hidden md:block" />}>
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </Suspense>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
              <span className="text-muted">GharYahan</span>
              <span className="text-muted">/</span>
              <span className="text-foreground font-bold">{roleLabel}</span>
            </div>
          </div>
        </header>

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-muted hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-bold text-foreground">{roleLabel}</span>
            </div>
          </div>
        </div>

        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
