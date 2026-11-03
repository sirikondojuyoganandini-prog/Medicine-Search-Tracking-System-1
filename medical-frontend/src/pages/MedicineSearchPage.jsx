import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  ShoppingCart,
  Compass,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  Store,
  ChevronRight,
  Info,
} from 'lucide-react';
import api from '../services/api';
import PharmacyMap from '../Components/PharmacyMap';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export default function MedicineSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';

  const [query, setQuery] = useState(queryParam);
  const [category, setCategory] = useState(categoryParam);
  const [shopFilter, setShopFilter] = useState('');
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'price_asc', 'price_desc', 'stock'
  const [inStockOnly, setInStockOnly] = useState(false);

  // User Coordinates & Location fallback
  const [userCoords, setUserCoords] = useState({ lat: 28.6290, lng: 77.2210, name: 'Connaught Place, New Delhi' });
  const [locationDetecting, setLocationDetecting] = useState(false);

  const [medicines, setMedicines] = useState([]);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [viewMode, setViewMode] = useState('both'); // 'both', 'list', 'map'

  const { addToCart } = useCart();
  const { showToast } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Categories list
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
  ];

  // Detect GPS Location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLocationDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: 'Current GPS Location',
          });
          setLocationDetecting(false);
        },
        () => {
          // If denied, fallback to user profile coords or default
          if (user?.location?.lat && user?.location?.lng) {
            setUserCoords({
              lat: user.location.lat,
              lng: user.location.lng,
              name: user.location.city || 'User Profile Location',
            });
          }
          setLocationDetecting(false);
        }
      );
    }
  }, [user]);

  // Execute Search API call
  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const params = {
        q: query,
        category: category !== 'All' ? category : undefined,
        shopName: shopFilter || undefined,
        sortBy,
        inStockOnly: inStockOnly ? 'true' : undefined,
        userLat: userCoords.lat,
        userLng: userCoords.lng,
      };

      const res = await api.get('/medicines/search', { params });
      if (res.data.success) {
        setMedicines(res.data.medicines || []);
        setNearbyShops(res.data.nearbyShops || []);
      }
    } catch (err) {
      showToast('Error searching medicines: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [queryParam, categoryParam, sortBy, inStockOnly, userCoords]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query, category });
  };

  const handleCityPresetChange = (lat, lng, name) => {
    setUserCoords({ lat, lng, name });
    showToast(`Location shifted to ${name}`, 'info');
  };

  const handleSelectShop = (shop) => {
    setSelectedShopId(shop._id);
    showToast(`Selected "${shop.shopName}". Showing matching medicines below.`, 'info');
  };

  return (
    <div style={{ padding: '2rem 1rem', minHeight: '85vh' }}>
      <div className="container">
        {/* Search Header & Inputs */}
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
                Medicine Search & Pharmacy Discovery
              </h1>
              <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
                Search any medication to find availability, compare prices, and locate nearby medical shops.
              </p>
            </div>

            {/* Location Selector & GPS Fallback */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--white)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--slate-300)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <MapPin size={16} color="var(--teal-600)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-800)' }}>
                {userCoords.name}
              </span>
              <select
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.8rem',
                  color: 'var(--teal-700)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'transparent',
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'delhi') handleCityPresetChange(28.6290, 77.2210, 'Connaught Place, Delhi');
                  if (val === 'karol') handleCityPresetChange(28.6517, 77.1906, 'Karol Bagh, Delhi');
                  if (val === 'lajpat') handleCityPresetChange(28.5700, 77.2400, 'Lajpat Nagar, Delhi');
                  if (val === 'saket') handleCityPresetChange(28.5244, 77.2100, 'Saket, Delhi');
                }}
              >
                <option value="">Change Location</option>
                <option value="delhi">Connaught Place (CP)</option>
                <option value="karol">Karol Bagh</option>
                <option value="lajpat">Lajpat Nagar</option>
                <option value="saket">Saket</option>
              </select>
            </div>
          </div>

          {/* Search Form Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.4rem',
              border: '1px solid var(--slate-300)',
              boxShadow: 'var(--shadow-md)',
              alignItems: 'center',
            }}
          >
            <div style={{ padding: '0 0.5rem', color: 'var(--teal-600)' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search medicine (e.g. Paracetamol 650 mg, Amoxicillin, Metformin)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                color: 'var(--navy-900)',
                padding: '0.4rem 0',
              }}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          {/* Filter Chips Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1rem',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Filter size={14} /> Categories:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setSearchParams({ q: query, category: cat });
                }}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: category === cat ? '1px solid var(--teal-600)' : '1px solid var(--slate-200)',
                  backgroundColor: category === cat ? 'var(--teal-50)' : 'var(--white)',
                  color: category === cat ? 'var(--teal-700)' : 'var(--navy-700)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sorting and Filters Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              gap: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--slate-100)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <ArrowUpDown size={15} color="var(--slate-500)" />
                <span style={{ fontWeight: 600, color: 'var(--navy-800)' }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
                >
                  <option value="distance">Nearest Distance (Haversine)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="stock">Stock Availability</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  style={{ accentColor: 'var(--teal-600)', width: '16px', height: '16px' }}
                />
                In Stock Only
              </label>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--navy-700)', fontWeight: 600 }}>
              Found <strong style={{ color: 'var(--teal-700)' }}>{medicines.length}</strong> available options across{' '}
              <strong style={{ color: 'var(--teal-700)' }}>{nearbyShops.length}</strong> pharmacies
            </div>
          </div>
        </div>

        {/* Content Layout: Results Table + Interactive Map */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', alignItems: 'start' }} className="search-grid">
          {/* Left Column: Medicine Results List */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ color: 'var(--teal-600)', fontWeight: 600 }}>Searching pharmacies & calculating distances...</div>
              </div>
            ) : medicines.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <Info size={40} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>No medicines found</h3>
                <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  No registered pharmacies have medicines matching "{query}" under current filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setCategory('All');
                    setSearchParams({});
                  }}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {medicines.map((med) => {
                  const shop = med.shopId;
                  const isSelected = selectedShopId && shop?._id?.toString() === selectedShopId.toString();

                  return (
                    <div
                      key={med._id}
                      className="card"
                      style={{
                        padding: '1.25rem',
                        border: isSelected ? '2px solid var(--teal-600)' : '1px solid var(--slate-200)',
                        backgroundColor: isSelected ? 'var(--teal-50)' : 'var(--white)',
                        textAlign: 'left',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <Link
                              to={`/medicines/${med._id}`}
                              style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', hover: { color: 'var(--teal-600)' } }}
                            >
                              {med.name}
                            </Link>
                            {med.strength && (
                              <span className="badge badge-primary">{med.strength}</span>
                            )}
                            <span className="badge badge-neutral">{med.dosageForm}</span>
                          </div>
                          {med.genericName && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.25rem' }}>
                              Composition: {med.genericName}
                            </div>
                          )}
                        </div>

                        {/* Price Display */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--teal-700)' }}>
                            ₹{med.discountPrice > 0 ? med.discountPrice : med.price}
                          </div>
                          {med.discountPrice > 0 && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', textDecoration: 'line-through' }}>
                              ₹{med.price}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pharmacy & Stock Details Box */}
                      <div
                        style={{
                          backgroundColor: 'var(--slate-50)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Store size={16} color="var(--teal-600)" />
                            {shop?.shopName || 'Registered Pharmacy'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                            📍 {shop?.address} • {med.formattedDistance} away
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div>
                            {med.availabilityStatus === 'In Stock' && (
                              <span className="badge badge-in-stock">
                                <CheckCircle size={12} /> In Stock ({med.stock})
                              </span>
                            )}
                            {med.availabilityStatus === 'Low Stock' && (
                              <span className="badge badge-low-stock">
                                <AlertTriangle size={12} /> Low Stock ({med.stock} left)
                              </span>
                            )}
                            {med.availabilityStatus === 'Out of Stock' && (
                              <span className="badge badge-out-stock">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleSelectShop(shop)}
                            className="btn btn-outline btn-sm"
                          >
                            <MapPin size={14} /> View on Map
                          </button>
                          <Link
                            to={`/medicines/${med._id}`}
                            className="btn btn-outline btn-sm"
                          >
                            Details & Uses
                          </Link>
                        </div>

                        <button
                          type="button"
                          disabled={med.stock <= 0}
                          onClick={() => addToCart(med, 1, shop)}
                          className="btn btn-primary btn-sm"
                        >
                          <ShoppingCart size={15} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map with markers & distance radius */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="card" style={{ padding: '1rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={18} color="var(--teal-600)" />
                  Nearby Pharmacies Map
                </h3>
                <span className="badge badge-primary">{nearbyShops.length} Mapped</span>
              </div>

              <PharmacyMap
                userLocation={userCoords}
                pharmacies={nearbyShops}
                selectedShopId={selectedShopId}
                onSelectShop={handleSelectShop}
                height="460px"
              />

              <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--slate-500)', lineHeight: 1.5 }}>
                💡 <strong>Tip:</strong> Click any pharmacy pin on the map to inspect available stock, contact details, and distance.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .search-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
