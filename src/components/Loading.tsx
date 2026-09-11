import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm text-slate-500 font-medium">Loading...</p>
    </div>
  );
};

export default Loading;
