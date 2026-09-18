"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import Footer from "./Footer";

// Routes where public chrome (Navbar, Footer, MobileNav) should NOT appear.
// Dashboard and Admin routes have their own dedicated sidebar + layout.
const DASHBOARD_PREFIXES = ["/dashboard", "/admin", "/profile", "/favorites", "/tenant"];
const AUTH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth",
];

function shouldHideChrome(pathname) {
  if (!pathname) return false;
  return (
    DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p)) ||
    AUTH_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

/** Renders the top bar on public routes only. Returns null on dashboard/admin/auth. */
export function PublicNavbar() {
  const pathname = usePathname();
  if (shouldHideChrome(pathname)) return null;
  return <Navbar />;
}

/** Renders the footer + mobile nav bar on public routes only. */
export function PublicFooter() {
  const pathname = usePathname();
  if (shouldHideChrome(pathname)) return null;
  return (
    <>
      <Footer />
      <MobileNav />
    </>
  );
}
