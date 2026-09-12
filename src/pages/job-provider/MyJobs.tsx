import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw, AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsService, type JobRow } from '../../services/jobs';
import { supabase } from '../../services/supabase';

type Application = {
  id: string;
  job_id: string;
  worker_id: string;
  status: string;
  cover_note: string | null;
  created_at: string;
  profiles: { full_name: string; phone: string | null; skills: string[] } | null;
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  assigned: 'bg-blue-100 text-blue-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

const JobCard: React.FC<{ job: JobRow; onAccept: () => void }> = ({ job, onAccept }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setLoadingApps(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*, profiles:worker_id(full_name, phone, skills)')
      .eq('job_id', job.id)
      .order('created_at', { ascending: false });
    if (!error && data) setApplications(data as unknown as Application[]);
    setLoadingApps(false);
  }, [job.id]);

  const handleExpand = () => {
    if (!expanded) loadApplications();
    setExpanded((e) => !e);
  };

  const handleAccept = async (applicationId: string) => {
    setAccepting(applicationId);
    setAcceptError(null);
    const { data, error } = await supabase.rpc('accept_job_application', {
      p_application_id: applicationId,
      p_job_id: job.id,
    });
    setAccepting(null);
    if (error || !data?.success) {
      setAcceptError(data?.error ?? error?.message ?? 'Failed to accept. Try again.');
    } else {
      onAccept();
    }
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Job summary */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 text-sm">{job.title}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[job.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {job.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{job.address ?? 'No address'}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-primary-700 font-semibold">₹{job.wage}/{job.wage_type}</span>
              <span className="text-xs text-slate-400">{job.category}</span>
            </div>
          </div>
          <button
            onClick={handleExpand}
            disabled={job.status !== 'open' && job.status !== 'assigned'}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 disabled:opacity-40"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{pendingCount > 0 ? pendingCount : 'View'}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Applications panel */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50">
          {loadingApps ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500">No applications yet.</p>
              <p className="text-xs text-slate-400 mt-1">Workers will apply here once they find your listing.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {acceptError && (
                <div className="px-4 py-2 text-xs text-red-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />{acceptError}
                </div>
              )}
              {applications.map((app) => (
                <div key={app.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px] font-bold">
                          {(app.profiles?.full_name ?? 'W').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{app.profiles?.full_name ?? 'Unknown Worker'}</p>
                        {app.profiles?.phone && <p className="text-[10px] text-slate-400">{app.profiles.phone}</p>}
                      </div>
                    </div>
                    {app.cover_note && (
                      <p className="text-[11px] text-slate-500 mt-1 ml-9 truncate">"{app.cover_note}"</p>
                    )}
                    {app.profiles?.skills && app.profiles.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 ml-9">
                        {app.profiles.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[9px] px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {app.status === 'pending' && job.status === 'open' ? (
                      <button
                        onClick={() => handleAccept(app.id)}
                        disabled={!!accepting}
                        className="flex items-center gap-1 text-xs bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {accepting === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        Accept
                      </button>
                    ) : (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const MyJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await jobsService.getJobsByProvider(user.id);
      setJobs(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const openJobs = jobs.filter((j) => j.status === 'open');
  const otherJobs = jobs.filter((j) => j.status !== 'open');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/job-provider" className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Jobs</h1>
            <p className="text-xs text-slate-500">Manage your listings and applications</p>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-4 pt-4 max-w-2xl mx-auto space-y-4">
        {/* Post new job CTA */}
        <Link
          to="/job-provider/post-job"
          className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Briefcase className="w-4 h-4" />
          Post a New Job
        </Link>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-2/5 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-3/5 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
          ))
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-700">Failed to load jobs</p>
            <p className="text-xs text-red-500 mt-1 mb-4">{error}</p>
            <button onClick={load} className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1 mx-auto">
              <RefreshCw className="w-3 h-3" /> Try again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-7 h-7 text-primary-400" />
            </div>
            <h3 className="font-semibold text-slate-800">No jobs posted yet</h3>
            <p className="text-sm text-slate-500 mt-1">Create your first listing to start finding workers.</p>
          </div>
        ) : (
          <>
            {openJobs.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Open ({openJobs.length})
                </h2>
                <div className="space-y-3">
                  {openJobs.map((job) => (
                    <JobCard key={job.id} job={job} onAccept={load} />
                  ))}
                </div>
              </div>
            )}
            {otherJobs.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Past Jobs ({otherJobs.length})
                </h2>
                <div className="space-y-3">
                  {otherJobs.map((job) => (
                    <JobCard key={job.id} job={job} onAccept={load} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
