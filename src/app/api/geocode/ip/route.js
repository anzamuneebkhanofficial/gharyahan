import { NextResponse } from "next/server";

export async function GET() {
  // 1. Try ipwho.is service for rapid, reliable IP geocoding
  try {
    const res = await fetch("https://ipwho.is/", {
      headers: { "Accept": "application/json" },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        const city = data.city || data.region || "Lahore";
        const region = data.region || "Pakistan";
        const displayName = city && region && city !== region ? `${city}, ${region}` : city;

        return NextResponse.json({
          success: true,
          source: "ip-network",
          city,
          area: city,
          displayName,
          lat: data.latitude,
          lng: data.longitude,
          ip: data.ip,
        });
      }
    }
  } catch (err) {
    console.warn("ipwho.is failed, trying secondary fallback:", err);
  }

  // 2. Secondary fallback: ipapi.co
  try {
    const res2 = await fetch("https://ipapi.co/json/", {
      headers: { "Accept": "application/json", "User-Agent": "GharYahan-RentalApp/1.0" },
      next: { revalidate: 3600 },
    });

    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.latitude && data2.longitude) {
        const city = data2.city || data2.region || "Lahore";
        const region = data2.region || "Pakistan";
        const displayName = `${city}, ${region}`;

        return NextResponse.json({
          success: true,
          source: "ipapi",
          city,
          area: city,
          displayName,
          lat: data2.latitude,
          lng: data2.longitude,
        });
      }
    }
  } catch (err2) {
    console.warn("ipapi.co fallback failed:", err2);
  }

  // 3. Graceful default if offline or no IP provider is reachable
  return NextResponse.json({
    success: true,
    source: "default",
    city: "Lahore",
    area: "Lahore",
    displayName: "Lahore, Pakistan",
    lat: 31.5204,
    lng: 74.3587,
  });
}
