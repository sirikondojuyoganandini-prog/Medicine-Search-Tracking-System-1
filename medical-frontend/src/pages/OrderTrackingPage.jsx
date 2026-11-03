import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Store,
  MapPin,
  Phone,
  ArrowLeft,
  Truck,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const { showToast } = useNotification();

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      showToast('Order not found or access unauthorized', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Auto refresh status every 15 seconds
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async () => {
    const confirm = window.confirm('Are you sure you want to cancel this order? Any reserved medicine stock will be restored.');
    if (!confirm) return;

    setCancelling(true);
    try {
      const res = await api.patch(`/orders/${id}/cancel`, { reason: 'Customer requested cancellation' });
      if (res.data.success) {
        showToast('Order cancelled successfully', 'info');
        setOrder(res.data.order);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !order) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ color: 'var(--teal-600)', fontWeight: 600 }}>Loading order tracking data...</div>
      </div>
    );
  }

  const stages = [
    { key: 'Pending', label: 'Order Placed' },
    { key: 'Confirmed', label: 'Accepted by Pharmacy' },
    { key: 'Preparing', label: 'Packaging Medicines' },
    { key: 'Ready for Pickup', label: 'Ready for Pickup / Dispatch' },
    { key: 'Out for Delivery', label: 'Out for Delivery' },
    { key: 'Delivered', label: 'Delivered / Completed' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Link
            to="/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--teal-600)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <ArrowLeft size={16} /> Back to My Orders
          </Link>

          <span className="badge badge-primary" style={{ fontSize: '0.825rem' }}>
            Auto-refreshing status
          </span>
        </div>

        {/* Header Order Banner */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                Tracking Order
              </span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                {order.orderNumber}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                className={`badge ${
                  isCancelled
                    ? 'badge-out-stock'
                    : order.orderStatus === 'Delivered'
                    ? 'badge-in-stock'
                    : 'badge-primary'
                }`}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.9rem' }}
              >
                {order.orderStatus}
              </span>

              {!isCancelled && ['Pending', 'Confirmed'].includes(order.orderStatus) && (
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancelOrder}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--rose-600)', borderColor: 'var(--rose-100)' }}
                >
                  <RotateCcw size={14} /> Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Timeline Visual Tracker */}
          {isCancelled ? (
            <div
              style={{
                backgroundColor: 'var(--rose-50)',
                color: 'var(--rose-600)',
                border: '1px solid var(--rose-100)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                margin: '1rem 0',
              }}
            >
              <AlertTriangle size={24} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>This order was cancelled</div>
                <div style={{ fontSize: '0.85rem' }}>
                  All items have been released back into the pharmacy inventory.
                </div>
              </div>
            </div>
          ) : (
            <div className="timeline-track" style={{ overflowX: 'auto', padding: '1rem 0' }}>
              {stages.map((stage, idx) => {
                const isPassed = currentStageIndex > idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div key={stage.key} className="timeline-step">
                    <div
                      className={`timeline-circle ${
                        isCurrent ? 'active' : isPassed ? 'completed' : ''
                      }`}
                    >
                      {isPassed ? <CheckCircle size={18} /> : idx + 1}
                    </div>
                    <div className={`timeline-label ${isCurrent ? 'active' : ''}`}>
                      {stage.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Details Two-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }} className="track-grid">
          {/* Status History Logs */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '1.25rem' }}>
              Status History & Activity Log
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.statusHistory?.map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: i < order.statusHistory.length - 1 ? '1px solid var(--slate-100)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--teal-50)',
                      color: 'var(--teal-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Clock size={15} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                      {h.status}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--navy-600)' }}>{h.note}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                      {new Date(h.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pharmacy & Delivery Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
                Fulfilling Pharmacy
              </h3>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
                {order.shopId?.shopName}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--navy-600)', marginBottom: '0.75rem' }}>
                📍 {order.shopId?.address}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <Phone size={15} /> {order.shopId?.phone}
              </div>

              <Link
                to={`/geofence?shopId=${order.shopId?._id}`}
                className="btn btn-outline-teal btn-sm"
                style={{ width: '100%' }}
              >
                Track Proximity via Geofence
              </Link>
            </div>

            {/* Items Summary */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
                Items in this Order
              </h3>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span style={{ fontWeight: 600 }}>₹{item.subtotal}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--teal-700)' }}>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .track-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
