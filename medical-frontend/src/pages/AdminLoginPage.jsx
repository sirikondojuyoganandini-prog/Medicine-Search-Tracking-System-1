import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@meditrack.com');
  const [password, setPassword] = useState('adminPassword123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await login(email, password, 'admin');
      showToast('Admin authenticated successfully', 'success');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Admin authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '440px',
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
              backgroundColor: 'var(--navy-900)',
              color: 'var(--mint-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
            System Administration
          </h2>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.875rem' }}>
            Authorized portal for MediTrack system management, user audits, and pharmacy verifications.
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
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {submitting ? 'Verifying Admin Access...' : 'Sign In as System Admin'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>
            ← Back to Customer / Pharmacy Login
          </Link>
        </div>
      </div>
    </div>
  );
}
