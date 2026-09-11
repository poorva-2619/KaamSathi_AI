import { supabase } from "./supabase";

export interface Profile {
  user_id: string;
  role: "job_provider" | "service_provider" | "employer" | "worker";
  name: string | null;
  phone?: string | null;
  company_name?: string | null;
  skills?: string[] | null;
  area?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Creates a bare profiles row with { user_id, role, name: null }
 */
export async function createBareProfile({
  user_id,
  role,
}: {
  user_id: string;
  role: string;
}) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        user_id,
        role,
        name: null,
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Fetches the user's profile by user_id
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return { data: data as Profile | null, error };
}

/**
 * Updates a profile by user_id
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, "user_id">>
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  return { data: data as Profile | null, error };
}
