import React, { useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';

const containerStyle = {
  width: '100%',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 107, 53, 0.2)'
};

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

function LeafletFallback({ center, markers, height = '320px' }) {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 107, 53, 0.2)' }}>
      <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: height, width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup>
          {markers.map((m, idx) => (
            <LeafletMarker key={m.id || `${m.lat}-${m.lng}-${idx}`} position={[m.lat, m.lng]}>
              <Popup>{m.title || 'Location'}</Popup>
            </LeafletMarker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default function GoogleMapClean({
  center = { lat: 22.3072, lng: 73.1812 },
  markers = [],
  height = '320px',
  className = ''
}) {
  const apiKey = process.env.REACT_APP_MAP_API_KEY;
  const [activeMarker, setActiveMarker] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  if (loadError) {
    return (
      <div className={className}>
        <div style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.9rem' }}>
          <span style={{ marginRight: 8 }}>⚠️</span> Google Maps unavailable — showing fallback map.
        </div>
        <LeafletFallback center={center} markers={markers} height={height} />
      </div>
    );
  }

  if (!isLoaded) return <div style={{ color: 'var(--text-secondary)', padding: '20px', textAlign: 'center' }}>Loading map...</div>;

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={{ ...containerStyle, height }}
        center={center}
        zoom={13}
        options={{
          styles: mapStyles,
          disableDefaultUI: false,
          zoomControl: true,
        }}
      >
        <MarkerClusterer>
          {(clusterer) =>
            markers.map((m, idx) => (
              <Marker
                key={m.id || `${m.lat}-${m.lng}-${idx}`}
                position={{ lat: m.lat, lng: m.lng }}
                clusterer={clusterer}
                onClick={() => setActiveMarker(m.id || `${m.lat}-${m.lng}-${idx}`)}
              />
            ))
          }
        </MarkerClusterer>

        {activeMarker && (() => {
          const m = markers.find((x, idx) => x.id === activeMarker || `${x.lat}-${x.lng}-${idx}` === activeMarker);
          if (!m) return null;
          return (
            <InfoWindow position={{ lat: m.lat, lng: m.lng }} onCloseClick={() => setActiveMarker(null)}>
              <div style={{ color: '#000', minWidth: 120, fontWeight: 500 }}>{m.title || 'Location'}</div>
            </InfoWindow>
          );
        })()}
      </GoogleMap>
    </div>
  );
}

