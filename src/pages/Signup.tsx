import React from 'react';
import { Link } from 'react-router-dom';

export const Signup: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Create <span className="text-primary-600">KaamSathi AI</span> Account
        </h1>
        <p className="mt-2 text-sm text-slate-500">Choose your role and register.</p>
        <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 text-xs text-primary-800">
          Registration module (Dev 1 / F2) coming soon.
        </div>
        <div className="mt-6 text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
