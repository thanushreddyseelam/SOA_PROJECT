import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issues in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG map icons
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${color};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 2px solid #ffffff;
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const createDriverIcon = (vehicleType) => {
  let symbol = '🚗';
  if (vehicleType?.toUpperCase() === 'SUV') symbol = '🚙';
  if (vehicleType?.toUpperCase() === 'AUTO') symbol = '🛺';
  if (vehicleType?.toUpperCase() === 'HATCHBACK') symbol = '🚕';

  return L.divIcon({
    className: 'driver-map-marker',
    html: `
      <div style="
        background: #1e293b;
        color: white;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.4);
        border: 2px solid #3b82f6;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

export const RideMap = ({
  pickup,
  destination,
  pickupLat,
  pickupLon,
  destLat,
  destLon,
  pickupAddress,
  dropAddress,
  drivers = [],
  driverLocation,
  onMapClick,
  onLocationSelect,
  height = '420px',
  interactive = true,
  center = [16.5062, 80.6480], // Vijayawada center (PVP Mall)
  zoom = 13,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLineRef = useRef(null);

  // Normalize location inputs
  const resolvedPickup = pickup || (pickupLat && pickupLon ? { lat: pickupLat, lng: pickupLon, address: pickupAddress } : null);
  const resolvedDest = destination || (destLat && destLon ? { lat: destLat, lng: destLon, address: dropAddress } : null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView(center, zoom);

      // Add CartoDB Voyager tile layer for crisp modern map rendering
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      if (interactive) {
        map.on('click', (e) => {
          const lat = Number(e.latlng.lat.toFixed(6));
          const lng = Number(e.latlng.lng.toFixed(6));
          if (onMapClick) {
            onMapClick({ lat, lng });
          }
          if (onLocationSelect) {
            onLocationSelect(lat, lng, 'destination');
          }
        });
      }

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Polylines whenever inputs change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    const bounds = [];

    // 1. Pickup Marker
    if (resolvedPickup && resolvedPickup.lat && resolvedPickup.lng) {
      const pMarker = L.marker([resolvedPickup.lat, resolvedPickup.lng], {
        icon: createCustomIcon('#10b981', 'P'),
      })
        .addTo(map)
        .bindPopup(`<b>Pickup Location</b><br/>${resolvedPickup.address || `${resolvedPickup.lat}, ${resolvedPickup.lng}`}`);
      markersRef.current.push(pMarker);
      bounds.push([resolvedPickup.lat, resolvedPickup.lng]);
    }

    // 2. Destination Marker
    if (resolvedDest && resolvedDest.lat && resolvedDest.lng) {
      const dMarker = L.marker([resolvedDest.lat, resolvedDest.lng], {
        icon: createCustomIcon('#ef4444', 'D'),
      })
        .addTo(map)
        .bindPopup(`<b>Destination</b><br/>${resolvedDest.address || `${resolvedDest.lat}, ${resolvedDest.lng}`}`);
      markersRef.current.push(dMarker);
      bounds.push([resolvedDest.lat, resolvedDest.lng]);
    }

    // 3. Draw Route Polyline
    if (resolvedPickup && resolvedDest && resolvedPickup.lat && resolvedPickup.lng && resolvedDest.lat && resolvedDest.lng) {
      const polyline = L.polyline(
        [
          [resolvedPickup.lat, resolvedPickup.lng],
          [resolvedDest.lat, resolvedDest.lng],
        ],
        {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }
      ).addTo(map);
      routeLineRef.current = polyline;
    }

    // 4. Nearby Available Drivers
    if (drivers && drivers.length > 0) {
      drivers.forEach((d) => {
        if (d.latitude && d.longitude) {
          const dMarker = L.marker([d.latitude, d.longitude], {
            icon: createDriverIcon(d.vehicleType),
          })
            .addTo(map)
            .bindPopup(
              `<b>${d.name}</b> (${d.vehicleType})<br/>Plate: ${d.vehicleNumber}<br/>Status: <span style="color:#10b981;font-weight:600">${d.status}</span>`
            );
          markersRef.current.push(dMarker);
        }
      });
    }

    // 5. Active Assigned Driver Marker
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      const activeDriverMarker = L.marker([driverLocation.lat, driverLocation.lng], {
        icon: createDriverIcon(driverLocation.vehicleType || 'SEDAN'),
      })
        .addTo(map)
        .bindPopup(`<b>Assigned Driver: ${driverLocation.name || 'En Route'}</b>`);
      markersRef.current.push(activeDriverMarker);
      bounds.push([driverLocation.lat, driverLocation.lng]);
    }

    // Fit map bounds if multiple points exist
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  }, [resolvedPickup?.lat, resolvedPickup?.lng, resolvedDest?.lat, resolvedDest?.lng, drivers, driverLocation]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height,
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #334155',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1,
      }}
    />
  );
};

export default RideMap;
