import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Pill,
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  ArrowLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

export default function MedicineDetailsPage() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await api.get(`/medicines/${id}`);
        if (res.data.success) {
          setMedicine(res.data.medicine);
        }
      } catch (err) {
        showToast('Medicine not found', 'error');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  if (loading || !medicine) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ color: 'var(--teal-600)', fontWeight: 600 }}>Loading medicine information...</div>
      </div>
    );
  }

  const shop = medicine.shopId;
  const effectivePrice = medicine.discountPrice > 0 ? medicine.discountPrice : medicine.price;

  const handleAddToCart = () => {
    const success = addToCart(medicine, quantity, shop);
    if (success) {
      showToast(`Added ${quantity} unit(s) of ${medicine.name} to cart`, 'success');
    }
  };

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <Link
          to="/search"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--teal-600)',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Search Results
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }} className="details-grid">
          {/* Main Info Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">{medicine.category}</span>
              <span className="badge badge-neutral">{medicine.dosageForm}</span>
              {medicine.prescriptionRequired ? (
                <span className="badge badge-low-stock">Rx Prescription Required</span>
              ) : (
                <span className="badge badge-in-stock">OTC / General</span>
              )}
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
              {medicine.name} {medicine.strength && `(${medicine.strength})`}
            </h1>

            {medicine.genericName && (
              <p style={{ fontSize: '0.95rem', color: 'var(--navy-600)', marginBottom: '1.25rem' }}>
                <strong>Generic Composition:</strong> {medicine.genericName}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: 'var(--teal-50)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--teal-700)' }}>
                ₹{effectivePrice}
              </div>
              {medicine.discountPrice > 0 && (
                <div style={{ fontSize: '1rem', color: 'var(--slate-400)', textDecoration: 'line-through' }}>
                  ₹{medicine.price}
                </div>
              )}
              <span style={{ fontSize: '0.825rem', color: 'var(--teal-700)', fontWeight: 600 }}>
                (Inclusive of all taxes)
              </span>
            </div>

            {/* Description */}
            {medicine.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                  Overview & Description
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--navy-700)', lineHeight: 1.6 }}>
                  {medicine.description}
                </p>
              </div>
            )}

            {/* Uses */}
            {medicine.uses && medicine.uses.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                  Therapeutic Uses
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {medicine.uses.map((u, i) => (
                    <span key={i} className="badge badge-neutral" style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem' }}>
                      ✓ {u}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Side Effects */}
            {medicine.sideEffects && medicine.sideEffects.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                  Possible Side Effects
                </h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--navy-600)' }}>
                  {medicine.sideEffects.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Manufacturer & Expiry */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                borderTop: '1px solid var(--slate-200)',
                paddingTop: '1rem',
                fontSize: '0.85rem',
                color: 'var(--navy-700)',
              }}
            >
              <div>
                <strong>Manufacturer:</strong> {medicine.manufacturer || 'Licensed Pharmaceutical Co.'}
              </div>
              <div>
                <strong>Stock In Inventory:</strong>{' '}
                <span style={{ fontWeight: 700, color: medicine.stock > 0 ? 'var(--mint-600)' : 'var(--rose-600)' }}>
                  {medicine.stock} units available
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Pharmacy Card & Purchase Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Purchase & Cart Box */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '1rem' }}>
                Order from this Pharmacy
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy-800)' }}>Quantity:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="btn btn-outline btn-sm"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(medicine.stock, quantity + 1))}
                    disabled={quantity >= medicine.stock}
                    className="btn btn-outline btn-sm"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--navy-700)' }}>Estimated Total:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--teal-700)' }}>
                  ₹{Math.round(quantity * effectivePrice * 100) / 100}
                </span>
              </div>

              <button
                type="button"
                disabled={medicine.stock <= 0}
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <ShoppingCart size={18} />
                {medicine.stock > 0 ? 'Add to Cart' : 'Currently Out of Stock'}
              </button>
            </div>

            {/* Pharmacy Information Card */}
            {shop && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Store size={20} color="var(--teal-600)" />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                    {shop.shopName}
                  </h4>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--navy-700)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <MapPin size={16} color="var(--slate-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{shop.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={16} color="var(--slate-400)" />
                    <span>{shop.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={16} color="var(--slate-400)" />
                    <span>{shop.openingHours || '8:00 AM - 10:00 PM'}</span>
                  </div>
                </div>

                <Link
                  to={`/pharmacies?shopId=${shop._id}`}
                  className="btn btn-outline-teal btn-sm"
                  style={{ width: '100%' }}
                >
                  <MapPin size={14} /> View Pharmacy on Map
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
