import { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Activity, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function CustomerProfilePage() {
  const { user, updateUserProfile, healthProfile } = useAuth();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        showToast('Profile information updated', 'success');
        updateUserProfile(res.data.user);
      }
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
          My Account Profile
        </h1>
        <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Manage your personal details and registered delivery locations.
        </p>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--teal-600)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800 }}>
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>{user?.name}</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>{user?.email}</div>
              <span className="badge badge-primary" style={{ marginTop: '0.25rem' }}>Customer Role</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Delivery Street Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            >
              {submitting ? 'Saving Changes...' : 'Update Profile Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
