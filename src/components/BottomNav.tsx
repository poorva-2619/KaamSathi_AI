import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, MessageSquare, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { session, profile } = useAuth();

  if (!session) return null;

  const role = profile?.role || 'service_provider';

  const homePath = role === 'job_provider' ? '/job-provider' : '/service-provider';
  const profilePath = role === 'job_provider' ? '/job-provider/profile' : '/service-provider/profile';
  const chatPath = '/chat';

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2.5 px-8 flex justify-around items-center z-40 shadow-lg md:hidden pb-[max(0.625rem,env(safe-area-inset-bottom))]">
      
      {/* Home Tab */}
      <Link
        to={homePath}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive(homePath)
            ? 'text-primary-600 font-bold'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <Home className={`w-5 h-5 ${isActive(homePath) ? 'fill-primary-600/10 text-primary-600' : 'text-slate-400'}`} />
        <span className="text-[11px] tracking-tight">Home</span>
      </Link>

      {/* Chat Tab */}
      <Link
        to={chatPath}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive(chatPath)
            ? 'text-primary-600 font-bold'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <MessageSquare className={`w-5 h-5 ${isActive(chatPath) ? 'fill-primary-600/10 text-primary-600' : 'text-slate-400'}`} />
        <span className="text-[11px] tracking-tight">Chat</span>
      </Link>

      {/* Profile Tab */}
      <Link
        to={profilePath}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive(profilePath)
            ? 'text-primary-600 font-bold'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <User className={`w-5 h-5 ${isActive(profilePath) ? 'fill-primary-600/10 text-primary-600' : 'text-slate-400'}`} />
        <span className="text-[11px] tracking-tight">Profile</span>
      </Link>

    </nav>
  );
};

export default BottomNav;


