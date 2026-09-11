import React from 'react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center">
        <span className="inline-block px-3 py-1 bg-orange-100 text-primary-700 text-xs font-semibold rounded-full mb-4">
          KaamSathi AI
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to <span className="text-primary-600">KaamSathi AI</span>
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          AI-powered matching platform for daily wage and informal sector opportunities.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/login"
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-card transition-colors block text-center"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm transition-colors block text-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
