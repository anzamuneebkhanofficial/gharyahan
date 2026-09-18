"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Menu, ArrowUpRight } from "lucide-react";
import { DashboardSidebar } from "../../components/shared/DashboardSidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <Suspense fallback={<div className="w-64 shrink-0 border-r border-border bg-surface hidden md:block" />}>
        <DashboardSidebar
          variant="admin"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </Suspense>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
              <span className="text-muted">GharYahan</span>
              <span>/</span>
              <span className="text-foreground font-bold">Platform Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold text-secondary hover:text-foreground hover:bg-surface transition-colors"
            >
              <span>View Public Portal</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-surface shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-muted hover:bg-background transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-foreground">Admin Panel</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
