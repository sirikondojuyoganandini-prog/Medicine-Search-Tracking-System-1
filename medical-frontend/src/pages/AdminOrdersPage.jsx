import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ArrowLeft, Store, User, Edit } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Status Override Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusVal, setStatusVal] = useState('Delivered');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const { showToast } = useNotification();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
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

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.patch(`/admin/orders/${selectedOrder._id}/status`, {
        status: statusVal,
        note: adminNote || 'Status updated by System Administrator override',
      });
      if (res.data.success) {
        showToast('Order status updated by administrator', 'success');
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.shopId?.shopName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--teal-600)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Admin Overview
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
                All Platform Customer Orders
              </h1>
              <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
                Full system order registry across all medical shops ({orders.length} total orders).
              </p>
            </div>

            <div style={{ minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Search by order ID, patient, pharmacy..."
                className="form-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Pharmacy</th>
                <th>Items Summary</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
                    No orders match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{ord.orderNumber}</div>
                    </td>
                    <td>
                      <div>{ord.customerId?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{ord.customerId?.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--teal-700)' }}>{ord.shopId?.shopName}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--navy-900)' }}>₹{ord.totalAmount}</td>
                    <td>
                      <span
                        className={`badge ${
                          ord.orderStatus === 'Delivered'
                            ? 'badge-in-stock'
                            : ord.orderStatus === 'Cancelled'
                            ? 'badge-out-stock'
                            : 'badge-primary'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setStatusVal(ord.orderStatus);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        <Edit size={14} /> Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Status Override Modal */}
        {selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '460px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
                Admin Status Override: {selectedOrder.orderNumber}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)', marginBottom: '1.25rem' }}>
                Manually update status or resolve dispute for customer {selectedOrder.customerId?.name}.
              </p>

              <form onSubmit={handleUpdateStatus}>
                <div className="form-group">
                  <label className="form-label">Set New Order Status</label>
                  <select
                    className="form-select"
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Administrative Reason Note</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Verified delivered via customer helpline"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn btn-primary"
                  >
                    {updating ? 'Saving...' : 'Apply Status Override'}
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
