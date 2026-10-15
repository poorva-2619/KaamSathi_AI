import type { ProfileRow } from '../services/profiles';

export interface ParsedProfileMeta {
  age: string;
  gender: string;
  note: string;
  onboarding_completed?: boolean;
}

export function parseProfileMeta(bio?: string | null): ParsedProfileMeta {
  if (!bio) {
    return { age: '', gender: '', note: '', onboarding_completed: false };
  }

  try {
    if (bio.startsWith('{') && bio.endsWith('}')) {
      const parsed = JSON.parse(bio);
      return {
        age: parsed.age || '',
        gender: parsed.gender || '',
        note: parsed.note || '',
        onboarding_completed: Boolean(parsed.onboarding_completed),
      };
    }
  } catch {
    // Fall back to plain text
  }

  return { age: '', gender: '', note: bio, onboarding_completed: false };
}

export function formatProfileMeta(
  age: string,
  gender: string,
  note: string,
  onboardingCompleted: boolean = true
): string {
  return JSON.stringify({
    age: age.trim(),
    gender: gender.trim(),
    note: note.trim(),
    onboarding_completed: onboardingCompleted,
  });
}

/**
 * Check if the user has already completed onboarding.
 * Ensures users who have already set up their profile are NOT repeatedly forced into onboarding.
 */
export function isProfileComplete(profile: ProfileRow | null | undefined): boolean {
  if (!profile) return false;

  // 1. Explicit local storage completion flag per user
  if (typeof window !== 'undefined' && profile.id) {
    if (localStorage.getItem(`kaamsathi_onboarding_completed_${profile.id}`) === 'true') {
      return true;
    }
  }

  // 2. Explicit completion flag in profile bio JSON
  const parsed = parseProfileMeta(profile.bio);
  if (parsed.onboarding_completed) {
    return true;
  }

  // 3. User already has meaningful profile details saved (name + address or phone)
  const hasName = Boolean(profile.full_name && profile.full_name.trim().length > 0);
  const hasPhone = Boolean(profile.phone && profile.phone.trim().length > 0);
  const hasAddress = Boolean(profile.address && profile.address.trim().length > 0);

  if (profile.role === 'service_provider') {
    const hasSkills = Boolean(profile.skills && profile.skills.length > 0);
    return hasName && (hasSkills || (hasPhone && hasAddress));
  }

  return hasName && (hasPhone || hasAddress);
}
