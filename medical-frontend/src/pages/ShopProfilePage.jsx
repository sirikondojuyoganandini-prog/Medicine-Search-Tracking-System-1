import { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function ShopProfilePage() {
  const { shop, updateShopProfileState } = useAuth();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    lat: 28.6139,
    lng: 77.2090,
    openingHours: '',
    isOpen24Hours: false,
    deliveryRadiusKm: 10,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/shops/profile');
        if (res.data.success && res.data.shop) {
          const s = res.data.shop;
          setFormData({
            shopName: s.shopName || '',
            phone: s.phone || '',
            address: s.address || '',
            city: s.city || '',
            pincode: s.pincode || '',
            lat: s.location?.lat || 28.6139,
            lng: s.location?.lng || 77.2090,
            openingHours: s.openingHours || '8:00 AM - 10:00 PM',
            isOpen24Hours: Boolean(s.isOpen24Hours),
            deliveryRadiusKm: s.deliveryRadiusKm || 10,
          });
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }));
          showToast('GPS coordinates updated to current location', 'success');
          setLocating(false);
        },
        () => {
          showToast('Could not fetch location automatically', 'info');
          setLocating(false);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put('/shops/profile', formData);
      if (res.data.success) {
        showToast('Pharmacy profile & GPS location saved!', 'success');
        updateShopProfileState(res.data.shop);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>Loading pharmacy profile...</div>;
  }

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
          Pharmacy Profile & Location Management
        </h1>
        <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Update store contact information, operating hours, and exact map coordinates for customer distance calculation.
        </p>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Pharmacy Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Physical Street Address *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>

            {/* GPS Coordinates Box */}
            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-200)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--navy-900)' }}>
                  📍 Exact Store GPS Coordinates (for Haversine Search)
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="btn btn-outline-teal btn-sm"
                >
                  <MapPin size={14} />
                  {locating ? 'Detecting...' : 'Detect GPS Location'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="form-input"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="form-input"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Timing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Operating Hours</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="isOpen24h"
                  checked={formData.isOpen24Hours}
                  onChange={(e) => setFormData({ ...formData, isOpen24Hours: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--teal-600)' }}
                />
                <label htmlFor="isOpen24h" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Open 24 Hours Daily
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {submitting ? 'Saving Profile...' : 'Save Pharmacy Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
