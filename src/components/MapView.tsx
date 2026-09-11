import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { JobRow } from '../services/jobs';
import L from 'leaflet';

// Fix default icon issue for Leaflet in many bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapViewProps {
  center: { lat: number; lng: number };
  jobMarkers: JobRow[];
}

export const MapView: React.FC<MapViewProps> = ({ center, jobMarkers }) => {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom={true}
      className="h-[50vh] w-full rounded-lg overflow-hidden"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* User location marker */}
      <Marker position={[center.lat, center.lng]}>
        <Popup>Your location</Popup>
      </Marker>
      {/* Job markers */}
      {jobMarkers.map((job) => (
        <Marker key={job.id} position={[Number(job.lat), Number(job.lng)]}>
          <Popup>{job.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
