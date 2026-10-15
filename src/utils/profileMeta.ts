import type { ProfileRow } from '../services/profiles';

export interface ParsedProfileMeta {
  age: string;
  gender: string;
  note: string;
}

export function parseProfileMeta(bio?: string | null): ParsedProfileMeta {
  if (!bio) {
    return { age: '', gender: '', note: '' };
  }

  try {
    if (bio.startsWith('{') && bio.endsWith('}')) {
      const parsed = JSON.parse(bio);
      return {
        age: parsed.age || '',
        gender: parsed.gender || '',
        note: parsed.note || '',
      };
    }
  } catch {
    // Fall back to plain text
  }

  return { age: '', gender: '', note: bio };
}

export function formatProfileMeta(age: string, gender: string, note: string): string {
  return JSON.stringify({
    age: age.trim(),
    gender: gender.trim(),
    note: note.trim(),
  });
}

export function isProfileComplete(profile: ProfileRow): boolean {
  const { age, gender } = parseProfileMeta(profile.bio);
  const hasBasicDetails = Boolean(
    profile.full_name.trim() &&
    age.trim() &&
    gender.trim() &&
    profile.address?.trim() &&
    profile.phone?.trim(),
  );

  return hasBasicDetails && (
    profile.role === 'job_provider' || profile.skills.length > 0
  );
}
