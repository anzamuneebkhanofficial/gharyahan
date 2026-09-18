import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng") || searchParams.get("lon");

  if (!lat || !lng) {
    return NextResponse.json(
      { success: false, error: "Latitude and longitude query parameters are required" },
      { status: 400 }
    );
  }

  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);

  if (isNaN(numLat) || isNaN(numLng)) {
    return NextResponse.json(
      { success: false, error: "Invalid coordinates provided" },
      { status: 400 }
    );
  }

  // 1. Primary provider: OpenStreetMap Nominatim with strict User-Agent header
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${numLat}&lon=${numLng}&accept-language=en`;
    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "GharYahan-RentalApp/1.0 (contact@gharyahan.pk)",
        "Accept": "application/json",
      },
      next: { revalidate: 3600 }, // Cache geocode results for 1 hour
    });

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};

      const detectedArea =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.city_district ||
        addr.road ||
        addr.town ||
        addr.village ||
        addr.hamlet ||
        "";

      const detectedCity =
        addr.city ||
        addr.town ||
        addr.county ||
        addr.state_district ||
        addr.state ||
        "";

      const formattedArea = detectedArea ? detectedArea.trim() : "";
      const formattedCity = detectedCity ? detectedCity.trim() : "";

      let displayLabel = "";
      if (formattedArea && formattedCity && formattedArea !== formattedCity) {
        displayLabel = `${formattedArea}, ${formattedCity}`;
      } else if (formattedArea) {
        displayLabel = formattedArea;
      } else if (formattedCity) {
        displayLabel = formattedCity;
      } else {
        displayLabel = data.display_name?.split(",").slice(0, 2).join(",").trim() || "Detected Location";
      }

      return NextResponse.json({
        success: true,
        source: "nominatim",
        area: formattedArea || formattedCity || "Current Location",
        city: formattedCity || "Pakistan",
        displayName: displayLabel,
        fullAddress: data.display_name,
        lat: numLat,
        lng: numLng,
      });
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode error, attempting fallback:", err);
  }

  // 2. Secondary fallback provider: BigDataCloud Reverse Geocoding
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${numLat}&longitude=${numLng}&localityLanguage=en`;
    const bdcRes = await fetch(bdcUrl, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 3600 },
    });

    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const area = bdcData.locality || bdcData.principalSubdivision || "";
      const city = bdcData.city || bdcData.locality || "";

      let displayName = "";
      if (area && city && area !== city) {
        displayName = `${area}, ${city}`;
      } else {
        displayName = area || city || "Current Location";
      }

      return NextResponse.json({
        success: true,
        source: "bigdatacloud",
        area: area || city || "Current Location",
        city: city || "Pakistan",
        displayName,
        lat: numLat,
        lng: numLng,
      });
    }
  } catch (err) {
    console.warn("BigDataCloud fallback error:", err);
  }

  // 3. Fallback when geocoding network fails
  return NextResponse.json({
    success: true,
    source: "coordinates-only",
    area: `Location (${numLat.toFixed(3)}, ${numLng.toFixed(3)})`,
    city: "Pakistan",
    displayName: `Lat ${numLat.toFixed(3)}, Lng ${numLng.toFixed(3)}`,
    lat: numLat,
    lng: numLng,
  });
}
