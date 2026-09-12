import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, PlusCircle, BarChart2, CheckCircle, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsService } from '../../services/jobs';

export const Home: React.FC = () => {
  const { profile } = useAuth();
  const [counts, setCounts] = useState<{ posted: number; completed: number } | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    jobsService.getJobCountsByProvider(profile.id).then(setCounts).catch(console.error);
  }, [profile?.id]);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Provider';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pb-20 md:pb-6">
      {/* Hero header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-6 pb-5">
        <p className="text-xs text-primary-600 font-semibold tracking-wide uppercase mb-1">Job Provider</p>
        <h1 className="text-2xl font-bold text-slate-900">
          Hello, <span className="text-primary-600">{firstName}</span> 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your listings and find the right workers.</p>
      </div>

      <div className="px-4 pt-5 max-w-2xl mx-auto space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-primary-500" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Posted</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {counts === null ? (
                <span className="inline-block w-8 h-6 bg-slate-200 rounded animate-pulse" />
              ) : counts.posted}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {counts === null ? (
                <span className="inline-block w-8 h-6 bg-slate-200 rounded animate-pulse" />
              ) : counts.completed}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <Link
            to="/job-provider/post-job"
            className="flex items-center gap-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white rounded-2xl p-4 transition-all shadow-sm"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Post a Job</p>
              <p className="text-xs text-primary-200">Create a new listing for workers</p>
            </div>
          </Link>

          <Link
            to="/job-provider/my-jobs"
            className="flex items-center gap-4 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 rounded-2xl p-4 border border-slate-100 transition-all shadow-sm"
          >
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">My Jobs</p>
              <p className="text-xs text-slate-500">Review applications and manage listings</p>
            </div>
          </Link>

          <Link
            to="/chat"
            className="flex items-center gap-4 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 rounded-2xl p-4 border border-slate-100 transition-all shadow-sm"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Messages</p>
              <p className="text-xs text-slate-500">Chat with workers on accepted jobs</p>
            </div>
          </Link>
        </div>

        {/* Tips */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-primary-700 mb-1">💡 Quick Tip</p>
          <p className="text-xs text-primary-800 leading-relaxed">
            Always disclose hazards honestly — workers filter jobs based on their health conditions.
            Transparent listings get faster acceptance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
