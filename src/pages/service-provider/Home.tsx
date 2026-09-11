import React from 'react';
import { Link } from 'react-router-dom';
import { jobsService } from '../../services/jobs';

export const Home: React.FC = () => {
  const [openCount, setOpenCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    jobsService.getOpenJobsCount().then(setOpenCount).catch(console.error);
  }, []);
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center">
        <span className="inline-block px-3 py-1 bg-orange-100 text-primary-700 text-xs font-semibold rounded-full mb-3">
          Service Provider
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          Worker <span className="text-primary-600">Dashboard</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Discover opportunities near you, view AI recommendations, and apply for work.
        </p>
          {openCount !== null && (
            <p className="mt-2 text-sm text-slate-600">
              {openCount} open job{openCount !== 1 ? 's' : ''} available
            </p>
          )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to="/service-provider/find-jobs"
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl text-primary-700 font-semibold text-sm border border-orange-100 transition-colors block text-center"
          >
            Find Jobs
          </Link>
          <Link
            to="/service-provider/profile"
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-semibold text-sm border border-slate-200 transition-colors block text-center"
          >
            My Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
