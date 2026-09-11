import { calculateHaversineDistance } from './distance';

export interface WorkerProfile {
  id: string;
  skills: string[];
  lat?: number;
  lng?: number;
  hazards_avoided?: string[];
  max_distance_km?: number;
}

export interface Job {
  id: string;
  title: string;
  category?: string;
  required_skills?: string[];
  hazards?: string[];
  lat?: number;
  lng?: number;
  wage?: number;
}

export interface JobScoreResult {
  score: number;
  reasons: string[];
}

/**
 * Calculates a match score (0-100) between a worker and a job based on skills, distance, and preferences.
 */
export function scoreJob(worker: WorkerProfile, job: Job): JobScoreResult {
  const reasons: string[] = [];
  let score = 50; // base score

  // Check hazard conflicts first
  if (worker.hazards_avoided && job.hazards) {
    const conflict = job.hazards.some((hazard) =>
      worker.hazards_avoided?.includes(hazard)
    );
    if (conflict) {
      return { score: 0, reasons: ['Conflicting workplace hazards detected'] };
    }
  }

  // Skill match
  if (job.required_skills && job.required_skills.length > 0) {
    const matchedSkills = job.required_skills.filter((skill) =>
      worker.skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
    );
    const skillScore = Math.round((matchedSkills.length / job.required_skills.length) * 30);
    score += skillScore;
    if (matchedSkills.length > 0) {
      reasons.push(`Skills matched: ${matchedSkills.join(', ')}`);
    }
  }

  // Distance match
  if (worker.lat !== undefined && worker.lng !== undefined && job.lat !== undefined && job.lng !== undefined) {
    const distance = calculateHaversineDistance(worker.lat, worker.lng, job.lat, job.lng);
    const maxDistance = worker.max_distance_km || 20;

    if (distance <= maxDistance) {
      const distanceBonus = Math.max(0, Math.round((1 - distance / maxDistance) * 20));
      score += distanceBonus;
      reasons.push(`Nearby location (${distance} km away)`);
    } else {
      score -= 20;
      reasons.push(`Further than preferred radius (${distance} km away)`);
    }
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons,
  };
}

/**
 * Filters out jobs that conflict with worker hazards or are strictly incompatible.
 */
export function filterJobs(worker: WorkerProfile, jobs: Job[]): Job[] {
  return jobs.filter((job) => {
    if (worker.hazards_avoided && job.hazards) {
      const hasConflict = job.hazards.some((hazard) =>
        worker.hazards_avoided?.includes(hazard)
      );
      if (hasConflict) return false;
    }
    return true;
  });
}
