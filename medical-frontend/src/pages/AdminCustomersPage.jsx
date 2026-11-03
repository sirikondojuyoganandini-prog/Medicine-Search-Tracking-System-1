import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trash2, CheckCircle, Clock, Search, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotification();

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      if (res.data.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      showToast('Error loading customer records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (customerId, customerName) => {
    const confirm = window.confirm(`Are you sure you want to delete customer account "${customerName}"? This will remove all their health records.`);
    if (!confirm) return;

    try {
      const res = await api.delete(`/admin/customers/${customerId}`);
      if (res.data.success) {
        showToast(`Customer "${customerName}" deleted`, 'info');
        setCustomers((prev) => prev.filter((c) => c._id !== customerId));
      }
    } catch (err) {
      showToast('Failed to delete customer', 'error');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
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
                Customer Account Management
              </h1>
              <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
                All registered patients and customers on the MediTrack platform ({customers.length} total).
              </p>
            </div>

            <div style={{ minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Search customers by name or email..."
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
                <th>Customer Name</th>
                <th>Email & Phone</th>
                <th>Registered Location</th>
                <th>Health Profile</th>
                <th>Orders Placed</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    Loading registered customers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
                    No customer accounts match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{c.name}</div>
                    </td>
                    <td>
                      <div>{c.email}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{c.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{c.location?.city || c.address || 'New Delhi'}</div>
                    </td>
                    <td>
                      {c.healthCompleted ? (
                        <span className="badge badge-in-stock">
                          <CheckCircle size={12} /> Completed
                        </span>
                      ) : (
                        <span className="badge badge-low-stock">
                          <Clock size={12} /> Pending Setup
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--teal-700)' }}>{c.orderCount || 0}</strong>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(c._id, c.name)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--rose-600)', borderColor: 'var(--rose-100)' }}
                        title="Delete Customer Account"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
