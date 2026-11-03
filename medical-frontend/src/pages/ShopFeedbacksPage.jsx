import { useState, useEffect } from 'react';
import { Star, MessageSquare, User, CornerDownRight } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function ShopFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const { showToast } = useNotification();

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/shops/feedbacks');
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks || []);
      }
    } catch (err) {
      showToast('Error loading feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSendReply = async (feedbackId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await api.post(`/shops/feedbacks/${feedbackId}/reply`, { reply: replyText });
      if (res.data.success) {
        showToast('Reply sent to customer', 'success');
        setReplyingId(null);
        setReplyText('');
        fetchFeedbacks();
      }
    } catch (err) {
      showToast('Failed to send reply', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <h1 className="title-section" style={{ marginBottom: '0.25rem' }}>
          Customer Reviews & Feedback
        </h1>
        <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          See what patients are saying about medicine availability and fulfillment speed at your pharmacy.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>Loading reviews...</div>
        ) : feedbacks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <MessageSquare size={40} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>No reviews yet</h3>
            <p style={{ color: 'var(--navy-600)', fontSize: '0.9rem' }}>
              Completed customer orders will appear here once customers submit their experience ratings.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {feedbacks.map((f) => (
              <div key={f._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      {f.customerId?.name ? f.customerId.name[0] : 'C'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.95rem' }}>
                        {f.customerId?.name || 'Verified Patient'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ color: '#f59e0b', fontSize: '1.15rem' }}>
                    {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                  </div>
                </div>

                <p style={{ fontSize: '0.925rem', color: 'var(--navy-800)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  "{f.comment}"
                </p>

                {/* Shop Reply Section */}
                {f.shopReply ? (
                  <div
                    style={{
                      backgroundColor: 'var(--teal-50)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      borderLeft: '3px solid var(--teal-600)',
                      fontSize: '0.85rem',
                      color: 'var(--teal-900)',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CornerDownRight size={14} /> Pharmacy Response:
                    </div>
                    <div>{f.shopReply}</div>
                  </div>
                ) : (
                  <div>
                    {replyingId === f._id ? (
                      <div style={{ marginTop: '0.5rem' }}>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          placeholder="Write a polite response to this customer review..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          style={{ marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => { setReplyingId(null); setReplyText(''); }}
                            className="btn btn-outline btn-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={submittingReply}
                            onClick={() => handleSendReply(f._id)}
                            className="btn btn-primary btn-sm"
                          >
                            {submittingReply ? 'Sending...' : 'Post Reply'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setReplyingId(f._id); setReplyText(''); }}
                        className="btn btn-outline btn-sm"
                      >
                        Reply to Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
