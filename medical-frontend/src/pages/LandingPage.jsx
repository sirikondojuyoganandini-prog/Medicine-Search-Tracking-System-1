import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Activity,
  Heart,
  Bell,
  ArrowRight,
  Pill,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const sampleCategories = [
    { name: 'Pain Relief', count: '14+' },
    { name: 'Antibiotics', count: '28+' },
    { name: 'Diabetes', count: '19+' },
    { name: 'Cardiology', count: '22+' },
    { name: 'Respiratory', count: '16+' },
    { name: 'Digestive', count: '20+' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #f0fdfa 0%, #f8fafc 100%)',
          padding: '4.5rem 0 3.5rem',
          borderBottom: '1px solid var(--slate-200)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--teal-100)',
              color: 'var(--teal-700)',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={16} />
            Smart Healthcare • Pharmacy Discovery & Location Tracking
          </div>

          <h1 className="title-hero" style={{ marginBottom: '1.25rem' }}>
            Find Prescribed Medicines in <span style={{ color: 'var(--teal-600)' }}>Nearby Pharmacies</span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--navy-600)',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
            }}
          >
            Real-time medicine search, verified pharmacy stock, Haversine distance-based sorting, intelligent geofence proximity alerts, and daily routine reminders.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-xl)',
              padding: '0.5rem',
              boxShadow: 'var(--shadow-xl)',
              border: '2px solid var(--teal-100)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ padding: '0 0.75rem', color: 'var(--teal-600)' }}>
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Try searching 'Paracetamol 650 mg', 'Amoxicillin', 'Metformin'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1.05rem',
                color: 'var(--navy-900)',
                padding: '0.5rem 0',
                background: 'transparent',
              }}
            />
            <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
              Search Now
            </button>
          </form>

          {/* Quick Suggestions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--slate-500)', fontWeight: 600 }}>Popular Searches:</span>
            {['Paracetamol 650 mg', 'Dolo 650', 'Amoxicillin 500 mg', 'Pantoprazole 40 mg', 'Cetirizine'].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.75rem',
                  color: 'var(--navy-700)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--teal-500)')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--slate-200)')}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="title-section" style={{ marginBottom: '0.5rem' }}>
              Designed For Patient Convenience & Pharmacy Efficiency
            </h2>
            <p style={{ color: 'var(--navy-600)', maxWidth: '600px', margin: '0 auto' }}>
              MediTrack connects verified neighborhood medical shops with customers through a seamless 3-role ecosystem.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Feature 1 */}
            <div className="card card-hover" style={{ textAlign: 'left' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--teal-50)',
                  color: 'var(--teal-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Search size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy-900)' }}>
                Live Medicine Search
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--navy-600)', lineHeight: 1.6 }}>
                Search any medicine by name, generic composition, or brand. Instantly view real-time stock levels and discounted prices across registered shops.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card card-hover" style={{ textAlign: 'left' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--mint-50)',
                  color: 'var(--mint-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <MapPin size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy-900)' }}>
                Pharmacy Map & Distance
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--navy-600)', lineHeight: 1.6 }}>
                OpenStreetMap powered interactive map calculating exact distances from your coordinates. Sort pharmacies from nearest to furthest with clear directions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card card-hover" style={{ textAlign: 'left' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--teal-50)',
                  color: 'var(--teal-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Bell size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy-900)' }}>
                Geofencing Proximity
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--navy-600)', lineHeight: 1.6 }}>
                Configurable 100m–500m geofence detection. Receive instant browser notifications when you are near the pharmacy stocking your needed medication.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card card-hover" style={{ textAlign: 'left' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--mint-50)',
                  color: 'var(--mint-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Activity size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy-900)' }}>
                Health Profile & Reminders
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--navy-600)', lineHeight: 1.6 }}>
                A 6-step health profile for current medications and allergies, coupled with daily audio-visual medicine reminders so you never miss a dose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--slate-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 className="title-section" style={{ fontSize: '1.6rem' }}>
                Browse by Category
              </h2>
              <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
                Quickly locate essential medications by therapeutic class
              </p>
            </div>
            <Link to="/search" style={{ color: 'var(--teal-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            {sampleCategories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1rem',
                  border: '1px solid var(--slate-200)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--teal-500)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--slate-200)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                  {cat.count} Medicines
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role CTA Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Customer CTA */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--teal-50), var(--mint-50))',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                border: '1px solid var(--teal-100)',
                textAlign: 'left',
              }}
            >
              <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
                For Customers & Patients
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
                Never run out of prescribed medicines again
              </h3>
              <p style={{ color: 'var(--navy-700)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Set up your personalized health profile, check stock availability before travelling to pharmacies, and schedule daily medication reminders.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary">
                  Create Customer Account
                </Link>
                <Link to="/search" className="btn btn-outline">
                  Browse Medicines
                </Link>
              </div>
            </div>

            {/* Pharmacy CTA */}
            <div
              style={{
                backgroundColor: 'var(--navy-900)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                color: 'var(--white)',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--mint-400)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                For Pharmacy Owners
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--white)', marginBottom: '0.75rem' }}>
                Expand your pharmacy's local customer reach
              </h3>
              <p style={{ color: 'var(--slate-300)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                List your inventory, receive online prescription orders, set custom pricing, and gain local visibility through our verified medical map network.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/register-shop" className="btn btn-mint">
                  Register Your Pharmacy
                </Link>
                <Link to="/login" style={{ color: 'var(--slate-300)', alignSelf: 'center', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                  Pharmacy Sign In →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
