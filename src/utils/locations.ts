/**
 * Hardcoded location → lat/lng lookup for demo / MVP.
 *
 * Post-hackathon this should be replaced by a free OSM Nominatim call:
 *   fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
 *
 * All coordinates are approximate city-center / area-center values.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

const LOCATIONS: Record<string, LatLng> = {
  // Delhi NCR
  'malviya nagar': { lat: 28.5355, lng: 77.2090 },
  'saket':         { lat: 28.5244, lng: 77.2167 },
  'lajpat nagar':  { lat: 28.5670, lng: 77.2430 },
  'hauz khas':     { lat: 28.5494, lng: 77.2001 },
  'green park':    { lat: 28.5601, lng: 77.2089 },
  'new delhi':     { lat: 28.6139, lng: 77.2090 },
  'delhi':         { lat: 28.6139, lng: 77.2090 },
  'karol bagh':    { lat: 28.6514, lng: 77.1907 },
  'connaught place': { lat: 28.6315, lng: 77.2167 },
  'dwarka':        { lat: 28.5921, lng: 77.0460 },
  'rohini':        { lat: 28.7495, lng: 77.0568 },

  // Major Indian cities
  'mumbai':        { lat: 19.0760, lng: 72.8777 },
  'bangalore':     { lat: 12.9716, lng: 77.5946 },
  'bengaluru':     { lat: 12.9716, lng: 77.5946 },
  'hyderabad':     { lat: 17.3850, lng: 78.4867 },
  'chennai':       { lat: 13.0827, lng: 80.2707 },
  'kolkata':       { lat: 22.5726, lng: 88.3639 },
  'pune':          { lat: 18.5204, lng: 73.8567 },
  'jaipur':        { lat: 26.9124, lng: 75.7873 },
  'ahmedabad':     { lat: 23.0225, lng: 72.5714 },
  'lucknow':       { lat: 26.8467, lng: 80.9462 },
  'chandigarh':    { lat: 30.7333, lng: 76.7794 },
  'noida':         { lat: 28.5355, lng: 77.3910 },
  'gurgaon':       { lat: 28.4595, lng: 77.0266 },
  'gurugram':      { lat: 28.4595, lng: 77.0266 },
};

/**
 * Resolve a user-typed location string to lat/lng using the hardcoded lookup.
 * Does case-insensitive partial matching (e.g. "malviya" matches "malviya nagar").
 * Returns null if nothing matches.
 */
export function resolveLocation(query: string): LatLng | null {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  // Exact match first
  if (LOCATIONS[normalized]) return LOCATIONS[normalized];

  // Partial match (user typed "malviya" → matches "malviya nagar")
  for (const [key, coords] of Object.entries(LOCATIONS)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return coords;
    }
  }

  return null;
}

/**
 * Returns all known location names (for autocomplete / suggestions).
 */
export function getKnownLocationNames(): string[] {
  return Object.keys(LOCATIONS).map((k) =>
    k.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
  );
}
