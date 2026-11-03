import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function RegisterCustomerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: 'New Delhi',
    lat: 28.6139,
    lng: 77.2090,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const { registerCustomer } = useAuth();
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
          showToast('GPS coordinates detected successfully!', 'success');
          setLocating(false);
        },
        (err) => {
          showToast('Could not fetch location automatically. Defaulted to New Delhi.', 'info');
          setLocating(false);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await registerCustomer({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        location: {
          lat: Number(formData.lat),
          lng: Number(formData.lng),
          city: formData.city,
          addressText: formData.address,
        },
      });

      showToast('Registration successful! Please complete your Health Profile.', 'success');
      navigate('/health-profile');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '520px',
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
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--teal-50)',
              color: 'var(--teal-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <UserPlus size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
            Create Customer Account
          </h2>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
            Search medicines, order from nearby verified shops, and track prescriptions.
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
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Create Password (min. 6 characters)</label>
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

          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Apartment, Street address, Locality"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                className="btn btn-outline-teal"
                style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
              >
                <MapPin size={16} />
                {locating ? 'Detecting...' : 'Detect GPS Location'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Creating Account...' : 'Continue to Health Profile Setup'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--navy-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
