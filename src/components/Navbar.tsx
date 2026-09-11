import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile, signOut } = useAuth();

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
            <span className="text-xl font-black text-slate-900 tracking-tight">KaamSathi</span>
            <span className="text-xs bg-orange-100 text-primary-700 font-bold px-2 py-0.5 rounded-full ml-1.5 flex items-center gap-1 border border-orange-200">
              <Sparkles className="w-3 h-3 text-primary-600" />
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
                Dashboard
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
                  {profile?.full_name ? profile.full_name.split(' ')[0] : 'Profile'}
                </span>
                <span className="sm:hidden">Profile</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 border border-transparent"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  isActive('/login')
                    ? 'bg-orange-50 text-primary-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

      </div>
    </header>
  );
};

export default Navbar;

