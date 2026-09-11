import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center">
        <span className="inline-block px-3 py-1 bg-orange-100 text-primary-700 text-xs font-semibold rounded-full mb-3">
          Job Details
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          Job <span className="text-primary-600">#{id || 'Detail'}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Full job description, wage verification, hazard disclosures, and application locking.
        </p>

        <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 text-xs text-primary-800">
          Job detail and atomic acceptance (Dev 4 / F7) coming soon.
        </div>

        <div className="mt-6">
          <Link
            to="/service-provider/find-jobs"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            &larr; Back to Find Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
