import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Store, MapPin, ArrowRight, Printer } from 'lucide-react';
import api from '../services/api';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading || !order) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ color: 'var(--teal-600)', fontWeight: 600 }}>Loading order receipt...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--mint-50)',
              color: 'var(--mint-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <CheckCircle size={36} />
          </div>

          <span className="badge badge-in-stock" style={{ marginBottom: '0.65rem' }}>
            Order Confirmed & Logged
          </span>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
            Thank You for Your Order!
          </h1>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Your order has been transmitted to <strong>{order.shopId?.shopName}</strong> for preparation.
          </p>

          {/* Receipt Details Box */}
          <div
            style={{
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid var(--slate-200)',
              textAlign: 'left',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Order Number</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal-700)' }}>{order.orderNumber}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Placed At</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-800)' }}>
                  {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Pharmacy Partner</div>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{order.shopId?.shopName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>📍 {order.shopId?.address} • 📞 {order.shopId?.phone}</div>
            </div>

            <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Purchased Medicines</div>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  <span>{item.quantity}x {item.name} ({item.dosageForm})</span>
                  <span style={{ fontWeight: 600 }}>₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem', fontWeight: 800, fontSize: '1.15rem', color: 'var(--navy-900)' }}>
              <span>Total Paid / Due:</span>
              <span style={{ color: 'var(--teal-700)' }}>₹{order.totalAmount}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Payment Mode: {order.paymentMethod} ({order.paymentStatus})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/orders/track/${order._id}`} className="btn btn-primary btn-lg">
              Track Order Live <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="btn btn-outline">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
