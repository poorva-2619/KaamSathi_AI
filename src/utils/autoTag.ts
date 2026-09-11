// src/utils/autoTag.ts

/**
 * Simple heuristic to derive required skills and hazards from a job title/description.
 * This is an MVP implementation – just a keyword map, NOT machine‑learning.
 */
export interface TagResult {
  required_skills: string[];
  hazards: string[];
}

export function deriveTags(title: string, description: string): TagResult {
  const text = `${title} ${description}`.toLowerCase();

  const map: Record<string, { skills: string[]; hazards: string[] }> = {
    clean: { skills: ['cleaning'], hazards: ['dust'] },
    cleaning: { skills: ['cleaning'], hazards: ['dust'] },
    construction: { skills: ['construction', 'general_labour'], hazards: ['dust', 'heavy_lifting'] },
    labour: { skills: ['construction', 'general_labour'], hazards: ['dust', 'heavy_lifting'] },
    labor: { skills: ['construction', 'general_labour'], hazards: ['dust', 'heavy_lifting'] },
    deliver: { skills: ['delivery'], hazards: ['travel'] },
    delivery: { skills: ['delivery'], hazards: ['travel'] },
    cook: { skills: ['cooking'], hazards: [] },
    cooking: { skills: ['cooking'], hazards: [] },
    garden: { skills: ['gardening'], hazards: ['physical_activity'] },
    gardening: { skills: ['gardening'], hazards: ['physical_activity'] },
    plumb: { skills: ['plumbing'], hazards: ['physical_activity'] },
    plumbing: { skills: ['plumbing'], hazards: ['physical_activity'] },
    electric: { skills: ['electrical'], hazards: ['physical_activity'] },
    electrical: { skills: ['electrical'], hazards: ['physical_activity'] },
    paint: { skills: ['painting'], hazards: ['physical_activity'] },
    painting: { skills: ['painting'], hazards: ['physical_activity'] },
  };

  const result: TagResult = { required_skills: [], hazards: [] };

  for (const [kw, { skills, hazards }] of Object.entries(map)) {
    if (text.includes(kw)) {
      result.required_skills.push(...skills);
      result.hazards.push(...hazards);
    }
  }

  // deduplicate
  result.required_skills = Array.from(new Set(result.required_skills));
  result.hazards = Array.from(new Set(result.hazards));

  // fallback to generic labour if nothing matched
  if (result.required_skills.length === 0) {
    result.required_skills = ['general_labour'];
  }

  return result;
}
