import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  Store,
  Star,
  MapPin,
  ExternalLink,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState(null); // { orderId, shopId, shopName }
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const { showToast } = useNotification();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenFeedback = (order) => {
    setFeedbackModal({
      orderId: order._id,
      shopId: order.shopId?._id,
      shopName: order.shopId?.shopName,
    });
    setRating(5);
    setComment('');
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please enter your review feedback', 'error');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await api.post('/customer/feedback', {
        shopId: feedbackModal.shopId,
        orderId: feedbackModal.orderId,
        rating,
        comment,
      });

      if (res.data.success) {
        showToast('Feedback submitted successfully! Thank you.', 'success');
        setFeedbackModal(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'All') return true;
    return o.orderStatus === statusFilter;
  });

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
              My Medicine Orders
            </h1>
            <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
              View order history, status updates, and submit pharmacy reviews.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: statusFilter === st ? '1px solid var(--teal-600)' : '1px solid var(--slate-200)',
                  backgroundColor: statusFilter === st ? 'var(--teal-50)' : 'var(--white)',
                  color: statusFilter === st ? 'var(--teal-700)' : 'var(--navy-700)',
                  cursor: 'pointer',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>Loading your orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Package size={40} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>No orders found</h3>
            <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              You don't have any orders matching the selected filter.
            </p>
            <Link to="/search" className="btn btn-primary">
              Search Medicines
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredOrders.map((order) => (
              <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                      {order.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--teal-700)' }}>
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Pharmacy Info & Items */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Store size={16} color="var(--teal-600)" />
                      {order.shopId?.shopName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                      📍 {order.shopId?.address}
                    </div>

                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--navy-700)' }}>
                      <strong>Medicines:</strong>{' '}
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--navy-700)', backgroundColor: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div><strong>Payment:</strong> {order.paymentMethod}</div>
                    <div><strong>Delivery to:</strong> {order.deliveryAddress?.street || 'Standard address'}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem' }}>
                  {order.orderStatus === 'Delivered' && (
                    <button
                      type="button"
                      onClick={() => handleOpenFeedback(order)}
                      className="btn btn-outline btn-sm"
                    >
                      <Star size={14} color="#f59e0b" /> Leave Review
                    </button>
                  )}

                  <Link to={`/orders/track/${order._id}`} className="btn btn-primary btn-sm">
                    Track Order Live <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {feedbackModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '480px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
                Review {feedbackModal.shopName}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)', marginBottom: '1.25rem' }}>
                Your rating helps local customers find reliable pharmacy service.
              </p>

              <form onSubmit={handleSubmitFeedback}>
                <div className="form-group">
                  <label className="form-label">Rating (1 to 5 Stars)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.75rem',
                          color: star <= rating ? '#f59e0b' : 'var(--slate-300)',
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Comments & Experience</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe packaging, medicine authenticity, customer service..."
                    className="form-textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setFeedbackModal(null)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="btn btn-primary"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Review'}
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
