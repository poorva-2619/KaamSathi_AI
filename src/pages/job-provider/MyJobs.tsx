import React from 'react';
import { Link } from 'react-router-dom';

export const MyJobs: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center">
        <span className="inline-block px-3 py-1 bg-orange-100 text-primary-700 text-xs font-semibold rounded-full mb-3">
          Job Provider
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          My <span className="text-primary-600">Jobs</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Track active postings, worker applications, and completed jobs.
        </p>

        <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 text-xs text-primary-800">
          My Jobs management list (Dev 2 / F4) coming soon.
        </div>

        <div className="mt-6">
          <Link
            to="/job-provider"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyJobs;
