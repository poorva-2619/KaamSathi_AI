import { calculateHaversineDistance } from './distance';

export interface WorkerProfile {
  id: string;
  skills: string[];
  gender?: string;
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
  preferred_gender?: string;
  lat?: number;
  lng?: number;
  wage?: number;
}

export interface JobScoreResult {
  score: number;
  reasons: string[];
  hidden?: boolean;
}

/**
 * Scoring weights per spec §21:
 *   Skill Match:         +40 (proportional to overlap)
 *   Location Match:      +30 (scaled by distance within radius)
 *   Gender Preference:   +10 (if job says "Any" or matches worker gender)
 *   Accessibility Match: +20 (flat bonus when no hazard conflicts)
 * Total possible = 100
 *
 * If any worker limitation conflicts with a job hazard the score is forced to 0
 * and the job is flagged as hidden.
 */
export function scoreJob(worker: WorkerProfile, job: Job, distanceKm?: number): JobScoreResult {
  const reasons: string[] = [];
  let score = 0;

  // ── Hazard conflict check (instant disqualification) ──────────────
  if (worker.hazards_avoided && worker.hazards_avoided.length > 0 && job.hazards && job.hazards.length > 0) {
    const conflicting = job.hazards.filter((h) => worker.hazards_avoided!.includes(h));
    if (conflicting.length > 0) {
      return {
        score: 0,
        reasons: [`Not suitable — contains hazard: ${conflicting.join(', ')}`],
        hidden: true,
      };
    }
  }

  // ── 1. Skill Match (+40 max) ──────────────────────────────────────
  if (job.required_skills && job.required_skills.length > 0 && worker.skills.length > 0) {
    const workerSkillsLower = worker.skills.map((s) => s.toLowerCase());
    const matched = job.required_skills.filter((s) => workerSkillsLower.includes(s.toLowerCase()));
    const skillScore = Math.round((matched.length / job.required_skills.length) * 40);
    score += skillScore;
    if (matched.length > 0) {
      reasons.push(`Skills matched: ${matched.join(', ')}`);
    }
  }

  // ── 2. Location Match (+30 max) ───────────────────────────────────
  const dist =
    distanceKm ??
    (worker.lat != null && worker.lng != null && job.lat != null && job.lng != null
      ? calculateHaversineDistance(worker.lat, worker.lng, job.lat, job.lng)
      : null);

  if (dist !== null) {
    const maxDist = worker.max_distance_km || 20;
    if (dist <= maxDist) {
      // 30 if <2 km, 20 if <5 km, 10 if <10 km, scaled otherwise
      const locationScore = dist < 2 ? 30 : dist < 5 ? 20 : dist < 10 ? 10 : Math.max(0, Math.round((1 - dist / maxDist) * 30));
      score += locationScore;
      reasons.push(`${dist < 1 ? '<1' : dist.toFixed(1)} km away`);
    } else {
      reasons.push(`Beyond preferred radius (${dist.toFixed(1)} km)`);
    }
  }

  // ── 3. Gender Preference (+10) ────────────────────────────────────
  const jobGender = (job.preferred_gender ?? 'any').toLowerCase();
  const workerGender = (worker.gender ?? '').toLowerCase();
  if (jobGender === 'any' || jobGender === '' || (workerGender && jobGender === workerGender)) {
    score += 10;
    if (jobGender !== 'any' && jobGender !== '') {
      reasons.push(`Gender preference matched`);
    }
  }

  // ── 4. Accessibility Match (+20 flat if no conflicts) ─────────────
  // We already returned early on conflict, so reaching here means no conflict
  score += 20;
  reasons.push('No accessibility conflicts');

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons,
  };
}

/**
 * Filters out jobs that conflict with worker hazards.
 */
export function filterJobs(worker: WorkerProfile, jobs: Job[]): Job[] {
  return jobs.filter((job) => {
    if (worker.hazards_avoided && worker.hazards_avoided.length > 0 && job.hazards) {
      const hasConflict = job.hazards.some((hazard) =>
        worker.hazards_avoided!.includes(hazard)
      );
      if (hasConflict) return false;
    }
    return true;
  });
}

/**
 * Score, filter, and sort an array of jobs for a worker.
 * Drops hidden (hazard-conflicting) jobs, sorts descending by score.
 */
export function filterAndSortJobs(
  worker: WorkerProfile,
  jobs: Job[],
  workerLat?: number,
  workerLng?: number,
): Array<{ job: Job; score: number; reasons: string[]; distanceKm: number | null }> {
  return jobs
    .map((job) => {
      const dist =
        workerLat != null && workerLng != null && job.lat != null && job.lng != null
          ? calculateHaversineDistance(workerLat, workerLng, job.lat, job.lng)
          : null;
      const result = scoreJob(worker, job, dist ?? undefined);
      return { job, score: result.score, reasons: result.reasons, distanceKm: dist, hidden: result.hidden };
    })
    .filter((entry) => !entry.hidden && entry.score > 0)
    .sort((a, b) => b.score - a.score);
}
