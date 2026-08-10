export interface RouteStopInput {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
}

export interface OptimizedLeg {
  distanceText: string;
  durationText: string;
  distanceMeters: number;
}

export interface OptimizedRouteResult {
  orderedStopIds: string[];
  legs: OptimizedLeg[];
  source: "google" | "simulado";
}

const URBAN_AVG_KMH = 28;

export async function optimizeRoute(stops: RouteStopInput[]): Promise<OptimizedRouteResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return nearestNeighborRoute(stops);
  if (stops.length < 2) {
    return { orderedStopIds: stops.map((s) => s.id), legs: [], source: "google" };
  }

  const origin = stops[0];
  const destination = stops[stops.length - 1];
  const middle = stops.slice(1, -1);

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  if (middle.length) {
    url.searchParams.set(
      "waypoints",
      `optimize:true|${middle.map((s) => `${s.lat},${s.lng}`).join("|")}`,
    );
  }
  url.searchParams.set("mode", "driving");
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("region", "br");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK") {
    console.error("Directions API error:", data.status, data.error_message);
    return nearestNeighborRoute(stops);
  }

  const route = data.routes[0];
  const waypointOrder: number[] = route.waypoint_order ?? [];
  const orderedStops = [
    origin,
    ...waypointOrder.map((i: number) => middle[i]),
    destination,
  ];

  const legs: OptimizedLeg[] = route.legs.map(
    (leg: { distance: { text: string; value: number }; duration: { text: string } }) => ({
      distanceText: leg.distance.text,
      durationText: leg.duration.text,
      distanceMeters: leg.distance.value,
    }),
  );

  return { orderedStopIds: orderedStops.map((s) => s.id), legs, source: "google" };
}

function nearestNeighborRoute(stops: RouteStopInput[]): OptimizedRouteResult {
  if (stops.length < 2) {
    return { orderedStopIds: stops.map((s) => s.id), legs: [], source: "simulado" };
  }

  const remaining = [...stops];
  const ordered = [remaining.shift()!];

  while (remaining.length) {
    const last = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversineKm(last.lat, last.lng, s.lat, s.lng);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }

  const legs: OptimizedLeg[] = [];
  for (let i = 0; i < ordered.length - 1; i++) {
    const km = haversineKm(
      ordered[i].lat,
      ordered[i].lng,
      ordered[i + 1].lat,
      ordered[i + 1].lng,
    );
    legs.push({
      distanceText: `${km.toFixed(1)} km`,
      durationText: `~${Math.round((km / URBAN_AVG_KMH) * 60)} min`,
      distanceMeters: Math.round(km * 1000),
    });
  }

  return { orderedStopIds: ordered.map((s) => s.id), legs, source: "simulado" };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildGoogleMapsNavigationUrl(stopsInOrder: RouteStopInput[]): string {
  if (stopsInOrder.length === 0) return "https://maps.google.com";

  const origin = stopsInOrder[0];
  const destination = stopsInOrder[stopsInOrder.length - 1];
  const waypoints = stopsInOrder.slice(1, -1);

  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  if (waypoints.length) {
    url.searchParams.set(
      "waypoints",
      waypoints.map((w) => `${w.lat},${w.lng}`).join("|"),
    );
  }
  url.searchParams.set("travelmode", "driving");
  return url.toString();
}
