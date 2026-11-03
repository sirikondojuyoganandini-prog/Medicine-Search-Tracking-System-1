import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Store,
  Pill,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotification();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setLowStockMedicines(res.data.lowStockMedicines || []);
          setRecentOrders(res.data.recentOrders || []);
          setRecentFeedbacks(res.data.recentFeedbacks || []);
        }
      } catch (err) {
        showToast('Error loading administrative data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>Loading system metrics...</div>;
  }

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '1120px' }}>
        {/* Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #090d16, #1e293b)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem 2.5rem',
            color: 'var(--white)',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--mint-400)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              <Shield size={16} /> MediTrack Master Control Panel
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              System Administrator Dashboard
            </h1>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem' }}>
              Monitor customer registrations, pharmacy authorizations, platform-wide inventory, and order operations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/admin/shops" className="btn btn-primary">
              <Store size={18} /> Manage Pharmacies
            </Link>
            <Link to="/admin/customers" className="btn btn-outline" style={{ color: 'var(--navy-900)' }}>
              <Users size={18} /> Manage Customers
            </Link>
          </div>
        </div>

        {/* 6 Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-600)' }}>Customers</span>
              <Users size={18} color="var(--teal-600)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>{stats?.totalCustomers || 0}</div>
            <Link to="/admin/customers" style={{ fontSize: '0.75rem', color: 'var(--teal-600)', fontWeight: 600 }}>
              View user list →
            </Link>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-600)' }}>Medical Shops</span>
              <Store size={18} color="var(--teal-600)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>{stats?.totalShops || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              {stats?.approvedShops} approved • {stats?.frozenShops} frozen
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-600)' }}>Total Medicines</span>
              <Pill size={18} color="var(--teal-600)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>{stats?.totalMedicines || 0}</div>
            <Link to="/admin/medicines" style={{ fontSize: '0.75rem', color: 'var(--teal-600)', fontWeight: 600 }}>
              View all listings →
            </Link>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-600)' }}>Total Orders</span>
              <Package size={18} color="var(--teal-600)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>{stats?.totalOrders || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>
              {stats?.pendingOrders} pending fulfillment
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--navy-600)' }}>Gross Platform Volume</span>
              <TrendingUp size={18} color="var(--mint-600)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--mint-600)' }}>₹{stats?.totalRevenue || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Completed orders value
            </div>
          </div>
        </div>

        {/* Administration Navigation Quick Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            backgroundColor: 'var(--white)',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--slate-200)',
            marginBottom: '2rem',
          }}
        >
          <Link to="/admin/customers" className="btn btn-outline btn-sm">
            👥 All Customers ({stats?.totalCustomers})
          </Link>
          <Link to="/admin/shops" className="btn btn-outline btn-sm">
            🏥 All Medical Shops ({stats?.totalShops})
          </Link>
          <Link to="/admin/medicines" className="btn btn-outline btn-sm">
            💊 Medicines Management ({stats?.totalMedicines})
          </Link>
          <Link to="/admin/orders" className="btn btn-outline btn-sm">
            📦 System Orders ({stats?.totalOrders})
          </Link>
          <Link to="/admin/feedbacks" className="btn btn-outline btn-sm">
            ⭐ Patient Feedbacks
          </Link>
        </div>

        {/* Overview Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '2rem' }} className="admin-grid">
          {/* Recent Orders Across Network */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                System-Wide Recent Orders
              </h3>
              <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--slate-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                      {ord.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      Customer: {ord.customerId?.name} • Shop: {ord.shopId?.shopName}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--teal-700)', fontSize: '0.95rem' }}>₹{ord.totalAmount}</div>
                    <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{ord.orderStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Watchlist */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={18} color="var(--rose-600)" />
                Low Stock Watchlist
              </h3>
              <span className="badge badge-low-stock">{lowStockMedicines.length} Alerting</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {lowStockMedicines.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                  No low stock alerts across the network.
                </div>
              ) : (
                lowStockMedicines.map((m) => (
                  <div
                    key={m._id}
                    style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--rose-50)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--rose-100)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy-900)' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>Shop: {m.shopId?.shopName}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--rose-600)', fontSize: '0.85rem' }}>
                      {m.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .admin-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
