import { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Filter,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function ShopMedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brand: '',
    category: 'Pain Relief',
    dosageForm: 'Tablet',
    strength: '650 mg',
    price: '',
    discountPrice: '',
    stock: '',
    minStockAlert: '10',
    prescriptionRequired: false,
    manufacturer: '',
    description: '',
    uses: '',
    sideEffects: '',
  });

  const { showToast } = useNotification();

  const categories = [
    'All',
    'Pain Relief',
    'Antibiotics',
    'Diabetes',
    'Cardiology',
    'Respiratory',
    'Digestive',
    'Allergy',
    'Vitamins & Supplements',
    'General',
  ];

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines/shop/my', {
        params: {
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          lowStock: lowStockOnly ? 'true' : undefined,
        },
      });
      if (res.data.success) {
        setMedicines(res.data.medicines || []);
      }
    } catch (err) {
      showToast('Error fetching inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [search, category, lowStockOnly]);

  const handleOpenAdd = () => {
    setEditingMed(null);
    setFormData({
      name: '',
      genericName: '',
      brand: '',
      category: 'Pain Relief',
      dosageForm: 'Tablet',
      strength: '650 mg',
      price: '',
      discountPrice: '',
      stock: '',
      minStockAlert: '10',
      prescriptionRequired: false,
      manufacturer: '',
      description: '',
      uses: '',
      sideEffects: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      genericName: med.genericName || '',
      brand: med.brand || '',
      category: med.category || 'Pain Relief',
      dosageForm: med.dosageForm || 'Tablet',
      strength: med.strength || '',
      price: med.price,
      discountPrice: med.discountPrice || '',
      stock: med.stock,
      minStockAlert: med.minStockAlert || '10',
      prescriptionRequired: Boolean(med.prescriptionRequired),
      manufacturer: med.manufacturer || '',
      description: med.description || '',
      uses: med.uses?.join(', ') || '',
      sideEffects: med.sideEffects?.join(', ') || '',
    });
    setShowAddModal(true);
  };

  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.price === '' || formData.stock === '') {
      showToast('Please provide medicine name, price, and stock', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        stock: Number(formData.stock),
        minStockAlert: Number(formData.minStockAlert || 10),
      };

      if (editingMed) {
        const res = await api.put(`/medicines/${editingMed._id}`, payload);
        if (res.data.success) {
          showToast(`Medicine "${formData.name}" updated successfully`, 'success');
          setShowAddModal(false);
          fetchMedicines();
        }
      } else {
        const res = await api.post('/medicines', payload);
        if (res.data.success) {
          showToast(`Medicine "${formData.name}" added to inventory`, 'success');
          setShowAddModal(false);
          fetchMedicines();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save medicine', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedicine = async (medId, medName) => {
    const confirm = window.confirm(`Are you sure you want to delete "${medName}" from your inventory?`);
    if (!confirm) return;

    try {
      const res = await api.delete(`/medicines/${medId}`);
      if (res.data.success) {
        showToast(`"${medName}" removed from inventory`, 'info');
        setMedicines((prev) => prev.filter((m) => m._id !== medId));
      }
    } catch (err) {
      showToast('Failed to delete medicine', 'error');
    }
  };

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
              Pharmacy Medicine Inventory
            </h1>
            <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
              Add new prescription medications, update pricing, and maintain available stock quantities.
            </p>
          </div>

          <button type="button" onClick={handleOpenAdd} className="btn btn-primary btn-lg">
            <Plus size={18} /> Add Medicine
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--white)',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--slate-200)',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="var(--slate-400)" />
            <input
              type="text"
              placeholder="Search your inventory by name or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                style={{ accentColor: 'var(--rose-600)', width: '16px', height: '16px' }}
              />
              Low Stock Only
            </label>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Dosage / Form</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    Loading medicines...
                  </td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--navy-600)' }}>
                    No medicines found in your inventory matching the criteria.
                  </td>
                </tr>
              ) : (
                medicines.map((med) => {
                  const isLow = med.stock <= med.minStockAlert;
                  return (
                    <tr key={med._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{med.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {med.brand ? `Brand: ${med.brand} • ` : ''}{med.manufacturer || ''}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{med.category}</span>
                      </td>
                      <td>
                        {med.dosageForm} {med.strength && `(${med.strength})`}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--teal-700)' }}>
                          ₹{med.discountPrice > 0 ? med.discountPrice : med.price}
                        </div>
                        {med.discountPrice > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textDecoration: 'line-through' }}>
                            ₹{med.price}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: isLow ? 'var(--rose-600)' : 'var(--navy-900)' }}>
                          {med.stock} units
                        </strong>
                      </td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-low-stock">
                            <AlertTriangle size={12} /> Low Stock (≤{med.minStockAlert})
                          </span>
                        ) : (
                          <span className="badge badge-in-stock">
                            <CheckCircle size={12} /> Healthy
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(med)}
                            className="btn btn-outline btn-sm"
                            title="Edit Medicine Details"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedicine(med._id, med.name)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--rose-600)', borderColor: 'var(--rose-100)' }}
                            title="Delete Medicine"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Add / Edit Medicine Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {editingMed ? `Edit: ${editingMed.name}` : 'Add Medicine to Inventory'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMedicine}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Medicine Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paracetamol 650 mg"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Generic Composition</label>
                    <input
                      type="text"
                      placeholder="e.g. Paracetamol"
                      className="form-input"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Dolo-650"
                      className="form-input"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dosage Form</label>
                    <select
                      className="form-select"
                      value={formData.dosageForm}
                      onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Drops">Drops</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Injection">Injection</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Powder">Powder</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Units *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-input"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Low Stock Alert</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={formData.minStockAlert}
                      onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', alignItems: 'center' }}>
                  <div className="form-group">
                    <label className="form-label">Manufacturer</label>
                    <input
                      type="text"
                      placeholder="e.g. Micro Labs / GSK / Cipla"
                      className="form-input"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="prescriptionReq"
                      checked={formData.prescriptionRequired}
                      onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--rose-600)' }}
                    />
                    <label htmlFor="prescriptionReq" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-800)' }}>
                      Prescription Required (Rx)
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Overview</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Short description of medication uses..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Saving...' : editingMed ? 'Save Changes' : 'Add to Inventory'}
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
