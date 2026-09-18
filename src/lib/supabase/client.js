import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let browserClientInstance = null;

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl.length > 0 &&
    supabaseAnonKey.length > 0 &&
    !supabaseUrl.includes("your-project.supabase.co")
  );
};

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return null when in demo/offline mode so repositories know to use the client store
    return null;
  }

  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClientInstance;
}
