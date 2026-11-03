import { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  Pill,
  Calendar,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function MedicationRemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for new reminder
  const [formData, setFormData] = useState({
    medicineName: '',
    time: '08:00',
    dosage: '1 Tablet',
    frequency: 'Daily',
    foodTiming: 'After food',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { showToast, showBrowserNotification, browserPermission, requestNotificationPermission } =
    useNotification();

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders');
      if (res.data.success) {
        setReminders(res.data.reminders || []);
      }
    } catch (err) {
      showToast('Error loading reminders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Timer loop checking for exact time matches
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      reminders.forEach((r) => {
        if (r.isActive && r.time === currentTimeStr) {
          // Check if already notified in last minute
          const todayStr = now.toISOString().split('T')[0];
          const alreadyTakenToday = r.logs?.some((l) => l.dateString === todayStr);

          if (!alreadyTakenToday) {
            showBrowserNotification(`Medicine Time: ${r.medicineName}`, {
              body: `Take ${r.dosage} (${r.foodTiming}). Stay consistent with your prescription.`,
            });
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [reminders]);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!formData.medicineName || !formData.time) {
      showToast('Please enter medicine name and time', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/reminders', formData);
      if (res.data.success) {
        showToast(`Reminder for ${formData.medicineName} created!`, 'success');
        setReminders([...reminders, res.data.reminder]);
        setShowAddModal(false);
        setFormData({
          medicineName: '',
          time: '08:00',
          dosage: '1 Tablet',
          frequency: 'Daily',
          foodTiming: 'After food',
          notes: '',
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save reminder', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkTaken = async (reminderId) => {
    try {
      const res = await api.post(`/reminders/${reminderId}/take`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setReminders((prev) =>
          prev.map((r) => (r._id === reminderId ? res.data.reminder : r))
        );
      }
    } catch (err) {
      showToast('Failed to mark reminder', 'error');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      const res = await api.delete(`/reminders/${reminderId}`);
      if (res.data.success) {
        showToast('Reminder deleted', 'info');
        setReminders((prev) => prev.filter((r) => r._id !== reminderId));
      }
    } catch (err) {
      showToast('Failed to delete reminder', 'error');
    }
  };

  const handleTestChime = (medicineName) => {
    showBrowserNotification(`Reminder Alert: ${medicineName}`, {
      body: `Time to take your scheduled dosage with water.`,
    });
    showToast(`Triggered test reminder chime for ${medicineName}`, 'info');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--teal-700)', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.25rem' }}>
              <Bell size={16} /> Daily Health Routine
            </div>
            <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
              Medication Reminders
            </h1>
            <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
              Schedule automated alerts and log daily taken doses for optimal health recovery.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {browserPermission !== 'granted' && (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="btn btn-outline-teal"
              >
                <Bell size={16} /> Enable Alerts
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus size={18} /> Add New Reminder
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>Loading medication schedule...</div>
        ) : reminders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Clock size={44} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              No medication reminders set
            </h3>
            <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Never miss a prescribed dose. Add reminders with scheduled times, dosage instructions, and food timing.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus size={16} /> Create First Reminder
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {reminders.map((reminder) => {
              const isTakenToday = reminder.logs?.some((l) => l.dateString === todayStr);

              return (
                <div
                  key={reminder._id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    border: isTakenToday ? '2px solid var(--mint-500)' : '1px solid var(--slate-200)',
                    backgroundColor: isTakenToday ? 'var(--mint-50)' : 'var(--white)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>
                        ⏰ {reminder.time}
                      </span>
                      <span className="badge badge-neutral">{reminder.frequency}</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
                      {reminder.medicineName}
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: 'var(--navy-700)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                      <div><strong>Dosage:</strong> {reminder.dosage}</div>
                      <div><strong>Relation:</strong> {reminder.foodTiming}</div>
                      {reminder.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontStyle: 'italic' }}>
                          "{reminder.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => handleTestChime(reminder.medicineName)}
                        title="Test Reminder Chime"
                        style={{ background: 'none', border: 'none', color: 'var(--teal-600)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Volume2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReminder(reminder._id)}
                        title="Delete Reminder"
                        style={{ background: 'none', border: 'none', color: 'var(--rose-600)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {isTakenToday ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--mint-600)', fontWeight: 700, fontSize: '0.85rem' }}>
                        <CheckCircle size={16} /> Taken Today
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkTaken(reminder._id)}
                        className="btn btn-mint btn-sm"
                      >
                        Mark Taken Today
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Reminder Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  Add Medication Reminder
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--slate-400)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddReminder}>
                <div className="form-group">
                  <label className="form-label">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol, Metformin"
                    className="form-input"
                    value={formData.medicineName}
                    onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Scheduled Time *</label>
                    <input
                      type="time"
                      required
                      className="form-input"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dosage Quantity</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 1 Tablet / 10 ml"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select
                      className="form-select"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Twice Daily">Twice Daily</option>
                      <option value="Thrice Daily">Thrice Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="As Needed">As Needed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Food Timing</label>
                    <select
                      className="form-select"
                      value={formData.foodTiming}
                      onChange={(e) => setFormData({ ...formData, foodTiming: e.target.value })}
                    >
                      <option value="After food">After food</option>
                      <option value="Before food">Before food</option>
                      <option value="With food">With food</option>
                      <option value="Empty stomach">Empty stomach</option>
                      <option value="Anytime">Anytime</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Drink full glass of water, avoid dairy"
                    className="form-input"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    {submitting ? 'Saving...' : 'Set Reminder'}
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
