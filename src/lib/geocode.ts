export async function geocodeAddress(parts: {
  street: string;
  number?: string | null;
  district: string;
  city: string;
  state: string;
}): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  const address = [parts.street, parts.number, parts.district, parts.city, parts.state, "Brasil"]
    .filter(Boolean)
    .join(", ");

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("key", key);
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: { geometry: { location: { lat: number; lng: number } } }[];
    };
    const loc = data.results?.[0]?.geometry?.location;
    if (!loc) return null;
    return { lat: loc.lat, lng: loc.lng };
  } catch {
    return null;
  }
}
