import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import type { JobRow } from '../services/jobs';
import L from 'leaflet';

// Vite-compatible icon fix for Leaflet (no require()!)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapViewProps {
  center: { lat: number; lng: number };
  jobMarkers: JobRow[];
  onMarkerClick?: (job: JobRow) => void;
  singleMarker?: boolean;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

const RecenterMap: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center.lat, center.lng, map]);

  return null;
};

const SelectLocation: React.FC<{ onLocationSelect?: MapViewProps['onLocationSelect'] }> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (event) => onLocationSelect?.({ lat: event.latlng.lat, lng: event.latlng.lng }),
  });
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ center, jobMarkers, onMarkerClick, singleMarker = false, onLocationSelect }) => {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom={true}
      className="h-[50vh] min-h-[320px] w-full rounded-xl overflow-hidden border border-slate-200"
    >
      <RecenterMap center={center} />
      {singleMarker && <SelectLocation onLocationSelect={onLocationSelect} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* User location or the single editable job location marker */}
      {(!singleMarker || onLocationSelect) && (
        <Marker
          position={[center.lat, center.lng]}
          draggable={singleMarker}
          eventHandlers={singleMarker ? {
            dragend: (event) => {
              const position = event.target.getLatLng();
              onLocationSelect?.({ lat: position.lat, lng: position.lng });
            },
          } : {}}
        >
          <Popup>{singleMarker ? '📍 Job location' : '📍 Your location'}</Popup>
        </Marker>
      )}
      {/* Job markers */}
      {jobMarkers.map((job) => (
        <Marker
          key={job.id}
          position={[Number(job.lat), Number(job.lng)]}
          eventHandlers={onMarkerClick ? { click: () => onMarkerClick(job) } : {}}
        >
          <Popup>
            <strong>{job.title}</strong>
            <br />
            ₹{job.wage} {job.wage_type === 'daily' ? '/day' : job.wage_type === 'hourly' ? '/hr' : 'fixed'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
