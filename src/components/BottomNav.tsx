import React from 'react';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex justify-around items-center z-40">
      <span className="text-xs text-primary-600 font-semibold">Home</span>
      <span className="text-xs text-slate-400">Search</span>
      <span className="text-xs text-slate-400">Chat</span>
      <span className="text-xs text-slate-400">Profile</span>
    </nav>
  );
};

export default BottomNav;
