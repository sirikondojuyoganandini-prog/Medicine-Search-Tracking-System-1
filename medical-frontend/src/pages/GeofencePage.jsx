import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Bell,
  Shield,
  Info,
  CheckCircle,
  AlertTriangle,
  Play,
  Square,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import PharmacyMap from '../Components/PharmacyMap';
import { useNotification } from '../context/NotificationContext';

export default function GeofencePage() {
  const [searchParams] = useSearchParams();
  const preselectedShopId = searchParams.get('shopId');

  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(preselectedShopId || '');
  const [searchedMedicine, setSearchedMedicine] = useState('Paracetamol 650 mg');
  const [radiusMeters, setRadiusMeters] = useState(500); // 100 to 1000m
  const [isGeofenceActive, setIsGeofenceActive] = useState(true);

  // Live Location & State
  const [userLocation, setUserLocation] = useState({ lat: 28.6290, lng: 77.2210, name: 'Connaught Place' });
  const [liveDistanceMeters, setLiveDistanceMeters] = useState(null);
  const [isInside, setIsInside] = useState(false);
  const [lastNotificationMessage, setLastNotificationMessage] = useState(null);
  const [watchId, setWatchId] = useState(null);

  const { showToast, triggerGeofenceAlert, browserPermission, requestNotificationPermission } = useNotification();
  const previouslyInsideRef = useRef(false);

  // Fetch registered pharmacies list
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get('/medicines/search', {
          params: { userLat: userLocation.lat, userLng: userLocation.lng },
        });
        if (res.data.success && res.data.nearbyShops) {
          setShops(res.data.nearbyShops);
          if (!selectedShopId && res.data.nearbyShops.length > 0) {
            setSelectedShopId(res.data.nearbyShops[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load pharmacies', err);
      }
    };

    fetchShops();
  }, []);

  // Live Geolocation Watcher
  useEffect(() => {
    if (!isGeofenceActive) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      return;
    }

    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng, name: 'Live GPS Coordinate' });
          evaluateGeofence(lat, lng);
        },
        () => {
          // Fallback evaluation with current location
          evaluateGeofence(userLocation.lat, userLocation.lng);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
      setWatchId(id);
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isGeofenceActive, selectedShopId, radiusMeters, searchedMedicine]);

  // Evaluate Distance & Geofence Entry/Exit
  const evaluateGeofence = async (userLat, userLng) => {
    if (!selectedShopId) return;

    try {
      const res = await api.post('/customer/geofence/check', {
        shopId: selectedShopId,
        userLat,
        userLng,
        radiusMeters,
        medicineSearched: searchedMedicine,
      });

      if (res.data.success) {
        setLiveDistanceMeters(res.data.distanceMeters);
        setIsInside(res.data.inside);

        // Detect entry transition
        if (res.data.inside && !previouslyInsideRef.current) {
          showToast(`Entered geofence zone for ${res.data.shop.shopName}!`, 'info');
        }

        if (res.data.shouldNotify && res.data.notification) {
          triggerGeofenceAlert(res.data.shop, searchedMedicine, res.data.distanceMeters);
          setLastNotificationMessage(res.data.notification.body);
        }

        previouslyInsideRef.current = res.data.inside;
      }
    } catch (err) {
      console.warn('Geofence check API failed', err);
    }
  };

  const selectedShop = shops.find((s) => s._id.toString() === selectedShopId?.toString());

  // Simulation buttons for demonstration purposes
  const simulatePosition = (distanceOffsetKm) => {
    if (!selectedShop?.location?.lat) return;
    // Offset user coordinates near or inside shop
    // 0.001 deg lat is approximately 111 meters
    const offsetDegrees = (distanceOffsetKm * 1000) / 111000;
    const newLat = selectedShop.location.lat + offsetDegrees;
    const newLng = selectedShop.location.lng;

    setUserLocation({ lat: newLat, lng: newLng, name: `Simulated (${Math.round(distanceOffsetKm * 1000)}m away)` });
    evaluateGeofence(newLat, newLng);
  };

  return (
    <div style={{ padding: '2rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--teal-700)', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.35rem' }}>
            <Compass size={18} /> Smart Geofencing & Location-Aware Care
          </div>
          <h1 className="title-section" style={{ marginBottom: '0.35rem' }}>
            Pharmacy Proximity Geofence
          </h1>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
            MediTrack watches your distance to the selected pharmacy and delivers immediate proximity alerts when your searched medicine is nearby.
          </p>
        </div>

        {/* Browser Background Limitation Callout */}
        <div
          style={{
            backgroundColor: 'var(--slate-100)',
            border: '1px solid var(--slate-300)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Info size={20} color="var(--navy-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.825rem', color: 'var(--navy-800)', lineHeight: 1.5 }}>
            <strong>Browser Geolocation Notice:</strong> Browser security standards allow high-accuracy position tracking while this MediTrack tab remains open. Continuous background geolocation when the browser is terminated requires native OS background location service wrappers.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '2rem' }} className="geofence-grid">
          {/* Controls Column */}
          <div>
            <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  Geofence Configuration
                </h3>
                <button
                  type="button"
                  onClick={() => setIsGeofenceActive(!isGeofenceActive)}
                  className={`btn btn-sm ${isGeofenceActive ? 'btn-primary' : 'btn-outline'}`}
                >
                  {isGeofenceActive ? 'Tracking Active' : 'Tracking Paused'}
                </button>
              </div>

              {/* Select Pharmacy */}
              <div className="form-group">
                <label className="form-label">Target Pharmacy</label>
                <select
                  className="form-select"
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                >
                  {shops.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.shopName} ({s.address})
                    </option>
                  ))}
                </select>
              </div>

              {/* Searched Medicine */}
              <div className="form-group">
                <label className="form-label">Searched Medicine to Monitor</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Paracetamol 650 mg"
                  value={searchedMedicine}
                  onChange={(e) => setSearchedMedicine(e.target.value)}
                />
              </div>

              {/* Radius Slider / Selector */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Proximity Radius</label>
                  <span style={{ fontWeight: 700, color: 'var(--teal-700)', fontSize: '0.9rem' }}>
                    {radiusMeters} metres
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--teal-600)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                  <span>100m (Immediate Block)</span>
                  <span>500m (Standard)</span>
                  <span>1000m (Neighborhood)</span>
                </div>
              </div>

              {/* Browser Notification Permission */}
              {browserPermission !== 'granted' && (
                <div style={{ marginTop: '1.25rem', padding: '0.85rem', backgroundColor: 'var(--amber-100)', borderRadius: 'var(--radius-md)', color: '#92400e', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>⚠️ Notification Permission Needed</div>
                  <div style={{ marginBottom: '0.5rem' }}>Enable browser notifications to receive proximity chimes even when tab is minimized.</div>
                  <button type="button" onClick={requestNotificationPermission} className="btn btn-sm btn-primary">
                    Enable System Notifications
                  </button>
                </div>
              )}
            </div>

            {/* Live Distance Status Card */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: isInside ? 'var(--mint-50)' : 'var(--white)', border: isInside ? '2px solid var(--mint-500)' : '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isInside ? 'var(--mint-500)' : 'var(--slate-200)',
                    color: 'var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isInside ? <CheckCircle size={20} /> : <Compass size={20} color="var(--slate-600)" />}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    {isInside ? 'Inside Pharmacy Geofence!' : 'Outside Geofence'}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--navy-600)' }}>
                    Distance: <strong>{liveDistanceMeters !== null ? `${liveDistanceMeters} metres` : 'Calculating...'}</strong> (Radius: {radiusMeters}m)
                  </div>
                </div>
              </div>

              {/* Demo Simulator Buttons */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-700)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  🎯 Simulator Controls (Test Proximity Triggers):
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => simulatePosition(0.25)} // 250m inside
                    className="btn btn-outline-teal btn-sm"
                  >
                    Walk Inside (250m away)
                  </button>
                  <button
                    type="button"
                    onClick={() => simulatePosition(1.5)} // 1.5km outside
                    className="btn btn-outline btn-sm"
                  >
                    Walk Away (1.5 km away)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Map with Radius Circle */}
          <div>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Geofence Radius Radar ({radiusMeters}m)
                </h3>
                {selectedShop && (
                  <span className="badge badge-primary">{selectedShop.shopName}</span>
                )}
              </div>

              <PharmacyMap
                userLocation={userLocation}
                pharmacies={shops}
                selectedShopId={selectedShopId}
                geofenceRadius={radiusMeters}
                searchedMedicineName={searchedMedicine}
                height="500px"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .geofence-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
