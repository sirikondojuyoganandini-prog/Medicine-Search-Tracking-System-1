import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Store,
  MapPin,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export default function CartPage() {
  const { items, activeShop, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [address, setAddress] = useState(user?.address || 'H-12, Barakhamba Road, Connaught Place, New Delhi');
  const [phone, setPhone] = useState(user?.phone || '+91 99100 88221');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in as customer to place your order', 'info');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!activeShop || !activeShop._id) {
      showToast('Pharmacy identification error', 'error');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderPayload = {
        shopId: activeShop._id,
        items: items.map((item) => ({
          medicineId: item.medicineId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod,
        deliveryAddress: {
          fullName: user.name,
          street: address,
          phone: phone,
          notes: notes,
        },
      };

      const res = await api.post('/orders', orderPayload);
      if (res.data.success && res.data.order) {
        showToast('Order confirmed and sent to pharmacy!', 'success');
        clearCart();
        navigate(`/orders/confirm/${res.data.order._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '4rem 1rem', minHeight: '80vh', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '500px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--slate-100)',
              color: 'var(--slate-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <ShoppingCart size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Search prescribed medications and select from registered medical shops to build your order.
          </p>
          <Link to="/search" className="btn btn-primary btn-lg">
            Search Medicines Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        <h1 className="title-section" style={{ marginBottom: '0.35rem' }}>
          Review Your Pharmacy Order
        </h1>
        <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Confirm items, quantities, delivery address, and payment method.
        </p>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--rose-50)',
              color: 'var(--rose-600)',
              border: '1px solid var(--rose-100)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="cart-grid">
          {/* Left Column: Cart Items List */}
          <div>
            {/* Pharmacy Banner */}
            {activeShop && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '1rem',
                  backgroundColor: 'var(--teal-50)',
                  border: '1px solid var(--teal-100)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1.25rem',
                }}
              >
                <Store size={22} color="var(--teal-700)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                    Fulfilling Pharmacy: {activeShop.shopName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                    📍 {activeShop.address}
                  </div>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.medicineId}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {item.dosageForm} • Max Stock: {item.maxStock}
                        </div>
                      </td>
                      <td>₹{item.price}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                            className="btn btn-outline btn-sm"
                            style={{ width: '26px', height: '26px', padding: 0 }}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="btn btn-outline btn-sm"
                            style={{ width: '26px', height: '26px', padding: 0 }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--teal-700)' }}>
                        ₹{item.subtotal}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.medicineId)}
                          style={{ background: 'none', border: 'none', color: 'var(--rose-600)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Delivery Details Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '1rem' }}>
                Delivery Information
              </h3>

              <div className="form-group">
                <label className="form-label">Delivery Street Address *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Apartment, Street address, locality"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Special Delivery Instructions</label>
                  <input
                    type="text"
                    className="form-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Ring bell, leave with security"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div>
            <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '1.25rem' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--navy-700)' }}>
                  <span>Items Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>₹{cartTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--navy-700)' }}>
                  <span>Pharmacy Verification Fee:</span>
                  <span style={{ fontWeight: 600, color: 'var(--mint-600)' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--navy-700)' }}>
                  <span>Delivery / Pickup:</span>
                  <span style={{ fontWeight: 600, color: 'var(--mint-600)' }}>FREE</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--navy-900)',
                    borderTop: '1px solid var(--slate-200)',
                    paddingTop: '0.75rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--teal-700)' }}>₹{cartTotal}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <label className="form-label">Payment Method</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'Cash on Delivery' ? '2px solid var(--teal-600)' : '1px solid var(--slate-300)',
                      backgroundColor: paymentMethod === 'Cash on Delivery' ? 'var(--teal-50)' : 'var(--white)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => setPaymentMethod('Cash on Delivery')}
                      style={{ accentColor: 'var(--teal-600)' }}
                    />
                    💵 Cash on Delivery
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'Pay at Pharmacy' ? '2px solid var(--teal-600)' : '1px solid var(--slate-300)',
                      backgroundColor: paymentMethod === 'Pay at Pharmacy' ? 'var(--teal-50)' : 'var(--white)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'Pay at Pharmacy'}
                      onChange={() => setPaymentMethod('Pay at Pharmacy')}
                      style={{ accentColor: 'var(--teal-600)' }}
                    />
                    🏥 Pay at Pharmacy (In-Store Pickup)
                  </label>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handlePlaceOrder}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '0.75rem' }}
              >
                {submitting ? 'Confirming Order...' : 'Confirm & Place Order'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                <ShieldCheck size={14} color="var(--mint-600)" />
                Authentic Pharmacy Inventory Guaranteed
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
