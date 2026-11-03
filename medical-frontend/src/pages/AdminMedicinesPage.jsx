import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Trash2, Search, ArrowLeft, Store } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotification();

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/admin/medicines');
      if (res.data.success) {
        setMedicines(res.data.medicines || []);
      }
    } catch (err) {
      showToast('Error loading medicines', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (medId, medName) => {
    const confirm = window.confirm(`Admin override: Delete medicine "${medName}"?`);
    if (!confirm) return;

    try {
      const res = await api.delete(`/admin/medicines/${medId}`);
      if (res.data.success) {
        showToast(`Medicine "${medName}" removed by admin`, 'info');
        setMedicines((prev) => prev.filter((m) => m._id !== medId));
      }
    } catch (err) {
      showToast('Failed to delete medicine', 'error');
    }
  };

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName?.toLowerCase().includes(search.toLowerCase()) ||
      m.shopId?.shopName?.toLowerCase().includes(search.toLowerCase())
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
                System-Wide Medicine Inventory
              </h1>
              <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
                All medicines listed across all registered pharmacies ({medicines.length} total entries).
              </p>
            </div>

            <div style={{ minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Search by medicine, composition, or pharmacy..."
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
                <th>Medicine Name</th>
                <th>Pharmacy Shop</th>
                <th>Category</th>
                <th>Dosage Form</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    Loading medicines...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
                    No medicines match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {m.genericName || m.brand || ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--teal-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Store size={14} /> {m.shopId?.shopName || 'Unknown Shop'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{m.shopId?.city}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{m.category}</span>
                    </td>
                    <td>{m.dosageForm} {m.strength && `(${m.strength})`}</td>
                    <td style={{ fontWeight: 700 }}>₹{m.discountPrice > 0 ? m.discountPrice : m.price}</td>
                    <td>
                      <strong style={{ color: m.stock <= m.minStockAlert ? 'var(--rose-600)' : 'var(--navy-900)' }}>
                        {m.stock}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(m._id, m.name)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--rose-600)', borderColor: 'var(--rose-100)' }}
                        title="Delete Medicine (Admin Override)"
                      >
                        <Trash2 size={14} /> Remove
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
