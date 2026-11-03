import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Search,
  MapPin,
  Clock,
  Package,
  Bell,
  Compass,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  User,
  Heart,
  Pill,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function CustomerDashboard() {
  const { user, healthProfile } = useAuth();
  const { showToast } = useNotification();

  const [recentOrders, setRecentOrders] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, remindersRes] = await Promise.all([
          api.get('/orders/my'),
          api.get('/reminders'),
        ]);

        if (ordersRes.data.success) {
          setRecentOrders(ordersRes.data.orders.slice(0, 3));
        }
        if (remindersRes.data.success) {
          setReminders(remindersRes.data.reminders.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const isHealthComplete = user?.isHealthProfileComplete || healthProfile?.isCompleted;

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '1120px' }}>
        {/* Welcome Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--teal-700), var(--navy-900))',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem 2.5rem',
            color: 'var(--white)',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--mint-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Customer Portal
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Welcome back, {user?.name || 'Customer'}!
            </h1>
            <p style={{ color: 'var(--slate-300)', fontSize: '0.95rem', maxWidth: '520px' }}>
              Track medicine availability in nearby verified pharmacies, maintain your daily medication routines, and monitor delivery orders.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/search" className="btn btn-mint btn-lg">
              <Search size={18} /> Search Medicines
            </Link>
            <Link to="/pharmacies" className="btn btn-outline" style={{ color: 'var(--navy-900)' }}>
              <MapPin size={18} /> Discover Pharmacies
            </Link>
          </div>
        </div>

        {/* Health Profile Alert Callout if incomplete */}
        {!isHealthComplete && (
          <div
            style={{
              backgroundColor: 'var(--amber-100)',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={24} color="#92400e" flexShrink={0} />
              <div>
                <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.95rem' }}>
                  Complete Your 6-Step Health Profile
                </div>
                <div style={{ fontSize: '0.85rem', color: '#78350f' }}>
                  Add your current medications, known drug allergies, and routine times to personalize your experience.
                </div>
              </div>
            </div>
            <Link to="/health-profile" className="btn btn-sm btn-primary">
              Continue Health Setup →
            </Link>
          </div>
        )}

        {/* Quick Hub Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <Link to="/search" className="card card-hover" style={{ padding: '1.5rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Search size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
              Search Medicines
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--navy-600)' }}>
              Find availability and compare prices across nearby medical shops.
            </p>
          </Link>

          <Link to="/pharmacies" className="card card-hover" style={{ padding: '1.5rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--mint-50)', color: 'var(--mint-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <MapPin size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
              Nearby Pharmacies
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--navy-600)' }}>
              Interactive OpenStreetMap view with exact distances & timings.
            </p>
          </Link>

          <Link to="/reminders" className="card card-hover" style={{ padding: '1.5rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Bell size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
              Dose Reminders
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--navy-600)' }}>
              Schedule automated browser notifications and log taken doses.
            </p>
          </Link>

          <Link to="/geofence" className="card card-hover" style={{ padding: '1.5rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--mint-50)', color: 'var(--mint-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Compass size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
              Geofence Radius
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--navy-600)' }}>
              Set proximity alerts for when you walk near your pharmacy.
            </p>
          </Link>
        </div>

        {/* Two-Column Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }} className="dash-grid">
          {/* Recent Orders Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                Recent Medicine Orders
              </h2>
              <Link to="/orders" style={{ fontSize: '0.85rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                View All Orders →
              </Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <Package size={36} color="var(--slate-400)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '0.35rem' }}>No orders placed yet</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--navy-600)', marginBottom: '1rem' }}>
                  Search any medicine to view neighborhood pharmacy availability and order online.
                </p>
                <Link to="/search" className="btn btn-outline-teal btn-sm">
                  Search Now
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentOrders.map((order) => (
                  <div key={order._id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{order.orderNumber}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{order.shopId?.shopName}</div>
                      </div>
                      <span className="badge badge-primary">{order.orderStatus}</span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '0.75rem' }}>
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--slate-100)', paddingTop: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--teal-700)' }}>₹{order.totalAmount}</span>
                      <Link to={`/orders/track/${order._id}`} className="btn btn-outline btn-sm">
                        Track Status →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Reminders & Health Profile Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Health Profile Widget */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Activity size={18} color="var(--teal-600)" /> Health Profile
                </h3>
                <span className={`badge ${isHealthComplete ? 'badge-in-stock' : 'badge-low-stock'}`}>
                  {isHealthComplete ? 'Verified Active' : 'Setup Incomplete'}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--navy-700)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div><strong>Conditions:</strong> {healthProfile?.conditions?.length ? healthProfile.conditions.join(', ') : 'None recorded'}</div>
                <div><strong>Allergies:</strong> {healthProfile?.knownMedicineAllergies ? healthProfile.allergyDetails : 'No known drug allergies'}</div>
                <div><strong>Active Meds:</strong> {healthProfile?.currentMedications?.length || 0} prescribed</div>
              </div>

              <Link to="/health-profile" className="btn btn-outline-teal btn-sm" style={{ width: '100%' }}>
                Edit Health Profile
              </Link>
            </div>

            {/* Reminders Widget */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={18} color="var(--teal-600)" /> Upcoming Reminders
                </h3>
                <Link to="/reminders" style={{ fontSize: '0.8rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                  Manage
                </Link>
              </div>

              {reminders.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', textAlign: 'center', padding: '1rem 0' }}>
                  No reminders configured for today.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {reminders.map((r) => (
                    <div
                      key={r._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.65rem',
                        backgroundColor: 'var(--slate-50)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy-900)' }}>{r.medicineName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{r.dosage} ({r.foodTiming})</div>
                      </div>
                      <span className="badge badge-primary">{r.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
