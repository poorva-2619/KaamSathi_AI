import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { isProfileComplete } from '../utils/profileMeta';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const handleHireWorker = () => {
    if (user && isProfileComplete(profile)) {
      navigate('/job-provider');
    } else {
      navigate('/signup?role=job_provider');
    }
  };

  const handleFindWork = () => {
    if (user && isProfileComplete(profile)) {
      navigate('/service-provider');
    } else {
      navigate('/signup?role=service_provider');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-[radial-gradient(circle_at_15%_10%,_#ffedd5_0,_transparent_32%),radial-gradient(circle_at_90%_85%,_#ccfbf1_0,_transparent_30%),linear-gradient(145deg,_#fffaf5_0%,_#ffffff_55%,_#f8fafc_100%)]">
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full border-[28px] border-orange-100/70" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full border-[34px] border-teal-100/60" />
      <div className="relative max-w-3xl w-full text-center space-y-9 my-auto py-8">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-100/80 border border-orange-200/60 rounded-full text-primary-800 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary-600 animate-pulse" />
            <span>{t('landingBadge')}</span>
          </div>

          <h1 className="brand-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900">
            {t('landingTitle')} <span className="text-primary-600">AI</span>
          </h1>

          <p className="text-lg sm:text-xl font-semibold text-slate-600 max-w-xl mx-auto tracking-tight">
            {t('landingTagline')}
          </p>
        </div>

        {/* CTA Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left max-w-2xl mx-auto pt-2">
          
          {/* Hire a Worker Card */}
          <button
            onClick={handleHireWorker}
            className="group relative min-h-[132px] p-6 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] rounded-3xl text-white shadow-xl shadow-orange-500/25 transition-all duration-200 flex flex-col justify-between overflow-hidden border border-orange-500 text-left"
          >
            <div className="flex items-start justify-between w-full mb-2">
              <div className="p-3 bg-white/15 rounded-2xl group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-wide">{t('hireWorker')}</h2>
              <p className="text-xs sm:text-sm text-orange-100 mt-1 font-normal">
                {t('hireWorkerDescription')}
              </p>
            </div>
          </button>

          {/* Find Work Card */}
          <button
            onClick={handleFindWork}
            className="group relative min-h-[132px] p-6 bg-white/90 hover:bg-white active:scale-[0.99] rounded-3xl text-slate-900 shadow-lg shadow-slate-200/70 border-2 border-slate-200 hover:border-teal-300 transition-all duration-200 flex flex-col justify-between text-left backdrop-blur-sm"
          >
            <div className="flex items-start justify-between w-full mb-2">
              <div className="p-3 bg-teal-50 rounded-2xl group-hover:scale-110 transition-transform text-teal-700">
                <UserCheck className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-wide text-slate-900">{t('findWork')}</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                {t('findWorkDescription')}
              </p>
            </div>
          </button>

        </div>

        {/* Existing account footer link */}
        <div className="pt-4 text-sm text-slate-600">
          {t('alreadyAccount')}{' '}
          <Link
            to="/login"
            className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors ml-1"
          >
            {t('signInAccount')}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Landing;

