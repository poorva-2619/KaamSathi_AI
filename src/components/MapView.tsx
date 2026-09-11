import React from 'react';

export const MapView: React.FC = () => {
  return (
    <div className="w-full h-64 bg-orange-50 border-2 border-dashed border-primary-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-card">
      <span className="text-2xl mb-1">🗺️</span>
      <h4 className="text-sm font-bold text-primary-700">Map View Placeholder</h4>
      <p className="text-xs text-slate-500 mt-1">Leaflet interactive map will render here.</p>
    </div>
  );
};

export default MapView;
