import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("gharyahan_admin_session");
  response.cookies.delete("gharyahan_user_session");
  return response;
}
