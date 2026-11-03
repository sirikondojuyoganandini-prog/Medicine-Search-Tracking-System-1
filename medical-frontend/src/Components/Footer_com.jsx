import { Link } from 'react-router-dom';
import { Activity, Phone, ShieldCheck, HeartPulse, Clock } from 'lucide-react';

export default function Footer_com() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--navy-900)',
        color: 'var(--slate-300)',
        paddingTop: '3.5rem',
        paddingBottom: '2rem',
        marginTop: 'auto',
        borderTop: '1px solid var(--navy-800)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
            textAlign: 'left',
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--teal-500), var(--teal-600))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--white)',
                }}
              >
                <Activity size={20} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em' }}>
                meditrack
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Smart Medicine Search, Pharmacy Discovery & Proximity Tracking System. Empowering patients and local pharmacies with real-time availability and reminders.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', backgroundColor: 'var(--navy-800)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--mint-400)' }}>
              <ShieldCheck size={16} /> Verified Pharmacy Network
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'var(--white)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/search" style={{ color: 'var(--slate-400)', transition: 'color 0.15s' }}>
                  Search Medicines
                </Link>
              </li>
              <li>
                <Link to="/pharmacies" style={{ color: 'var(--slate-400)', transition: 'color 0.15s' }}>
                  Nearby Pharmacies Map
                </Link>
              </li>
              <li>
                <Link to="/health-profile" style={{ color: 'var(--slate-400)', transition: 'color 0.15s' }}>
                  Health Profile Setup
                </Link>
              </li>
              <li>
                <Link to="/reminders" style={{ color: 'var(--slate-400)', transition: 'color 0.15s' }}>
                  Medicine Reminders
                </Link>
              </li>
              <li>
                <Link to="/geofence" style={{ color: 'var(--slate-400)', transition: 'color 0.15s' }}>
                  Geofence Proximity Alert
                </Link>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 style={{ color: 'var(--white)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Portals & Roles
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/login" style={{ color: 'var(--slate-400)' }}>
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link to="/register-shop" style={{ color: 'var(--slate-400)' }}>
                  Register Medical Shop
                </Link>
              </li>
              <li>
                <Link to="/login-admin" style={{ color: 'var(--slate-400)' }}>
                  Admin Portal Login
                </Link>
              </li>
              <li>
                <Link to="/cart" style={{ color: 'var(--slate-400)' }}>
                  Review Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Helpline Numbers */}
          <div>
            <h4 style={{ color: 'var(--white)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              24x7 Emergency Helplines
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={16} color="var(--rose-500)" />
                <span>National Emergency: <strong style={{ color: 'var(--white)' }}>112</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <HeartPulse size={16} color="var(--rose-500)" />
                <span>Ambulance Service: <strong style={{ color: 'var(--white)' }}>108</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={16} color="var(--teal-500)" />
                <span>Blood Bank Helpline: <strong style={{ color: 'var(--white)' }}>1910</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            borderTop: '1px solid var(--navy-800)',
            paddingTop: '1.5rem',
            paddingBottom: '1.5rem',
            fontSize: '0.78rem',
            color: 'var(--slate-500)',
            lineHeight: 1.6,
            textAlign: 'center',
          }}
        >
          <strong>Medical Information Disclaimer:</strong> MediTrack is an assistive health platform designed for organizing user-provided medication schedules and finding licensed medical shops. MediTrack does not independently recommend prescription dosages or modify medical advice. Always consult a qualified physician or licensed pharmacist for medical diagnoses and treatments.
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--slate-500)',
          }}
        >
          <span>© 2026 MediTrack System. All rights reserved.</span>
          <span>College MERN Stack Final Project • Full-Stack Architecture</span>
        </div>
      </div>
    </footer>
  );
}
