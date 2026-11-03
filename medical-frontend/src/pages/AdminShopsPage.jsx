import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  CheckCircle,
  XCircle,
  Snowflake,
  Trash2,
  MapPin,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminShopsPage() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotification();

  const fetchShops = async () => {
    try {
      const res = await api.get('/admin/shops');
      if (res.data.success) {
        setShops(res.data.shops || []);
      }
    } catch (err) {
      showToast('Error loading registered shops', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleToggleApprove = async (shopId) => {
    try {
      const res = await api.patch(`/admin/shops/${shopId}/approve`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchShops();
      }
    } catch (err) {
      showToast('Failed to update shop approval', 'error');
    }
  };

  const handleToggleFreeze = async (shopId) => {
    try {
      const res = await api.patch(`/admin/shops/${shopId}/freeze`);
      if (res.data.success) {
        showToast(res.data.message, 'info');
        fetchShops();
      }
    } catch (err) {
      showToast('Failed to update freeze state', 'error');
    }
  };

  const handleDeleteShop = async (shopId, shopName) => {
    const confirm = window.confirm(`Permanently delete medical shop "${shopName}", its user account, and entire inventory?`);
    if (!confirm) return;

    try {
      const res = await api.delete(`/admin/shops/${shopId}`);
      if (res.data.success) {
        showToast(`Pharmacy "${shopName}" removed`, 'info');
        setShops((prev) => prev.filter((s) => s._id !== shopId));
      }
    } catch (err) {
      showToast('Failed to delete shop', 'error');
    }
  };

  const filtered = shops.filter(
    (s) =>
      s.shopName.toLowerCase().includes(search.toLowerCase()) ||
      s.licenseNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase())
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
                Medical Shop & Pharmacy Governance
              </h1>
              <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
                Verify drug licenses, approve newly registered pharmacies, freeze accounts, or deactivate shops.
              </p>
            </div>

            <div style={{ minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Search shops by name, license..."
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
                <th>Pharmacy Details</th>
                <th>Drug License</th>
                <th>Owner & Contact</th>
                <th>Inventory</th>
                <th>Approval Status</th>
                <th>Freeze State</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    Loading medical shops...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
                    No medical shops match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((shop) => (
                  <tr key={shop._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{shop.shopName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        📍 {shop.address}, {shop.city}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>
                        {shop.licenseNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{shop.ownerId?.name || 'Owner'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{shop.phone}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--teal-700)' }}>
                        {shop.medicineCount || 0} medicines
                      </span>
                    </td>
                    <td>
                      {shop.isApproved ? (
                        <span className="badge badge-in-stock">Approved</span>
                      ) : (
                        <span className="badge badge-low-stock">Pending</span>
                      )}
                    </td>
                    <td>
                      {shop.isFrozen ? (
                        <span className="badge badge-out-stock">Frozen</span>
                      ) : (
                        <span className="badge badge-in-stock">Active</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleApprove(shop._id)}
                          className="btn btn-outline btn-sm"
                          title="Toggle Approval"
                        >
                          {shop.isApproved ? 'Unapprove' : 'Approve'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleFreeze(shop._id)}
                          className="btn btn-outline btn-sm"
                          style={{ color: shop.isFrozen ? 'var(--mint-600)' : '#d97706' }}
                          title="Toggle Account Freeze"
                        >
                          <Snowflake size={14} />
                          {shop.isFrozen ? 'Unfreeze' : 'Freeze'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteShop(shop._id, shop.shopName)}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--rose-600)', borderColor: 'var(--rose-100)' }}
                          title="Delete Pharmacy Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
