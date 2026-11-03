import { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function ShopOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Status Update Dialog
  const [statusModal, setStatusModal] = useState(null); // { orderId, currentStatus }
  const [newStatus, setNewStatus] = useState('Confirmed');
  const [statusNote, setStatusNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotification();

  const statuses = [
    'All',
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready for Pickup',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const fetchOrders = async () => {
    try {
      const res = await api.get('/shops/orders', {
        params: { status: statusFilter !== 'All' ? statusFilter : undefined },
      });
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      showToast('Error loading shop orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleOpenStatusModal = (order) => {
    setStatusModal(order);
    setNewStatus(order.orderStatus === 'Pending' ? 'Confirmed' : order.orderStatus);
    setStatusNote('');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.patch(`/shops/orders/${statusModal._id}/status`, {
        status: newStatus,
        note: statusNote || undefined,
      });

      if (res.data.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setStatusModal(null);
        fetchOrders();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
              Customer Order Fulfillment
            </h1>
            <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
              Accept incoming prescription orders, prepare packages, and track delivery or pickup.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: statusFilter === s ? '1px solid var(--teal-600)' : '1px solid var(--slate-200)',
                  backgroundColor: statusFilter === s ? 'var(--teal-50)' : 'var(--white)',
                  color: statusFilter === s ? 'var(--teal-700)' : 'var(--navy-700)',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>Loading incoming orders...</div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Package size={40} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>No orders found</h3>
            <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
              No customer orders currently match the selected status filter.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => (
              <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                        {order.orderNumber}
                      </span>
                      <span
                        className={`badge ${
                          order.orderStatus === 'Delivered'
                            ? 'badge-in-stock'
                            : order.orderStatus === 'Cancelled'
                            ? 'badge-out-stock'
                            : 'badge-primary'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                      Received: {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--teal-700)' }}>
                      ₹{order.totalAmount}
                    </div>
                    <span className="badge badge-neutral">{order.paymentMethod}</span>
                  </div>
                </div>

                {/* Customer Info & Ordered Medicines */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Customer Details</div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{order.customerId?.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--navy-700)' }}>📞 {order.customerId?.phone || 'No phone'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--navy-600)', marginTop: '2px' }}>
                      📍 {order.deliveryAddress?.street || 'Standard delivery address'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Prescribed Items</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                      {order.items.map((i, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span><strong>{i.quantity}x</strong> {i.name} ({i.dosageForm})</span>
                          <span style={{ fontWeight: 600 }}>₹{i.subtotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenStatusModal(order)}
                    className="btn btn-primary btn-sm"
                  >
                    Update Progress & Status →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Status Modal */}
        {statusModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '480px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
                Update Order Status: {statusModal.orderNumber}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)', marginBottom: '1.25rem' }}>
                Current stage: <strong>{statusModal.orderStatus}</strong>
              </p>

              <form onSubmit={handleUpdateStatusSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Next Stage</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Confirmed">Confirmed (Accept Order)</option>
                    <option value="Preparing">Preparing / Packaging</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered (Complete)</option>
                    <option value="Cancelled">Cancelled (Reject & Restore Stock)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status Update Note (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Packed in sterile pouch, ready at counter"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStatusModal(null)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    {submitting ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
