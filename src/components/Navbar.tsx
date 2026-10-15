import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile, signOut } = useAuth();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const profilePath = profile?.role === 'job_provider' 
    ? '/job-provider/profile' 
    : '/service-provider/profile';

  const homePath = profile?.role === 'job_provider'
    ? '/job-provider'
    : '/service-provider';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            KS
          </div>
          <div className="flex items-center">
            <span className="text-xl font-bold text-slate-800 tracking-tight">KaamSathi</span>
            <span className="text-[10px] uppercase tracking-wider bg-primary-50 text-primary-600 font-bold px-1.5 py-0.5 rounded ml-1 border border-primary-100">
              AI
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 sm:gap-3">
          {session ? (
            <>
              <Link
                to={homePath}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  isActive(homePath) || isActive('/home')
                    ? 'bg-orange-50 text-primary-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t('dashboard')}
              </Link>
              
              <Link
                to={profilePath}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive(profilePath)
                    ? 'bg-orange-50 text-primary-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {profile?.full_name ? profile.full_name.split(' ')[0] : t('profile')}
                </span>
                <span className="sm:hidden">{t('profile')}</span>
              </Link>
              <NotificationBell />

              <button
                type="button"
                onClick={() => { const nextLanguage = i18n.language === 'en' ? 'hi' : 'en'; localStorage.setItem('kaamsathi-language', nextLanguage); void i18n.changeLanguage(nextLanguage); }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
                aria-label={t('language')}
                title={t('language')}
              >
                {i18n.language === 'en' ? 'हिं' : 'EN'}
              </button>

              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 border border-transparent"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { const nextLanguage = i18n.language === 'en' ? 'hi' : 'en'; localStorage.setItem('kaamsathi-language', nextLanguage); void i18n.changeLanguage(nextLanguage); }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
                aria-label={t('language')}
                title={t('language')}
              >
                {i18n.language === 'en' ? 'हिं' : 'EN'}
              </button>
              <Link
                to="/login"
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  isActive('/login')
                    ? 'bg-orange-50 text-primary-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t('logIn')}
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
              >
                {t('signUp')}
              </Link>
            </>
          )}
        </nav>

      </div>
    </header>
  );
};

export default Navbar;

