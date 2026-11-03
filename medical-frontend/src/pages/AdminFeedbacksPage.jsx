import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Star, ArrowLeft, Store, User } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotification();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await api.get('/admin/feedbacks');
        if (res.data.success) {
          setFeedbacks(res.data.feedbacks || []);
        }
      } catch (err) {
        showToast('Error loading feedbacks', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--teal-600)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Admin Overview
          </Link>
          <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
            Platform Feedback & Service Quality
          </h1>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
            All patient reviews, star ratings, and pharmacy responses across MediTrack.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>Loading reviews...</div>
        ) : feedbacks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <MessageSquare size={40} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>No feedback submitted yet</h3>
            <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
              Patient reviews will appear here as orders complete.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {feedbacks.map((f) => (
              <div key={f._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>
                      Patient: {f.customerId?.name || 'Customer'}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--teal-700)', fontWeight: 600 }}>
                      Reviewed Pharmacy: {f.shopId?.shopName || 'Medical Shop'}
                    </div>
                  </div>

                  <div style={{ color: '#f59e0b', fontSize: '1.15rem' }}>
                    {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                  </div>
                </div>

                <p style={{ fontSize: '0.925rem', color: 'var(--navy-800)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                  "{f.comment}"
                </p>

                {f.shopReply && (
                  <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: 'var(--navy-700)' }}>
                    <strong>Pharmacy Reply:</strong> {f.shopReply}
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>
                  Submitted on {new Date(f.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
