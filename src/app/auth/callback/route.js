import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const role = requestUrl.searchParams.get("role") || "tenant";
  const defaultDestination = role === "landlord" ? "/dashboard" : "/search";
  const next = requestUrl.searchParams.get("next") || defaultDestination;

  if (code) {
    let response = NextResponse.redirect(new URL(next, requestUrl.origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      response.cookies.set("gharyahan_user_session", "true", {
        path: "/",
        maxAge: 604800,
        sameSite: "lax",
      });
      return response;
    }
  }

  // If email was verified via magic link or direct token, send to login
  return NextResponse.redirect(
    new URL("/login?verified=true", requestUrl.origin)
  );
}
