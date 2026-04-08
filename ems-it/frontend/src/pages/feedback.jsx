import { useState, useEffect } from 'react';
import { Card, Loader } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const ch = { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 };

export default function Feedback() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  return isAdmin ? <AdminFeedback /> : <EmployeeFeedback />;
}

// ✅ ADMIN — எல்லா feedbacks பாக்கலாம்
function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/feedback/all')
      .then(data => { setFeedbacks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>💬 Employee Feedbacks</h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>All feedbacks submitted by employees</p>
      </div>

      <Card>
        {feedbacks.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: 13 }}>No feedbacks yet</p>
        ) : (
          feedbacks.map(f => (
            <div key={f._id} style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6366f1', fontSize: 14 }}>
                    {f.employee?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{f.employee?.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{f.employee?.designation}</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {new Date(f.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#475569', margin: '8px 0' }}>{f.message}</p>
              <div style={{ color: '#f59e0b', fontSize: 16 }}>{'⭐'.repeat(f.rating)}</div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

// ✅ EMPLOYEE — feedback submit பண்ணலாம்
function EmployeeFeedback() {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    await api.post('/feedback', { message, rating });
    setLoading(false);
    setSubmitted(true);
    setMessage('');
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>💬 Feedback</h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>Share your thoughts with the management</p>
      </div>

      <Card>
        <h3 style={ch}>Submit Feedback</h3>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 16, marginTop: 10 }}>
              Feedback submitted successfully!
            </p>
            <button onClick={() => setSubmitted(false)}
              style={{ marginTop: 16, padding: '8px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Submit Another
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Your Feedback</label>
              <textarea
                rows={5}
                placeholder="Write your feedback here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, resize: 'none', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Rating</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRating(n)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: rating === n ? '#6366f1' : '#fff',
                      color: rating === n ? '#fff' : '#64748b' }}>
                    {'⭐'.repeat(n)}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading || !message.trim()}
              style={{ padding: '10px 28px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                opacity: (!message.trim() || loading) ? 0.6 : 1 }}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </>
        )}
      </Card>
    </div>
  );
}