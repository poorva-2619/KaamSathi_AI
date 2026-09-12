import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, AlertTriangle, RefreshCw, Briefcase, IndianRupee, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsService, type JobRow } from '../../services/jobs';

// Simple distance calc (Haversine)
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Hardcoded location lookup (matches seed data locations)
const LOCATION_LOOKUP: Record<string, { lat: number; lng: number }> = {
  'malviya nagar': { lat: 28.5355, lng: 77.209 },
  'saket': { lat: 28.5244, lng: 77.2167 },
  'lajpat nagar': { lat: 28.567, lng: 77.243 },
  'hauz khas': { lat: 28.5494, lng: 77.2001 },
  'green park': { lat: 28.5601, lng: 77.2089 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  'delhi': { lat: 28.6139, lng: 77.209 },
};

function resolveLocation(query: string): { lat: number; lng: number } | null {
  const normalized = query.toLowerCase().trim();
  for (const [key, coords] of Object.entries(LOCATION_LOOKUP)) {
    if (normalized.includes(key)) return coords;
  }
  return null;
}

const HAZARD_OPTIONS = [
  'dust', 'heavy_lifting', 'travel', 'heat', 'outdoor',
  'sun_exposure', 'standing', 'chemicals', 'noise', 'heights',
];

const WAGE_TYPE_LABEL: Record<string, string> = {
  daily: '/day', hourly: '/hr', fixed: ' fixed',
};

const JobCard: React.FC<{
  job: JobRow;
  distanceKm: number | null;
  hazardsAvoided: string[];
  onPress: () => void;
}> = ({ job, distanceKm, hazardsAvoided, onPress }) => {
  const conflictingHazards = job.hazards.filter((h) => hazardsAvoided.includes(h));
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
          <span className="text-[10px] text-slate-400 block">{WAGE_TYPE_LABEL[job.wage_type]}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">{job.category}</span>
        {job.required_skills.slice(0, 3).map((s) => (
          <span key={s} className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">{s.replace('_', ' ')}</span>
        ))}
      </div>
    </button>
  );
};

export const FindJobs: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [locationQuery, setLocationQuery] = useState('');
  const [resolvedLocation, setResolvedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [avoidHazards, setAvoidHazards] = useState<string[]>(profile?.hazards_avoided ?? []);
  const [showHazardous, setShowHazardous] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobsService.getOpenJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Sync avoidHazards with profile when it loads
  useEffect(() => {
    if (profile?.hazards_avoided) setAvoidHazards(profile.hazards_avoided);
  }, [profile?.hazards_avoided]);

  const handleLocationSearch = () => {
    if (!locationQuery.trim()) {
      setResolvedLocation(null);
      setLocationError(null);
      return;
    }
    const loc = resolveLocation(locationQuery);
    if (loc) {
      setResolvedLocation(loc);
      setLocationError(null);
    } else {
      setResolvedLocation(null);
      setLocationError(`Location "${locationQuery}" not found. Try: Malviya Nagar, Saket, Hauz Khas…`);
    }
  };

  const toggleHazardFilter = (h: string) =>
    setAvoidHazards((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);

  const enrichedJobs = useMemo(() => {
    return jobs.map((job) => ({
      job,
      distanceKm: resolvedLocation
        ? haversineKm(resolvedLocation.lat, resolvedLocation.lng, job.lat, job.lng)
        : null,
      isHazardous: job.hazards.some((h) => avoidHazards.includes(h)),
    }));
  }, [jobs, resolvedLocation, avoidHazards]);

  const displayedJobs = useMemo(() => {
    let filtered = enrichedJobs;
    if (!showHazardous) {
      filtered = filtered.filter((e) => !e.isHazardous);
    }
    // Sort: nearest first if location set, else newest
    if (resolvedLocation) {
      filtered = [...filtered].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }
    return filtered;
  }, [enrichedJobs, showHazardous, resolvedLocation]);

  const hiddenCount = enrichedJobs.filter((e) => e.isHazardous).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-3">Find Jobs</h1>

        {/* Location search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by location (e.g. Malviya Nagar)…"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary-300 transition-all"
            />
            {locationQuery && (
              <button onClick={() => { setLocationQuery(''); setResolvedLocation(null); setLocationError(null); }} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
          <button
            onClick={handleLocationSearch}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFilterOpen((f) => !f)}
            className={`px-3 py-2.5 rounded-xl border transition-colors flex items-center gap-1 ${
              filterOpen || avoidHazards.length > 0 ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            {avoidHazards.length > 0 && (
              <span className="text-xs font-bold">{avoidHazards.length}</span>
            )}
          </button>
        </div>

        {locationError && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />{locationError}
          </p>
        )}
        {resolvedLocation && !locationError && (
          <p className="text-xs text-green-600 mt-2">📍 Showing jobs near {locationQuery}</p>
        )}

        {/* Filter panel */}
        {filterOpen && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Hazards to avoid
            </p>
            <div className="flex flex-wrap gap-1.5">
              {HAZARD_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => toggleHazardFilter(h)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    avoidHazards.includes(h)
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  {h.replace('_', ' ')}
                </button>
              ))}
            </div>
            {avoidHazards.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHazardous}
                    onChange={(e) => setShowHazardous(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <span className="text-xs text-slate-600">Show hazardous jobs (dimmed)</span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Job list */}
      <div className="px-4 pt-4 max-w-2xl mx-auto space-y-3">
        {/* Hazard filter banner */}
        {avoidHazards.length > 0 && !showHazardous && hiddenCount > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
            <span><strong>{hiddenCount}</strong> job{hiddenCount !== 1 ? 's' : ''} hidden due to hazard filter</span>
            <button onClick={() => setShowHazardous(true)} className="text-amber-700 font-semibold underline">Show anyway</button>
          </div>
        )}

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
              <div className="flex justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/5" />
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                </div>
                <div className="h-5 w-16 bg-slate-100 rounded" />
              </div>
              <div className="flex gap-2 mt-3">
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-700">Couldn't load jobs</p>
            <p className="text-xs text-red-500 mt-1 mb-4">{error}</p>
            <button onClick={load} className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1 mx-auto">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-7 h-7 text-primary-300" />
            </div>
            <h3 className="font-semibold text-slate-800">No jobs available</h3>
            <p className="text-sm text-slate-500 mt-1">
              {avoidHazards.length > 0
                ? 'All nearby jobs contain hazards you've marked to avoid. Try adjusting your filters.'
                : 'No open jobs right now. Check back soon!'}
            </p>
            {avoidHazards.length > 0 && (
              <button
                onClick={() => setAvoidHazards([])}
                className="mt-4 text-xs text-primary-600 font-semibold hover:underline"
              >
                Clear hazard filters
              </button>
            )}
          </div>
        ) : (
          displayedJobs.map(({ job, distanceKm, isHazardous }) => (
            <JobCard
              key={job.id}
              job={job}
              distanceKm={distanceKm}
              hazardsAvoided={avoidHazards}
              onPress={() => navigate(`/service-provider/job/${job.id}`, { state: { job } })}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FindJobs;
