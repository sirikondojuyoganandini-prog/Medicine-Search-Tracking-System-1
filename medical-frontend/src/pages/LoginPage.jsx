import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User, Store, Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer', 'shop', 'admin'
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await login(email, password, role);
      showToast(`Welcome back, ${data.user.name}!`, 'success');

      // Navigate based on returned role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'shop') {
        navigate('/shop');
      } else {
        // If customer has not completed health profile, guide them to health setup
        if (!data.user.isHealthProfileComplete) {
          navigate('/health-profile');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const autofillDemo = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'customer') {
      setEmail('rahul@meditrack.com');
      setPassword('customerPassword123!');
    } else if (selectedRole === 'shop') {
      setEmail('apollo@meditrack.com');
      setPassword('shopPassword123!');
    } else if (selectedRole === 'admin') {
      setEmail('admin@meditrack.com');
      setPassword('adminPassword123!');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--slate-200)',
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
            <LogIn size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
            Welcome to MediTrack
          </h2>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
            Sign in to access your medicine orders, pharmacy inventory, or administration.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            backgroundColor: 'var(--slate-100)',
            borderRadius: 'var(--radius-md)',
            padding: '0.3rem',
            marginBottom: '1.5rem',
            gap: '0.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => { setRole('customer'); setError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.825rem',
              fontWeight: 600,
              backgroundColor: role === 'customer' ? 'var(--white)' : 'transparent',
              color: role === 'customer' ? 'var(--teal-700)' : 'var(--navy-600)',
              boxShadow: role === 'customer' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <User size={15} /> Customer
          </button>

          <button
            type="button"
            onClick={() => { setRole('shop'); setError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.825rem',
              fontWeight: 600,
              backgroundColor: role === 'shop' ? 'var(--white)' : 'transparent',
              color: role === 'shop' ? 'var(--teal-700)' : 'var(--navy-600)',
              boxShadow: role === 'shop' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <Store size={15} /> Pharmacy
          </button>

          <button
            type="button"
            onClick={() => { setRole('admin'); setError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.825rem',
              fontWeight: 600,
              backgroundColor: role === 'admin' ? 'var(--white)' : 'transparent',
              color: role === 'admin' ? 'var(--teal-700)' : 'var(--navy-600)',
              boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <Shield size={15} /> Admin
          </button>
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
              textAlign: 'left',
            }}
          >
            <AlertCircle size={18} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder={role === 'customer' ? 'e.g. rahul@meditrack.com' : role === 'shop' ? 'e.g. apollo@meditrack.com' : 'admin@meditrack.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
            </div>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
          >
            {submitting ? 'Authenticating...' : `Sign In as ${role === 'customer' ? 'Customer' : role === 'shop' ? 'Pharmacy' : 'Admin'}`}
          </button>
        </form>

        {/* Quick Demo Credentials Autofill Helper */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '1rem',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--slate-300)',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ⚡ Fast Demo Credentials Autofill:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => autofillDemo('customer')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              👤 Rahul (Customer)
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('shop')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              🏥 Apollo (Pharmacy)
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('admin')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--navy-600)' }}>
          Don't have an account yet?{' '}
          <Link
            to={role === 'shop' ? '/register-shop' : '/register'}
            style={{ color: 'var(--teal-600)', fontWeight: 600 }}
          >
            {role === 'shop' ? 'Register Pharmacy' : 'Register as Customer'}
          </Link>
        </div>
      </div>
    </div>
  );
}
