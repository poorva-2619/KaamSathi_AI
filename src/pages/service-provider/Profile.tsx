import React from 'react';

export const Profile: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center">
        <span className="inline-block px-3 py-1 bg-orange-100 text-primary-700 text-xs font-semibold rounded-full mb-3">
          Service Provider
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          Worker <span className="text-primary-600">Profile</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your skills, preferred work distance, hazard avoidance preferences, and past reviews.
        </p>

        <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 text-xs text-primary-800">
          Worker profile editor (Dev 1 / F3) coming soon.
        </div>
      </div>
    </div>
  );
};

export default Profile;
