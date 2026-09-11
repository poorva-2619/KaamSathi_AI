import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-orange-50/50 via-white to-slate-50">
      <div className="max-w-3xl w-full text-center space-y-8 my-auto py-8">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-100/80 border border-orange-200/60 rounded-full text-primary-800 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary-600 animate-pulse" />
            <span>AI-Powered Opportunity Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
            KAAM SATHI <span className="text-primary-600">AI</span>
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-600 max-w-xl mx-auto">
            Work. Opportunity. Together.
          </p>
        </div>

        {/* CTA Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left max-w-2xl mx-auto pt-2">
          
          {/* Hire a Worker Card */}
          <button
            onClick={() => navigate('/signup?role=job_provider')}
            className="group relative min-h-[100px] p-6 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] rounded-2xl text-white shadow-lg shadow-orange-500/20 transition-all duration-200 flex flex-col justify-between overflow-hidden border border-orange-500 text-left"
          >
            <div className="flex items-start justify-between w-full mb-2">
              <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-wide">Hire a Worker</h2>
              <p className="text-xs sm:text-sm text-orange-100 mt-1 font-normal">
                Post a job and find local help
              </p>
            </div>
          </button>

          {/* Find Work Card */}
          <button
            onClick={() => navigate('/signup?role=service_provider')}
            className="group relative min-h-[100px] p-6 bg-white hover:bg-slate-50 active:scale-[0.99] rounded-2xl text-slate-900 shadow-md border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between text-left"
          >
            <div className="flex items-start justify-between w-full mb-2">
              <div className="p-3 bg-slate-100 rounded-xl group-hover:scale-110 transition-transform text-slate-700">
                <UserCheck className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-wide text-slate-900">Find Work</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Browse nearby jobs matched to your skills
              </p>
            </div>
          </button>

        </div>

        {/* Existing account footer link */}
        <div className="pt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors ml-1"
          >
            Sign in to your account →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Landing;

