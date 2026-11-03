import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, MapPin, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function RegisterShopPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    licenseNumber: '',
    address: '',
    city: 'New Delhi',
    pincode: '110001',
    lat: 28.6315,
    lng: 77.2167,
    openingHours: '8:00 AM - 10:00 PM',
    isOpen24Hours: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const { registerShop } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

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
          showToast('Pharmacy coordinates detected successfully!', 'success');
          setLocating(false);
        },
        () => {
          showToast('Could not fetch GPS automatically. Please adjust coordinates manually.', 'info');
          setLocating(false);
        }
      );
    }
  };

  const handlePresetLocation = (lat, lng, name) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    showToast(`Location set to ${name}`, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await registerShop(formData);
      showToast('Pharmacy registered successfully! Welcome to your dashboard.', 'success');
      navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Pharmacy registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '600px',
          width: '100%',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--slate-200)',
          textAlign: 'left',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--teal-50)',
              color: 'var(--teal-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Store size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
            Register Medical Shop
          </h2>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
            List your inventory, discover nearby patient prescriptions, and manage pickup or delivery orders.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--rose-50)',
              color: 'var(--rose-600)',
              border: '1px solid var(--rose-100)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Pharmacy Details */}
          <h4 style={{ color: 'var(--teal-700)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.35rem' }}>
            Pharmacy Details
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Pharmacy / Shop Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Apollo Pharmacy"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Drug License No. *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. DL-ND-2026-1082"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Physical Address *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Shop No., Market / Road, Area"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

          {/* Coordinates & Geolocation */}
          <div
            style={{
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              border: '1px solid var(--slate-200)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <label className="form-label" style={{ marginBottom: 0, fontWeight: 700 }}>
                Map Coordinates (Lat / Lng)
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                className="btn btn-outline-teal btn-sm"
              >
                <MapPin size={14} />
                {locating ? 'Detecting...' : 'Detect GPS'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="Latitude"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              />
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="Longitude"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--slate-500)', fontWeight: 600 }}>Quick Presets:</span>
              <button type="button" onClick={() => handlePresetLocation(28.6315, 77.2167, 'Connaught Place')} style={{ padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>CP (28.63, 77.21)</button>
              <button type="button" onClick={() => handlePresetLocation(28.6517, 77.1906, 'Karol Bagh')} style={{ padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>Karol Bagh (28.65, 77.19)</button>
              <button type="button" onClick={() => handlePresetLocation(28.5700, 77.2400, 'Lajpat Nagar')} style={{ padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>Lajpat Nagar (28.57, 77.24)</button>
            </div>
          </div>

          {/* Timing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Operating Hours</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 8:00 AM - 10:00 PM"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <input
                type="checkbox"
                id="isOpen24"
                checked={formData.isOpen24Hours}
                onChange={(e) => setFormData({ ...formData, isOpen24Hours: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--teal-600)' }}
              />
              <label htmlFor="isOpen24" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-800)' }}>
                24 Hours Open
              </label>
            </div>
          </div>

          {/* Owner Account Details */}
          <h4 style={{ color: 'var(--teal-700)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.35rem' }}>
            Owner Login Credentials
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Owner Full Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Pharmacist / Owner Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="+91 98110 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Owner Email *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="owner@pharmacy.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password * (min. 6)</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Registering Pharmacy...' : 'Complete Pharmacy Registration'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--navy-600)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>
            Sign In as Pharmacy
          </Link>
        </div>
      </div>
    </div>
  );
}
