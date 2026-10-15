/**
 * Location lookup and autocomplete helper for KaamSathi AI.
 * Provides instant suggestions for Indian localities and cities,
 * and resolves user queries to approximate latitude & longitude.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LocationSuggestion {
  name: string;
  lat: number;
  lng: number;
  subtitle?: string;
}

export const POPULAR_LOCATIONS: Record<string, { lat: number; lng: number; subtitle: string }> = {
  // Delhi NCR
  'Malviya Nagar, New Delhi': { lat: 28.5355, lng: 77.2090, subtitle: 'South Delhi, Delhi' },
  'Saket, New Delhi': { lat: 28.5244, lng: 77.2167, subtitle: 'South Delhi, Delhi' },
  'Lajpat Nagar, New Delhi': { lat: 28.5670, lng: 77.2430, subtitle: 'South Delhi, Delhi' },
  'Hauz Khas, New Delhi': { lat: 28.5494, lng: 77.2001, subtitle: 'South Delhi, Delhi' },
  'Green Park, New Delhi': { lat: 28.5601, lng: 77.2089, subtitle: 'South Delhi, Delhi' },
  'Connaught Place, New Delhi': { lat: 28.6315, lng: 77.2167, subtitle: 'Central Delhi, Delhi' },
  'Karol Bagh, New Delhi': { lat: 28.6514, lng: 77.1907, subtitle: 'Central Delhi, Delhi' },
  'Dwarka, New Delhi': { lat: 28.5921, lng: 77.0460, subtitle: 'South West Delhi, Delhi' },
  'Rohini, New Delhi': { lat: 28.7495, lng: 77.0568, subtitle: 'North West Delhi, Delhi' },
  'Janakpuri, New Delhi': { lat: 28.6219, lng: 77.0878, subtitle: 'West Delhi, Delhi' },
  'Chandni Chowk, Old Delhi': { lat: 28.6506, lng: 77.2303, subtitle: 'North Delhi, Delhi' },
  'Noida Sector 18, Uttar Pradesh': { lat: 28.5708, lng: 77.3261, subtitle: 'Gautam Buddha Nagar, UP' },
  'Noida Sector 62, Uttar Pradesh': { lat: 28.6279, lng: 77.3732, subtitle: 'Gautam Buddha Nagar, UP' },
  'Cyber City, Gurgaon': { lat: 28.4950, lng: 77.0895, subtitle: 'Gurugram, Haryana' },
  'Sector 29, Gurgaon': { lat: 28.4682, lng: 77.0632, subtitle: 'Gurugram, Haryana' },
  'Faridabad, Haryana': { lat: 28.4089, lng: 77.3178, subtitle: 'Delhi NCR, Haryana' },
  'Ghaziabad, Uttar Pradesh': { lat: 28.6692, lng: 77.4538, subtitle: 'Delhi NCR, UP' },

  // Mumbai & Maharashtra
  'Andheri East, Mumbai': { lat: 19.1136, lng: 72.8697, subtitle: 'Western Suburbs, Mumbai' },
  'Andheri West, Mumbai': { lat: 19.1363, lng: 72.8277, subtitle: 'Western Suburbs, Mumbai' },
  'Bandra West, Mumbai': { lat: 19.0596, lng: 72.8295, subtitle: 'Western Suburbs, Mumbai' },
  'Dadar, Mumbai': { lat: 19.0178, lng: 72.8478, subtitle: 'Central Mumbai, Maharashtra' },
  'Borivali, Mumbai': { lat: 19.2307, lng: 72.8567, subtitle: 'Western Suburbs, Mumbai' },
  'Kurla, Mumbai': { lat: 19.0726, lng: 72.8845, subtitle: 'Central Suburbs, Mumbai' },
  'Thane West, Maharashtra': { lat: 19.2183, lng: 72.9781, subtitle: 'Thane, Maharashtra' },
  'Navi Mumbai, Vashi': { lat: 19.0771, lng: 72.9986, subtitle: 'Navi Mumbai, Maharashtra' },
  'Shivajinagar, Pune': { lat: 18.5314, lng: 73.8446, subtitle: 'Pune, Maharashtra' },
  'Hinjawadi, Pune': { lat: 18.5913, lng: 73.7389, subtitle: 'IT Park, Pune, Maharashtra' },
  'Kothrud, Pune': { lat: 18.5074, lng: 73.8077, subtitle: 'Pune, Maharashtra' },

  // Bangalore / Bengaluru
  'Koramangala, Bangalore': { lat: 12.9352, lng: 77.6245, subtitle: 'Bengaluru, Karnataka' },
  'Indiranagar, Bangalore': { lat: 12.9784, lng: 77.6408, subtitle: 'Bengaluru, Karnataka' },
  'Whitefield, Bangalore': { lat: 12.9698, lng: 77.7500, subtitle: 'Bengaluru, Karnataka' },
  'HSR Layout, Bangalore': { lat: 12.9121, lng: 77.6446, subtitle: 'Bengaluru, Karnataka' },
  'Electronic City, Bangalore': { lat: 12.8452, lng: 77.6602, subtitle: 'Bengaluru, Karnataka' },
  'Jayanagar, Bangalore': { lat: 12.9308, lng: 77.5838, subtitle: 'Bengaluru, Karnataka' },

  // Hyderabad & Telangana
  'Hitec City, Hyderabad': { lat: 17.4435, lng: 78.3772, subtitle: 'Hyderabad, Telangana' },
  'Gachibowli, Hyderabad': { lat: 17.4401, lng: 78.3489, subtitle: 'Hyderabad, Telangana' },
  'Banjara Hills, Hyderabad': { lat: 17.4156, lng: 78.4357, subtitle: 'Hyderabad, Telangana' },
  'Secunderabad, Telangana': { lat: 17.4399, lng: 78.4983, subtitle: 'Twin City, Telangana' },

  // Other Major Indian Cities & Hubs
  'T Nagar, Chennai': { lat: 13.0418, lng: 80.2341, subtitle: 'Chennai, Tamil Nadu' },
  'Velachery, Chennai': { lat: 12.9759, lng: 80.2212, subtitle: 'Chennai, Tamil Nadu' },
  'Salt Lake City, Kolkata': { lat: 22.5867, lng: 88.4178, subtitle: 'Kolkata, West Bengal' },
  'Park Street, Kolkata': { lat: 22.5529, lng: 88.3534, subtitle: 'Kolkata, West Bengal' },
  'Malviya Nagar, Jaipur': { lat: 26.8532, lng: 75.8197, subtitle: 'Jaipur, Rajasthan' },
  'Vaishali Nagar, Jaipur': { lat: 26.9103, lng: 75.7412, subtitle: 'Jaipur, Rajasthan' },
  'C G Road, Ahmedabad': { lat: 23.0304, lng: 72.5583, subtitle: 'Ahmedabad, Gujarat' },
  'Hazratganj, Lucknow': { lat: 26.8467, lng: 80.9462, subtitle: 'Lucknow, Uttar Pradesh' },
  'Gomti Nagar, Lucknow': { lat: 26.8529, lng: 80.9992, subtitle: 'Lucknow, Uttar Pradesh' },
  'Sector 17, Chandigarh': { lat: 30.7398, lng: 76.7827, subtitle: 'City Center, Chandigarh' },
  'Bhopal, Madhya Pradesh': { lat: 23.2599, lng: 77.4126, subtitle: 'Madhya Pradesh' },
  'Indore, Madhya Pradesh': { lat: 22.7196, lng: 75.8577, subtitle: 'Madhya Pradesh' },
  'Patna, Bihar': { lat: 25.5941, lng: 85.1376, subtitle: 'Bihar' },
  'Ranchi, Jharkhand': { lat: 23.3441, lng: 85.3096, subtitle: 'Jharkhand' },
};

/**
 * Filter matching suggestions as soon as user types.
 * Matches anywhere in the name or subtitle.
 */
export function searchLocationSuggestions(query: string, maxResults = 6): LocationSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: LocationSuggestion[] = [];

  for (const [name, info] of Object.entries(POPULAR_LOCATIONS)) {
    const fullText = `${name} ${info.subtitle}`.toLowerCase();
    if (fullText.includes(q)) {
      results.push({
        name,
        lat: info.lat,
        lng: info.lng,
        subtitle: info.subtitle,
      });
      if (results.length >= maxResults) break;
    }
  }

  return results;
}

/**
 * Resolve location query to lat/lng.
 */
export function resolveLocation(query: string): LatLng | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  for (const [name, info] of Object.entries(POPULAR_LOCATIONS)) {
    if (name.toLowerCase() === q || name.toLowerCase().includes(q)) {
      return { lat: info.lat, lng: info.lng };
    }
  }

  return null;
}

/**
 * Returns all location names for fallback listings.
 */
export function getKnownLocationNames(): string[] {
  return Object.keys(POPULAR_LOCATIONS);
}

/**
 * Reverse geocode latitude and longitude to a human-readable Indian locality or city.
 * 1. Tries OpenStreetMap reverse geocoding for real street/suburb/city names.
 * 2. Falls back to nearest known Indian city in POPULAR_LOCATIONS.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // 1. Try free OpenStreetMap Nominatim reverse geocoding with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.city_district ||
          addr.quarter ||
          addr.road ||
          '';
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.state_district ||
          '';
        const state = addr.state || '';

        const parts = [locality, city, state].filter(Boolean);
        if (parts.length > 0) {
          return parts.slice(0, 2).join(', ');
        }
        if (data.display_name) {
          return data.display_name.split(',').slice(0, 2).join(', ').trim();
        }
      }
    }
  } catch {
    // Network / timeout fallback to nearest known location
  }

  // 2. Fallback: find nearest known location in our database using simple Euclidean/Haversine approx
  let nearestName = 'Delhi NCR, India';
  let minDiff = Infinity;

  for (const [name, info] of Object.entries(POPULAR_LOCATIONS)) {
    const dLat = lat - info.lat;
    const dLng = lng - info.lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDiff) {
      minDiff = distSq;
      nearestName = name;
    }
  }

  return nearestName;
}
