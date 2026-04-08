import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, Loader, Badge } from '../components/UI';
import api from '../api';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports() {
  const [tab, setTab] = useState('payroll');
  const [payroll, setPayroll] = useState([]);
  const [perf, setPerf] = useState(null);
  const [leave, setLeave] = useState(null);
 const [loading, setLoading] = useState(false);
const [year, setYear] = useState(new Date().getFullYear());
const [feedback, setFeedback] = useState([]); // 👈 NEW

useEffect(() => {
  setLoading(true);
  Promise.all([
    api.get(`/reports/payroll?year=${year}`),
    api.get(`/reports/performance?year=${year}`),
    api.get('/reports/leave'),
    api.get('/feedback/all'), // 👈 NEW
  ]).then(([p, pf, l, fb]) => {
    setPayroll((p.monthly || []).map(m => ({ name: MONTHS[m._id - 1], amount: m.total, count: m.count })));
    setPerf(pf);
    setLeave(l);
    setFeedback(fb || []); // 👈 NEW
    setLoading(false);
  });
}, [year]);
const TABS = [
  { id: 'payroll', label: '💰 Payroll' },
  { id: 'performance', label: '⭐ Performance' },
  { id: 'leave', label: '📅 Leave' },
  { id: 'feedback', label: '💬 Feedback' }, // 👈 இதை add பண்ணு
];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>📊 Reports & Analytics</h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>Data-driven insights for your IT workforce</p>
        </div>
        <select style={{ padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff' }}
          value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600,
            background: tab === t.id ? '#6366f1' : '#fff',
            color: tab === t.id ? '#fff' : '#64748b',
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <>
          {/* PAYROLL REPORT */}
          {tab === 'payroll' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <h3 style={ch}>Monthly Payroll Disbursement — {year}</h3>
                {payroll.length > 0
                  ? <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={payroll}>
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
                        <Tooltip formatter={v => ['₹' + Number(v).toLocaleString(), 'Total Payroll']} />
                        <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  : <Empty />
                }
              </Card>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {payroll.map(p => (
                  <Card key={p.name} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>{p.name}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#6366f1' }}>₹{(p.amount || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{p.count} employees</div>
                  </Card>
                ))}
                {payroll.length === 0 && <Card><Empty /></Card>}
              </div>
            </div>
          )}

          {/* PERFORMANCE REPORT */}
          {tab === 'performance' && perf && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                  <h3 style={ch}>Overall Summary — {year}</h3>
                  <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 48, fontWeight: 900, color: '#f59e0b' }}>{Number(perf.summary?.avgRating || 0).toFixed(1)}</div>
                      <div style={{ color: '#64748b', fontSize: 13 }}>Avg Rating</div>
                      <div style={{ fontSize: 20, marginTop: 4 }}>{'⭐'.repeat(Math.round(perf.summary?.avgRating || 0))}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 48, fontWeight: 900, color: '#6366f1' }}>{perf.summary?.count || 0}</div>
                      <div style={{ color: '#64748b', fontSize: 13 }}>Reviews Done</div>
                    </div>
                  </div>
                </Card>
                <Card>
                  <h3 style={ch}>🏆 Top Performers</h3>
                  {(perf.topPerformers || []).length === 0
                    ? <Empty />
                    : (perf.topPerformers || []).map((r, i) => (
                      <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: 18 }}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6366f1', fontSize: 13 }}>
                          {r.employee?.name?.[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.employee?.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.employee?.designation}</div>
                        </div>
                        <strong style={{ color: '#f59e0b' }}>{Number(r.overallRating).toFixed(1)} ⭐</strong>
                      </div>
                    ))
                  }
                </Card>
              </div>
            </div>
          )}

          {/* LEAVE REPORT */}
          {tab === 'leave' && leave && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Card>
                <h3 style={ch}>Leave by Type</h3>
                {(leave.byType || []).length > 0
                  ? <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={leave.byType.map(t => ({ name: t._id, value: t.count }))}
                          dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                          {(leave.byType || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  : <Empty />
                }
              </Card>
              <Card>
                <h3 style={ch}>Leave by Status</h3>
                {(leave.byStatus || []).length > 0
                  ? <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={leave.byStatus.map(s => ({ name: s._id, value: s.count }))}
                          dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                          {(leave.byStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  : <Empty />
                }
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {(leave.byType || []).map(t => (
                    <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <span style={{ textTransform: 'capitalize', color: '#475569' }}>{t._id}</span>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ color: '#94a3b8' }}>{t.count} requests</span>
                        <strong style={{ color: '#6366f1' }}>{t.days} days</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* FEEDBACK REPORT */}
          {tab === 'feedback' && (
            <Card>
              <h3 style={ch}>💬 Employee Feedbacks</h3>
              {feedback.length === 0 ? <Empty /> : (
                feedback.map(f => (
                  <div key={f._id} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{f.employee?.name}</strong>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{f.employee?.designation}</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>{f.message}</div>
                    <div style={{ marginTop: 4, color: '#f59e0b' }}>{'⭐'.repeat(f.rating)}</div>
                  </div>
                ))
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

const ch = { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 };
const Empty = () => <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: 13 }}>No data available</p>;
