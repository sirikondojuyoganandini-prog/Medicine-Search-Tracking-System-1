import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Pill,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function ShopDashboard() {
  const { user, shop } = useAuth();
  const { showToast } = useNotification();

  const [stats, setStats] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShopData = async () => {
    try {
      const [profileRes, ordersRes, medicinesRes] = await Promise.all([
        api.get('/shops/profile'),
        api.get('/shops/orders?status=Pending'),
        api.get('/medicines/shop/my?lowStock=true'),
      ]);

      if (profileRes.data.success) {
        setStats(profileRes.data.stats);
        setShopData(profileRes.data.shop);
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.orders.slice(0, 5));
      }
      if (medicinesRes.data.success) {
        setLowStockMeds(medicinesRes.data.medicines.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load shop dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/shops/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        fetchShopData();
      }
    } catch (err) {
      showToast('Failed to update order status', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ color: 'var(--teal-600)', fontWeight: 600 }}>Loading pharmacy metrics...</div>
      </div>
    );
  }

  const activeShop = shopData || shop;

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '1120px' }}>
        {/* Pharmacy Top Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--navy-900), var(--teal-800))',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary">Licensed Medical Shop</span>
              {activeShop?.isFrozen ? (
                <span className="badge badge-out-stock">Shop Frozen by Admin</span>
              ) : activeShop?.isApproved ? (
                <span className="badge badge-in-stock">Verified & Active</span>
              ) : (
                <span className="badge badge-low-stock">Pending Approval</span>
              )}
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {activeShop?.shopName || 'Pharmacy Dashboard'}
            </h1>
            <p style={{ color: 'var(--slate-300)', fontSize: '0.9rem' }}>
              📍 {activeShop?.address} • License: {activeShop?.licenseNumber}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/shop/medicines" className="btn btn-mint btn-lg">
              <Plus size={18} /> Manage Inventory
            </Link>
            <Link to="/shop/orders" className="btn btn-outline" style={{ color: 'var(--navy-900)' }}>
              <Package size={18} /> Incoming Orders
            </Link>
          </div>
        </div>

        {/* Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-600)' }}>Total Medicines</span>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pill size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {stats?.totalMedicines || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Active in inventory
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-600)' }}>Pending Orders</span>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--amber-100)', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400e' }}>
              {stats?.pendingOrders || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Needs preparation
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-600)' }}>Low Stock Alerts</span>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--rose-600)' }}>
              {stats?.lowStockCount || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Below alert threshold
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-600)' }}>Completed Earnings</span>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--mint-50)', color: 'var(--mint-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--mint-600)' }}>
              ₹{stats?.totalEarnings || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              From delivered orders
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Incoming Orders & Low Stock */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }} className="shop-dash-grid">
          {/* Pending Orders */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                Incoming Customer Orders
              </h2>
              <Link to="/shop/orders" style={{ fontSize: '0.85rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                Manage All Orders →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Package size={36} color="var(--slate-400)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
                  No pending orders right now
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--navy-600)' }}>
                  New orders placed by nearby customers will appear here in real-time.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order) => (
                  <div key={order._id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{order.orderNumber}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                          Customer: {order.customerId?.name} ({order.customerId?.phone || 'No phone'})
                        </div>
                      </div>
                      <span className="badge badge-primary">{order.orderStatus}</span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '0.75rem' }}>
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--teal-700)' }}>₹{order.totalAmount}</span>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order._id, 'Confirmed')}
                          className="btn btn-primary btn-sm"
                        >
                          Accept Order
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order._id, 'Cancelled')}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--rose-600)' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Warning Column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                Low Stock Alerts
              </h2>
              <Link to="/shop/medicines" style={{ fontSize: '0.85rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                Inventory →
              </Link>
            </div>

            {lowStockMeds.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <CheckCircle size={36} color="var(--mint-500)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
                  All Inventory Levels Healthy
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--navy-600)' }}>
                  No medicines currently below their minimum stock alert limit.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {lowStockMeds.map((med) => (
                  <div
                    key={med._id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--rose-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--rose-100)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>{med.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--rose-600)', fontWeight: 600 }}>
                        Current Stock: {med.stock} (Alert at {med.minStockAlert})
                      </div>
                    </div>

                    <Link to="/shop/medicines" className="btn btn-outline btn-sm" style={{ backgroundColor: 'var(--white)' }}>
                      Restock
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Links Card */}
            <div className="card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
                Pharmacy Quick Actions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <Link to="/shop/profile" className="sidebar-link">
                  <MapPin size={16} /> Update Pharmacy GPS Location
                </Link>
                <Link to="/shop/feedbacks" className="sidebar-link">
                  <Store size={16} /> View Customer Ratings & Reviews
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .shop-dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
