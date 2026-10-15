import React from 'react';
import { AlertTriangle } from 'lucide-react';

const HAZARD_OPTIONS = [
  'dust', 'heavy_lifting', 'travel', 'heat', 'outdoor',
  'sun_exposure', 'standing', 'chemicals', 'noise', 'heights',
];

export interface JobFilterProps {
  /** Currently selected hazards to avoid */
  avoidHazards: string[];
  /** Toggle a hazard on/off */
  onToggleHazard: (hazard: string) => void;
  /** Whether to show hazardous jobs (dimmed) */
  showHazardous: boolean;
  /** Toggle show/hide hazardous jobs */
  onToggleShowHazardous: (show: boolean) => void;
}

export const JobFilter: React.FC<JobFilterProps> = ({
  avoidHazards,
  onToggleHazard,
  showHazardous,
  onToggleShowHazardous,
}) => {
  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
      <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Hazards to avoid
      </p>
      <div className="flex flex-wrap gap-1.5">
        {HAZARD_OPTIONS.map((h) => (
          <button
            key={h}
            onClick={() => onToggleHazard(h)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              avoidHazards.includes(h)
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
            }`}
          >
            {h.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      {avoidHazards.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showHazardous}
              onChange={(e) => onToggleShowHazardous(e.target.checked)}
              className="rounded text-primary-600"
            />
            <span className="text-xs text-slate-600">Show hazardous jobs (dimmed)</span>
          </label>
        </div>
      )}
    </div>
  );
};

export default JobFilter;
