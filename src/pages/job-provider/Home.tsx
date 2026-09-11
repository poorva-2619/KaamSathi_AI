import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center">
        <span className="inline-block px-3 py-1 bg-orange-100 text-primary-700 text-xs font-semibold rounded-full mb-3">
          Job Provider
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          Provider <span className="text-primary-600">Dashboard</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your job posts, review applicants, and connect with workers.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to="/job-provider/post-job"
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl text-primary-700 font-semibold text-sm border border-orange-100 transition-colors block text-center"
          >
            Post a Job
          </Link>
          <Link
            to="/job-provider/my-jobs"
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-semibold text-sm border border-slate-200 transition-colors block text-center"
          >
            My Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
