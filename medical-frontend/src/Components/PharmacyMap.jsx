import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix Leaflet's default icon paths in bundler environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom user location pin (blue pulse)
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#0284c7;border:3px solid #ffffff;box-shadow:0 0 12px rgba(2,132,199,0.8);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Custom pharmacy pin (teal marker)
const pharmacyIcon = L.divIcon({
  className: 'custom-pharmacy-marker',
  html: `<div style="background:#0d9488;color:#ffffff;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:700;display:flex;align-items:center;gap:3px;box-shadow:0 2px 8px rgba(13,148,136,0.5);border:2px solid #ffffff;white-space:nowrap;">
    <span>🏥</span>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function PharmacyMap({
  userLocation,
  pharmacies = [],
  selectedShopId = null,
  onSelectShop = null,
  geofenceRadius = null, // in meters
  searchedMedicineName = '',
  height = '480px',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circleLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [28.6139, 77.2090]; // Delhi default

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      circleLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Center when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    if (circleLayerRef.current) circleLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Plot User Marker
    if (userLocation && userLocation.lat && userLocation.lng) {
      const userLatLng = [userLocation.lat, userLocation.lng];
      const userMarker = L.marker(userLatLng, { icon: userIcon }).addTo(markersLayerRef.current);
      userMarker.bindPopup(`
        <div style="font-family:sans-serif;padding:4px;">
          <strong style="color:#0f172a;">Your Current Location</strong><br/>
          <span style="font-size:12px;color:#64748b;">Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}</span>
        </div>
      `);
      bounds.extend(userLatLng);
    }

    // 2. Plot Pharmacy Markers
    pharmacies.forEach((shop) => {
      if (shop.location && shop.location.lat && shop.location.lng) {
        const shopLatLng = [shop.location.lat, shop.location.lng];
        const isSelected = selectedShopId && shop._id.toString() === selectedShopId.toString();

        const marker = L.marker(shopLatLng, { icon: pharmacyIcon }).addTo(markersLayerRef.current);

        const distStr = shop.formattedDistance || (shop.distanceKm ? `${shop.distanceKm} km` : '');
        const medSummary = shop.matchingMedicines?.length
          ? shop.matchingMedicines
              .map(
                (m) =>
                  `• <strong>${m.name}</strong> - ₹${m.discountPrice || m.price} (${m.availabilityStatus})`
              )
              .join('<br/>')
          : '';

        const popupContent = `
          <div style="font-family:sans-serif;min-width:210px;padding:4px;">
            <div style="font-weight:700;color:#0f172a;font-size:14px;margin-bottom:2px;">${shop.shopName}</div>
            <div style="font-size:12px;color:#0d9488;font-weight:600;margin-bottom:6px;">📍 ${distStr || 'Near you'}</div>
            <div style="font-size:12px;color:#475569;margin-bottom:6px;">${shop.address || ''}</div>
            ${medSummary ? `<div style="font-size:12px;color:#334155;background:#f0fdfa;padding:6px;border-radius:6px;margin-bottom:8px;">${medSummary}</div>` : ''}
            <div style="font-size:11px;color:#64748b;margin-bottom:8px;">🕒 ${shop.openingHours || '8:00 AM - 10:00 PM'}</div>
            <button id="select-shop-${shop._id}" style="width:100%;background:#0d9488;color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">
              Select Pharmacy
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`select-shop-${shop._id}`);
          if (btn && onSelectShop) {
            btn.onclick = () => onSelectShop(shop);
          }
        });

        if (isSelected) {
          marker.openPopup();

          // If geofence circle requested for selected shop
          if (geofenceRadius && circleLayerRef.current) {
            L.circle(shopLatLng, {
              color: '#0d9488',
              fillColor: '#14b8a6',
              fillOpacity: 0.18,
              radius: geofenceRadius,
            }).addTo(circleLayerRef.current);
          }
        }

        bounds.extend(shopLatLng);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [userLocation, pharmacies, selectedShopId, geofenceRadius]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={mapContainerRef}
        className="map-container"
        style={{ height }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.72rem',
          color: 'var(--navy-700)',
          fontWeight: 600,
          boxShadow: 'var(--shadow-sm)',
          backdropFilter: 'blur(4px)',
        }}
      >
        🔵 You | 🏥 Pharmacies {geofenceRadius ? `| ⭕ Geofence (${geofenceRadius}m)` : ''}
      </div>
    </div>
  );
}
