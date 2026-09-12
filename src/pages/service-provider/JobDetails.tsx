import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, IndianRupee, Tag, AlertTriangle, CheckCircle,
  Loader2, FileText, Send, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsService, type JobRow } from '../../services/jobs';
import { supabase } from '../../services/supabase';

const WAGE_TYPE_LABEL: Record<string, string> = {
  daily: 'per day', hourly: 'per hour', fixed: 'fixed price',
};

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Job may be passed via router state (from FindJobs) or fetched
  const [job, setJob] = useState<JobRow | null>((location.state as any)?.job ?? null);
  const [loading, setLoading] = useState(!job);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Application state
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);

  // Load job if not in state
  useEffect(() => {
    if (job || !id) return;
    setLoading(true);
    jobsService.getJobById(id)
      .then((data) => {
        if (!data) setLoadError('Job not found or has been removed.');
        else setJob(data);
      })
      .catch((err) => setLoadError(err?.message ?? 'Failed to load job.'))
      .finally(() => setLoading(false));
  }, [id, job]);

  // Check if user already applied
  useEffect(() => {
    if (!user?.id || !id) { setCheckingApplication(false); return; }
    supabase
      .from('applications')
      .select('status')
      .eq('job_id', id)
      .eq('worker_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setExistingStatus(data.status);
        setCheckingApplication(false);
      });
  }, [user?.id, id]);

  const handleApply = async () => {
    if (!user?.id || !id) return;
    setApplying(true);
    setApplyError(null);
    const { error } = await supabase
      .from('applications')
      .insert({ job_id: id, worker_id: user.id, cover_note: coverNote.trim() || null });
    if (error) {
      if (error.code === '23505') {
        setApplyError('You have already applied for this job.');
      } else {
        setApplyError(error.message ?? 'Failed to apply. Please try again.');
      }
    } else {
      setApplied(true);
    }
    setApplying(false);
  };

  const conflictingHazards = job?.hazards.filter((h) => profile?.hazards_avoided?.includes(h)) ?? [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/5 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || !job) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="font-semibold text-slate-900">Job Details</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h2 className="font-semibold text-slate-800">Job unavailable</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">{loadError ?? 'This job no longer exists.'}</p>
            <button
              onClick={() => navigate('/service-provider/find-jobs')}
              className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOpen = job.status === 'open';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-slate-900 truncate">{job.title}</h1>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isOpen ? 'bg-green-100 text-green-700' :
            job.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
            'bg-slate-100 text-slate-500'
          }`}>
            {job.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-xl mx-auto space-y-4">
        {/* Hazard warning */}
        {conflictingHazards.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Hazard Warning</p>
              <p className="text-xs text-amber-700 mt-0.5">
                This job involves: <strong>{conflictingHazards.join(', ')}</strong> — which you've marked to avoid.
                Proceed only if you're comfortable with these conditions.
              </p>
            </div>
          </div>
        )}

        {/* Main info card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-primary-600" />
              <span className="text-xl font-bold text-primary-700">₹{job.wage}</span>
              <span className="text-sm text-slate-400">{WAGE_TYPE_LABEL[job.wage_type]}</span>
            </div>
            <span className="text-xs text-slate-500 capitalize bg-slate-100 px-2 py-1 rounded-full">{job.category}</span>
          </div>

          {job.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">{job.address}</span>
            </div>
          )}

          {job.description && (
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
            </div>
          )}
        </div>

        {/* Skills & Hazards */}
        {(job.required_skills.length > 0 || job.hazards.length > 0) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            {job.required_skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Required Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.required_skills.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full font-medium">
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {job.hazards.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Disclosed Hazards
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.hazards.map((h) => (
                    <span
                      key={h}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        conflictingHazards.includes(h)
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {h.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Application section */}
        {isOpen && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            {checkingApplication ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
              </div>
            ) : applied || existingStatus ? (
              <div className="text-center py-4">
                <CheckCircle className={`w-10 h-10 mx-auto mb-2 ${
                  existingStatus === 'accepted' ? 'text-green-500' :
                  existingStatus === 'rejected' ? 'text-red-400' : 'text-primary-500'
                }`} />
                <p className="font-semibold text-slate-800">
                  {existingStatus === 'accepted' ? 'Application Accepted! 🎉' :
                   existingStatus === 'rejected' ? 'Application Not Selected' :
                   existingStatus === 'withdrawn' ? 'Application Withdrawn' :
                   'Application Submitted!'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {existingStatus === 'accepted'
                    ? 'The provider has selected you for this job.'
                    : existingStatus === 'rejected'
                    ? 'The provider went with another candidate.'
                    : 'You'll be notified when the provider reviews your application.'}
                </p>
                {existingStatus === 'accepted' && (
                  <button
                    onClick={() => navigate('/chat')}
                    className="mt-4 w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Open Chat
                  </button>
                )}
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-slate-900 text-sm mb-3">Apply for this job</h3>
                {applyError && (
                  <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{applyError}
                  </div>
                )}
                <textarea
                  placeholder="Add a short note to the provider (optional)…"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none transition-all mb-3"
                />
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Applying…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Apply Now</>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {!isOpen && (
          <div className="bg-slate-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-slate-500">
              This job is <strong>{job.status}</strong> and no longer accepting applications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
