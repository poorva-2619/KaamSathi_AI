import React from 'react';

export const JobFilter: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex gap-2 flex-wrap items-center">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filters:</span>
      <button className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
        All Jobs
      </button>
      <button className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
        Near Me
      </button>
      <button className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
        High Pay
      </button>
    </div>
  );
};

export default JobFilter;
