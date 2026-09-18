import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const envAdminEmail = process.env.ADMIN_EMAIL;
    const envAdminPassword = process.env.ADMIN_PASSWORD;
    const envAdminRole = process.env.ADMIN_ROLE || "admin";

    if (!envAdminEmail || !envAdminPassword) {
      return NextResponse.json({ isAdmin: false });
    }

    // Check exact match (case-insensitive for email, strict for password)
    const isEmailMatch =
      typeof email === "string" &&
      email.trim().toLowerCase() === envAdminEmail.trim().toLowerCase();

    const isPasswordMatch =
      typeof password === "string" && password === envAdminPassword;

    if (isEmailMatch && isPasswordMatch) {
      // Create response with admin payload (verified by default, no email verification needed)
      const response = NextResponse.json({
        isAdmin: true,
        user: {
          id: "admin-root",
          full_name: "Master Administrator",
          email: envAdminEmail,
          phone: "03000000000",
          whatsapp_number: "03000000000",
          role: envAdminRole,
          city: "Lahore",
          area: "Gulberg",
          email_verified: true,
        },
      });

      // Set secure HTTP-only admin cookie for route proxy verification
      response.cookies.set("gharyahan_admin_session", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days session
      });

      return response;
    }

    return NextResponse.json({ isAdmin: false });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
