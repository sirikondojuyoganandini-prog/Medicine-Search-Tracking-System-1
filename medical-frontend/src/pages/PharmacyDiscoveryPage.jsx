import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MapPin,
  Search,
  Store,
  Phone,
  Clock,
  Star,
  CheckCircle,
  Compass,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import PharmacyMap from '../Components/PharmacyMap';
import { useNotification } from '../context/NotificationContext';

export default function PharmacyDiscoveryPage() {
  const [searchParams] = useSearchParams();
  const highlightShopId = searchParams.get('shopId');

  const [shops, setShops] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({ lat: 28.6290, lng: 77.2210 });

  const { showToast } = useNotification();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => console.log('Location denied, using default')
      );
    }
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get('/medicines/search', {
          params: { userLat: userLocation.lat, userLng: userLocation.lng },
        });
        if (res.data.success) {
          setShops(res.data.nearbyShops || []);
          if (highlightShopId) {
            const found = res.data.nearbyShops?.find((s) => s._id.toString() === highlightShopId);
            if (found) setSelectedShop(found);
          } else if (res.data.nearbyShops?.length > 0) {
            setSelectedShop(res.data.nearbyShops[0]);
          }
        }
      } catch (err) {
        showToast('Error loading nearby pharmacies', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [userLocation, highlightShopId]);

  const filteredShops = shops.filter(
    (s) =>
      s.shopName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.address?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.city?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
            Nearby Pharmacy Discovery
          </h1>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
            Locate verified licensed medical shops in your city with operating hours, distance, and contact details.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.75rem' }} className="pharmacy-grid">
          {/* Left Column: Filter & Pharmacy Cards */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--white)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid var(--slate-300)',
                }}
              >
                <Search size={18} color="var(--slate-400)" />
                <input
                  type="text"
                  placeholder="Filter pharmacies by name or locality..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>Loading pharmacies...</div>
            ) : filteredShops.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                No pharmacies match your search.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredShops.map((shop) => {
                  const isSelected = selectedShop && selectedShop._id.toString() === shop._id.toString();

                  return (
                    <div
                      key={shop._id}
                      onClick={() => setSelectedShop(shop)}
                      className="card"
                      style={{
                        padding: '1.25rem',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--teal-600)' : '1px solid var(--slate-200)',
                        backgroundColor: isSelected ? 'var(--teal-50)' : 'var(--white)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                          {shop.shopName}
                        </h3>
                        <span className="badge badge-primary">{shop.formattedDistance || 'Nearby'}</span>
                      </div>

                      <p style={{ fontSize: '0.825rem', color: 'var(--navy-600)', marginBottom: '0.65rem' }}>
                        📍 {shop.address}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--navy-700)', marginBottom: '0.75rem' }}>
                        <span>📞 {shop.phone}</span>
                        <span>🕒 {shop.openingHours || '8:00 AM - 10:00 PM'}</span>
                        <span style={{ color: '#d97706', fontWeight: 700 }}>★ {shop.rating || 4.8}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/geofence?shopId=${shop._id}`}
                          className="btn btn-outline-teal btn-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Compass size={14} /> Set Geofence
                        </Link>
                        <Link
                          to={`/search?shopName=${encodeURIComponent(shop.shopName)}`}
                          className="btn btn-primary btn-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Inventory →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map */}
          <div>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Interactive Pharmacy Map
                </h3>
                {selectedShop && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--teal-700)', fontWeight: 600 }}>
                    Active: {selectedShop.shopName}
                  </span>
                )}
              </div>

              <PharmacyMap
                userLocation={userLocation}
                pharmacies={shops}
                selectedShopId={selectedShop?._id}
                onSelectShop={(s) => setSelectedShop(s)}
                height="540px"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .pharmacy-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
