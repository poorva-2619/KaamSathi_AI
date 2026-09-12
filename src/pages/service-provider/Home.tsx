import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageSquare, UserCircle, Briefcase, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsService } from '../../services/jobs';

export const Home: React.FC = () => {
  const { profile } = useAuth();
  const [openCount, setOpenCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    jobsService.getOpenJobsCount().then(setOpenCount).catch(console.error);
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Worker';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pb-20 md:pb-6">
      {/* Hero header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-6 pb-5">
        <p className="text-xs text-primary-600 font-semibold tracking-wide uppercase mb-1">Service Provider</p>
        <h1 className="text-2xl font-bold text-slate-900">
          Hello, <span className="text-primary-600">{firstName}</span> 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">Discover opportunities near you.</p>
      </div>

      <div className="px-4 pt-5 max-w-2xl mx-auto space-y-4">
        {/* Open jobs card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-200 text-xs font-medium mb-1">Available Now</p>
              <p className="text-3xl font-bold">
                {openCount === null ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary-200" />
                ) : (
                  openCount
                )}
              </p>
              <p className="text-primary-200 text-sm mt-0.5">open job{openCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <Link
            to="/service-provider/find-jobs"
            className="flex items-center gap-4 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 rounded-2xl p-4 border border-slate-100 transition-all shadow-sm"
          >
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Find Jobs</p>
              <p className="text-xs text-slate-500">Search, filter by hazards, and apply</p>
            </div>
          </Link>

          <Link
            to="/chat"
            className="flex items-center gap-4 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 rounded-2xl p-4 border border-slate-100 transition-all shadow-sm"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Messages</p>
              <p className="text-xs text-slate-500">Chat with providers on accepted jobs</p>
            </div>
          </Link>

          <Link
            to="/service-provider/profile"
            className="flex items-center gap-4 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 rounded-2xl p-4 border border-slate-100 transition-all shadow-sm"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <UserCircle className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">My Profile</p>
              <p className="text-xs text-slate-500">Update skills, hazard preferences, and bio</p>
            </div>
          </Link>
        </div>

        {/* Skills reminder */}
        {profile && (profile.skills.length === 0 || profile.hazards_avoided.length === 0) && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-primary-700 mb-1">🛡️ Complete Your Profile</p>
            <p className="text-xs text-primary-800 leading-relaxed">
              {profile.skills.length === 0
                ? 'Add your skills so jobs can match you. '
                : ''}
              {profile.hazards_avoided.length === 0
                ? 'Set your health/hazard preferences to filter unsafe jobs automatically.'
                : ''}
            </p>
            <Link
              to="/service-provider/profile"
              className="inline-block mt-2 text-xs text-primary-600 font-semibold hover:underline"
            >
              Update Profile →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
