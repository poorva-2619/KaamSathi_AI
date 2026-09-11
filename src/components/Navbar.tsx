import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
            KS
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">KaamSathi</span>
            <span className="text-xs bg-orange-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold ml-2">
              AI
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              isActive('/')
                ? 'bg-orange-50 text-primary-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Landing
          </Link>
          <Link
            to="/home"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              isActive('/home')
                ? 'bg-orange-50 text-primary-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Home
          </Link>
          <Link
            to="/chat"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              isActive('/chat')
                ? 'bg-orange-50 text-primary-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Chat
          </Link>
          <Link
            to="/profile"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              isActive('/profile')
                ? 'bg-orange-50 text-primary-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Profile
          </Link>
          <Link
            to="/login"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              isActive('/login')
                ? 'bg-orange-50 text-primary-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
