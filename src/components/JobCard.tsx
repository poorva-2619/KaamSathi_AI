import React from 'react';

export interface JobCardProps {
  title?: string;
  category?: string;
  wage?: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  title = 'Sample Job Opening',
  category = 'General Work',
  wage = '₹600 / day',
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex justify-between items-start">
        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
          {category}
        </span>
        <span className="text-sm font-bold text-slate-800">{wage}</span>
      </div>
      <h3 className="mt-3 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">Placeholder job description...</p>
    </div>
  );
};

export default JobCard;
