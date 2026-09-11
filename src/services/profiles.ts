import { supabase, isPlaceholderSupabase } from './supabase';
import type { Database, UserRole } from '../types/database.types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const MOCK_PROFILES_KEY = 'kaamsathi_demo_profiles';

function getLocalProfilesMap(): Record<string, ProfileRow> {
  try {
    const raw = localStorage.getItem(MOCK_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalProfilesMap(map: Record<string, ProfileRow>) {
  try {
    localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota error
  }
}

export const profilesService = {
  async getProfile(userId: string): Promise<ProfileRow | null> {
    const map = getLocalProfilesMap();
    if (map[userId]) return map[userId];

    if (isPlaceholderSupabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as ProfileRow | null;
    } catch (err: unknown) {
      console.warn('Could not fetch remote profile, returning local map if any.');
      return map[userId] || null;
    }
  },

  async createBareProfile(userId: string, role: UserRole, fullName: string = ''): Promise<ProfileRow> {
    const newProfile: ProfileRow = {
      id: userId,
      role,
      full_name: fullName,
      phone: null,
      avatar_url: null,
      bio: null,
      skills: [],
      hazards_avoided: [],
      lat: 19.076,
      lng: 72.8777,
      address: null,
      max_distance_km: 20,
      rating: 5.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const map = getLocalProfilesMap();
    map[userId] = { ...newProfile, ...map[userId] };
    saveLocalProfilesMap(map);

    if (isPlaceholderSupabase) {
      return map[userId];
    }

    try {
      const payload = { id: userId, role, full_name: fullName };
      const { data, error } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase type inference helper
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single();

      if (error) throw error;
      return data as ProfileRow;
    } catch (err) {
      console.warn('Supabase profile creation failed, using local profile fallback.');
      return map[userId];
    }
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<ProfileRow> {
    const map = getLocalProfilesMap();
    const existing = map[userId] || {
      id: userId,
      role: 'service_provider' as UserRole,
      full_name: '',
      phone: null,
      avatar_url: null,
      bio: null,
      skills: [],
      hazards_avoided: [],
      lat: 19.076,
      lng: 72.8777,
      address: null,
      max_distance_km: 20,
      rating: 5.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedProfile: ProfileRow = {
      ...existing,
      ...(updates as Partial<ProfileRow>),
      updated_at: new Date().toISOString(),
    };

    map[userId] = updatedProfile;
    saveLocalProfilesMap(map);

    if (isPlaceholderSupabase) {
      return updatedProfile;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase type inference helper
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;
      return data as ProfileRow;
    } catch (err) {
      console.warn('Supabase profile update failed, using local profile update fallback.');
      return updatedProfile;
    }
  },
};



