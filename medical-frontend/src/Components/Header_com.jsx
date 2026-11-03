import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  MapPin,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  Shield,
  Store,
  ChevronDown,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

export default function Header_com() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { cartCount } = useCart();
  const { browserPermission, requestNotificationPermission } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'shop') return '/shop';
    return '/dashboard';
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--white)',
        borderBottom: '1px solid var(--slate-200)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
        }}
      >
        {/* Brand Logo & Tagline */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--teal-600), var(--teal-700))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--white)',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)',
            }}
          >
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--navy-900)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              meditrack
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--teal-600)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Search • Track • Care
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.5rem',
          }}
          className="desktop-nav"
        >
          <Link
            to="/search"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--navy-700)',
              fontWeight: 600,
              fontSize: '0.925rem',
            }}
          >
            <Search size={18} color="var(--teal-600)" />
            Search Medicines
          </Link>

          <Link
            to="/pharmacies"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--navy-700)',
              fontWeight: 600,
              fontSize: '0.925rem',
            }}
          >
            <MapPin size={18} color="var(--teal-600)" />
            Pharmacy Discovery
          </Link>

          {isAuthenticated && role === 'customer' && (
            <Link
              to="/reminders"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--navy-700)',
                fontWeight: 600,
                fontSize: '0.925rem',
              }}
            >
              <Bell size={18} color="var(--teal-600)" />
              Reminders
            </Link>
          )}

          {isAuthenticated && role === 'customer' && (
            <Link
              to="/geofence"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--navy-700)',
                fontWeight: 600,
                fontSize: '0.925rem',
              }}
            >
              <Compass size={18} color="var(--teal-600)" />
              Geofence
            </Link>
          )}
        </nav>

        {/* Right Action Icons & Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Notification Permission Pill */}
          {browserPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="btn btn-outline-teal btn-sm"
              title="Enable browser notifications for reminders & geofence"
              style={{ display: 'none' }}
              id="notify-btn"
            >
              <Bell size={14} />
              Enable Alerts
            </button>
          )}

          {/* Cart Icon (Customer only or guest) */}
          {(!isAuthenticated || role === 'customer') && (
            <Link
              to="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--slate-100)',
                color: 'var(--navy-800)',
              }}
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--rose-600)',
                    color: 'var(--white)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    width: '19px',
                    height: '19px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Account / Auth Actions */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--teal-50)',
                  border: '1px solid var(--teal-100)',
                  cursor: 'pointer',
                  color: 'var(--teal-700)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--teal-600)',
                    color: 'var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name ? user.name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown size={14} />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '44px',
                    width: '220px',
                    backgroundColor: 'var(--white)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--slate-200)',
                    padding: '0.5rem',
                    zIndex: 200,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--slate-100)', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy-900)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{user.email}</div>
                    <span className="badge badge-primary" style={{ marginTop: '0.3rem', textTransform: 'uppercase' }}>
                      {role}
                    </span>
                  </div>

                  <Link
                    to={getDashboardPath()}
                    onClick={() => setUserDropdownOpen(false)}
                    className="sidebar-link"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                  >
                    {role === 'admin' ? <Shield size={16} /> : role === 'shop' ? <Store size={16} /> : <User size={16} />}
                    {role === 'admin' ? 'Admin Dashboard' : role === 'shop' ? 'Shop Dashboard' : 'Customer Dashboard'}
                  </Link>

                  {role === 'customer' && (
                    <>
                      <Link
                        to="/health-profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="sidebar-link"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                      >
                        <Activity size={16} />
                        Health Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="sidebar-link"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                      >
                        <ShoppingCart size={16} />
                        My Orders
                      </Link>
                    </>
                  )}

                  <div style={{ borderTop: '1px solid var(--slate-100)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--rose-600)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--navy-800)',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          #notify-btn { display: inline-flex !important; }
        }
        @media (max-width: 768px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
