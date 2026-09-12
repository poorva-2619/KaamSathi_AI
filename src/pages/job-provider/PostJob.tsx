import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, MapPin, IndianRupee, Clock, Tag, AlertTriangle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsService } from '../../services/jobs';

const CATEGORIES = [
  'cleaning', 'construction', 'delivery', 'cooking', 'gardening',
  'driving', 'security', 'healthcare', 'teaching', 'other',
];

const WAGE_TYPES = [
  { value: 'daily', label: 'Per Day' },
  { value: 'hourly', label: 'Per Hour' },
  { value: 'fixed', label: 'Fixed Price' },
];

const SKILL_OPTIONS = [
  'cleaning', 'construction', 'general_labour', 'delivery', 'cooking',
  'gardening', 'driving', 'security', 'healthcare', 'teaching',
];

const HAZARD_OPTIONS = [
  'dust', 'heavy_lifting', 'travel', 'heat', 'outdoor', 'sun_exposure',
  'standing', 'chemicals', 'noise', 'heights',
];

// Demo locations matching the F5 lookup table
const LOCATION_PRESETS = [
  { label: 'Malviya Nagar, New Delhi', lat: 28.5355, lng: 77.2090 },
  { label: 'Saket, New Delhi', lat: 28.5244, lng: 77.2167 },
  { label: 'Lajpat Nagar, New Delhi', lat: 28.5670, lng: 77.2430 },
  { label: 'Hauz Khas, New Delhi', lat: 28.5494, lng: 77.2001 },
  { label: 'Green Park, New Delhi', lat: 28.5601, lng: 77.2089 },
];

export const PostJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    wage: '',
    wage_type: 'daily' as 'daily' | 'hourly' | 'fixed',
    location_preset: 0,
    address: LOCATION_PRESETS[0].label,
    selected_skills: [] as string[],
    selected_hazards: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleSkill = (s: string) =>
    setForm((f) => ({
      ...f,
      selected_skills: f.selected_skills.includes(s)
        ? f.selected_skills.filter((x) => x !== s)
        : [...f.selected_skills, s],
    }));

  const toggleHazard = (h: string) =>
    setForm((f) => ({
      ...f,
      selected_hazards: f.selected_hazards.includes(h)
        ? f.selected_hazards.filter((x) => x !== h)
        : [...f.selected_hazards, h],
    }));

  const handleLocationChange = (idx: number) => {
    setForm((f) => ({ ...f, location_preset: idx, address: LOCATION_PRESETS[idx].label }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!form.title.trim() || !form.category || !form.wage || !form.address.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    const wageNum = parseFloat(form.wage);
    if (isNaN(wageNum) || wageNum <= 0) {
      setError('Please enter a valid wage amount.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const loc = LOCATION_PRESETS[form.location_preset];
    try {
      await jobsService.createJob({
        provider_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        wage: wageNum,
        wage_type: form.wage_type,
        lat: loc.lat,
        lng: loc.lng,
        address: form.address.trim(),
        required_skills: form.selected_skills,
        hazards: form.selected_hazards,
        status: 'open',
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to post job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 pb-20 md:pb-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Job Posted!</h2>
          <p className="text-sm text-slate-500 mt-2">
            Your job listing is now live and visible to nearby workers.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => navigate('/job-provider/my-jobs')}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              View My Jobs
            </button>
            <button
              onClick={() => { setSuccess(false); setForm({ title: '', description: '', category: '', wage: '', wage_type: 'daily', location_preset: 0, address: LOCATION_PRESETS[0].label, selected_skills: [], selected_hazards: [] }); }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Post Another Job
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-6 pb-4 flex items-center gap-3">
        <Link to="/job-provider" className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Post a Job</h1>
          <p className="text-xs text-slate-500">Create a new listing for nearby workers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-5 pb-6 max-w-2xl mx-auto space-y-5">
        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Job Title <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. House Cleaning, Construction Helper"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea
            placeholder="Describe the work, timing, special requirements…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
            required
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Wage */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Wage (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="1"
                placeholder="800"
                value={form.wage}
                onChange={(e) => setForm((f) => ({ ...f, wage: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pay Type</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={form.wage_type}
                onChange={(e) => setForm((f) => ({ ...f, wage_type: e.target.value as any }))}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
              >
                {WAGE_TYPES.map((wt) => (
                  <option key={wt.value} value={wt.value}>{wt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="relative mb-2">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={form.location_preset}
              onChange={(e) => handleLocationChange(Number(e.target.value))}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
            >
              {LOCATION_PRESETS.map((loc, i) => (
                <option key={i} value={i}>{loc.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Required Skills
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  form.selected_skills.includes(s)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Hazards */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Hazard Disclosures
          </label>
          <div className="flex flex-wrap gap-2">
            {HAZARD_OPTIONS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => toggleHazard(h)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  form.selected_hazards.includes(h)
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                }`}
              >
                {h.replace('_', ' ')}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">Be transparent — workers filter jobs by hazards they can't handle.</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting…
            </>
          ) : (
            'Post Job'
          )}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
