import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import type { JobRow } from '../services/jobs';

const WAGE_TYPE_LABEL: Record<string, string> = {
  daily: '/day', hourly: '/hr', fixed: ' fixed',
};

export interface JobCardProps {
  job: JobRow;
  distanceKm?: number | null;
  matchScore?: number | null;
  matchReasons?: string[];
  hazardsAvoided?: string[];
  onPress?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  distanceKm = null,
  matchScore = null,
  matchReasons = [],
  hazardsAvoided = [],
  onPress,
}) => {
  const conflictingHazards = job.hazards?.filter((h) => hazardsAvoided.includes(h)) ?? [];
  const isHazardous = conflictingHazards.length > 0;

  return (
    <button
      onClick={onPress}
      className={`w-full text-left bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 ${
        isHazardous ? 'border-amber-200 opacity-60' : 'border-slate-100 hover:border-primary-200'
      }`}
    >
      {isHazardous && (
        <div className="flex items-center gap-1.5 mb-2 text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Contains hazard: <strong>{conflictingHazards.join(', ')}</strong></span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm">{job.title}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 truncate">{job.address ?? 'Unknown location'}</span>
            {distanceKm !== null && (
              <span className="text-[10px] text-primary-600 font-semibold shrink-0 bg-primary-50 px-1.5 py-0.5 rounded-full">
                {distanceKm < 1 ? '<1 km' : `${distanceKm.toFixed(1)} km`}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm font-bold text-primary-700">₹{job.wage}</span>
          <span className="text-[10px] text-slate-400 block">{WAGE_TYPE_LABEL[job.wage_type] ?? ''}</span>
        </div>
      </div>

      {/* Match score badge */}
      {matchScore !== null && matchScore > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            matchScore >= 80 ? 'bg-green-100 text-green-700' :
            matchScore >= 50 ? 'bg-amber-100 text-amber-700' :
            'bg-slate-100 text-slate-500'
          }`}>
            {matchScore}% match
          </div>
          {matchReasons.slice(0, 2).map((r, i) => (
            <span key={i} className="text-[10px] text-slate-400">{r}</span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">{job.category}</span>
        {job.required_skills?.slice(0, 3).map((s) => (
          <span key={s} className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">{s.replace('_', ' ')}</span>
        ))}
      </div>
    </button>
  );
};

export default JobCard;
