import React from 'react';

export const NotificationBell: React.FC = () => {
  return (
    <button className="relative p-2 rounded-xl text-slate-600 hover:text-primary-600 hover:bg-orange-50 transition-colors">
      <span className="text-lg">🔔</span>
      <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
    </button>
  );
};

export default NotificationBell;
