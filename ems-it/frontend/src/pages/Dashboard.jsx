import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { StatCard, Card, Loader } from '../components/UI';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const [data, setData] = useState(null);
  const [payroll, setPayroll] = useState([]); // ✅ fix

  useEffect(() => {
    api.get('/reports/dashboard').then(setData);
    api.get('/reports/payroll?year=' + new Date().getFullYear()).then(d => setPayroll(d.monthly || []));
  }, []);

  if (!data) return <Loader />;

  const stats = [
    { icon: '👥', label: 'Total Employees', value: data.totalEmployees, color: '#6366f1' },
    { icon: '✅', label: 'Active Employees', value: data.activeEmployees, color: '#22c55e' },
    { icon: '🏢', label: 'Departments', value: data.departments, color: '#3b82f6' },
    { icon: '🚀', label: 'Active Projects', value: data.projects, color: '#f59e0b' },
    { icon: '🎫', label: 'Open Tickets', value: data.openTickets, color: '#ef4444' },
    { icon: '📅', label: 'Pending Leaves', value: data.pendingLeaves, color: '#ec4899' },
    { icon: '💰', label: 'Monthly Payroll', value: '₹' + (data.monthlyPayroll || 0).toLocaleString(), color: '#14b8a6' },
  ];

  const payrollChart = payroll.map(p => ({ name: MONTHS[p._id - 1], amount: p.total }));
  const deptChart = (data.deptWise || []).map(d => ({ name: d.name, value: d.count }));
  const attChart = (data.attendanceAgg || []).map(a => ({ name: a._id, value: a.count }));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>📊 Dashboard</h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>IT Company Overview — {new Date().toDateString()}</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        <Card>
          <h3 style={ch}>💰 Monthly Payroll ({new Date().getFullYear()})</h3>
          {payrollChart.length > 0
            ? <ResponsiveContainer width="100%" height={220}>
                <BarChart data={payrollChart}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} />
                  <Tooltip formatter={v => ['₹' + v.toLocaleString(), 'Payroll']} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            : <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem', fontSize: 13 }}>No payroll data yet</p>
          }
        </Card>

        <Card>
          <h3 style={ch}>🏢 Employees by Department</h3>
          {deptChart.length > 0
            ? <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={deptChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {deptChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            : <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem', fontSize: 13 }}>No department data</p>
          }
        </Card>
      </div>

      {/* Recent Joinings + Attendance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <h3 style={ch}>🆕 Recent Joinings</h3>
          {(data.recentJoinings || []).length === 0
            ? <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '1.5rem' }}>No recent joinings</p>
            : (data.recentJoinings || []).map(e => (
              <div key={e._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6366f1', fontSize: 14 }}>
                  {e.name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{e.designation} · {e.department?.name}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>
                  {new Date(e.joiningDate).toLocaleDateString()}
                </div>
              </div>
          ))}
        </Card>

        <Card>
          <h3 style={ch}>🕐 Attendance This Month</h3>
          {attChart.length > 0
            ? <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={attChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}>
                    {attChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend fontSize={11} />
                </PieChart>
              </ResponsiveContainer>
            : <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem', fontSize: 13 }}>No attendance data</p>
          }
        </Card>
      </div>

      {/* Feedback Form - Employee only */}
      {!isAdmin && <FeedbackForm />}
    </div>
  );
}

const ch = { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 };

function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    await api.post('/feedback', { message, rating });
    setSubmitted(true);
    setMessage('');
  };

  return (
    <Card style={{ marginTop: 20 }}>
      <h3 style={ch}>💬 Submit Feedback</h3>
      {submitted ? (
        <p style={{ color: '#22c55e', fontWeight: 600 }}>✅ Feedback submitted successfully!</p>
      ) : (
        <>
          <textarea
            rows={3}
            placeholder="Write your feedback here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, marginBottom: 10, resize: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select value={rating} onChange={e => setRating(Number(e.target.value))}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} ({n})</option>)}
            </select>
            <button onClick={handleSubmit}
              style={{ padding: '8px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Submit
            </button>
          </div>
        </>
      )}
    </Card>
  );
}