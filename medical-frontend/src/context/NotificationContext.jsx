import { createContext, useContext, useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [geofenceModal, setGeofenceModal] = useState(null);
  const [browserPermission, setBrowserPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        showToast('Browser notifications enabled successfully!', 'success');
        try {
          new Notification('MediTrack Notifications Active', {
            body: 'You will receive timely medicine and pharmacy proximity reminders.',
            icon: '/favicon.svg',
          });
        } catch (e) {
          console.warn('Notification constructor error', e);
        }
      } else {
        showToast('Notification permission was not granted.', 'info');
      }
      return perm;
    }
    return 'unsupported';
  };

  const showBrowserNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          ...options,
        });
      } catch (e) {
        console.warn('Native notification failed, falling back to UI toast', e);
      }
    }
  };

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerGeofenceAlert = (shop, medicineName, distanceMeters) => {
    // 1. Show modal
    setGeofenceModal({
      shop,
      medicineName,
      distanceMeters,
    });

    // 2. Play browser notification if permitted
    showBrowserNotification(`You're near ${shop.shopName}!`, {
      body: medicineName
        ? `Your searched medicine ${medicineName} is available here (${distanceMeters}m away).`
        : `Pharmacy ${shop.shopName} is nearby (${distanceMeters}m away).`,
    });

    // 3. Audio chime if possible
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext may be blocked before gesture
    }
  };

  const closeGeofenceModal = () => {
    setGeofenceModal(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        triggerGeofenceAlert,
        browserPermission,
        requestNotificationPermission,
        showBrowserNotification,
      }}
    >
      {children}

      {/* Geofence Proximity Alert Dialog */}
      {geofenceModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--teal-50)',
                color: 'var(--teal-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Bell size={32} />
            </div>

            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
              Geofence Radius Alert ({geofenceModal.distanceMeters}m)
            </span>

            <h3 style={{ fontSize: '1.35rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              You're near {geofenceModal.shop?.shopName}!
            </h3>

            <p style={{ color: 'var(--navy-600)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {geofenceModal.medicineName ? (
                <>
                  Your searched medicine <strong style={{ color: 'var(--teal-700)' }}>{geofenceModal.medicineName}</strong> is available in stock at this location.
                </>
              ) : (
                `You have entered the proximity zone for ${geofenceModal.shop?.shopName}.`
              )}
            </p>

            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                textAlign: 'left',
                fontSize: '0.85rem',
                color: 'var(--navy-700)',
                marginBottom: '1.5rem',
                border: '1px solid var(--slate-200)',
              }}
            >
              <div><strong>Address:</strong> {geofenceModal.shop?.address}</div>
              <div><strong>Contact:</strong> {geofenceModal.shop?.phone}</div>
              <div><strong>Timing:</strong> {geofenceModal.shop?.openingHours || 'Open today'}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <a
                href={`/pharmacies?shopId=${geofenceModal.shop?._id}`}
                className="btn btn-primary"
                onClick={closeGeofenceModal}
              >
                View Pharmacy
              </a>
              <button className="btn btn-outline" onClick={closeGeofenceModal}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle size={20} color="var(--mint-600)" />}
            {toast.type === 'error' && <AlertTriangle size={20} color="var(--rose-600)" />}
            {toast.type === 'info' && <Info size={20} color="var(--teal-600)" />}
            <div style={{ flex: 1, fontSize: '0.9rem', color: 'var(--navy-800)' }}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--slate-400)',
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
