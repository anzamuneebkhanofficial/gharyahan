"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../stores/useAuthStore";

/**
 * Ensures global auth state initialization across all routes
 * including /dashboard, /admin, and public pages.
 */
export default function AuthInitializer() {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return null;
}
