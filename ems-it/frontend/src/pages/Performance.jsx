import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Select, Table, Loader, Badge, statusColor } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const RATINGS = [1,2,3,4,5];
const METRICS = ['technical','communication','teamwork','leadership','punctuality','productivity'];

const StarFilled = () => (
  <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" width="13" height="13">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const StarEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" width="13" height="13">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const Stars = ({ n }) => (
  <span style={{ display: 'inline-flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => i <= Math.round(n) ? <StarFilled key={i} /> : <StarEmpty key={i} />)}
  </span>
);

export default function Performance() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  const [list, setList] = useState([]);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    employee:'', reviewer:'', period:'Q1', year: new Date().getFullYear(),
    ratings:{ technical:3, communication:3, teamwork:3, leadership:3, punctuality:3, productivity:3 },
    strengths:'', improvements:'', comments:'', status:'draft'
  });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [p, e] = await Promise.all([api.get('/performance'), api.get('/employees')]);
    setList(Array.isArray(p) ? p : []);
    setEmps(Array.isArray(e) ? e : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.employee) return alert('Select employee');
    if (editId) await api.put(`/performance/${editId}`, form);
    else await api.post('/performance', form);
    setShow(false); setEditId(null); load();
  };

  const openEdit = (r) => {
    setForm({
      employee: r.employee?._id || '',
      reviewer: r.reviewer?._id || '',
      period: r.period,
      year: r.year,
      ratings: r.ratings,
      strengths: r.strengths || '',
      improvements: r.improvements || '',
      comments: r.comments || '',
      status: r.status
    });
    setEditId(r._id);
    setShow(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/performance/${id}`);
    load();
  };

  const cols = [
    { key: 'employee',      label: 'Employee',  render: r => <strong>{r.employee?.name || '—'}</strong> },
    { key: 'period',        label: 'Period',    render: r => `${r.period} ${r.year}` },
    { key: 'reviewer',      label: 'Reviewer',  render: r => r.reviewer?.name || '—' },
    { key: 'overallRating', label: 'Rating',    render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <strong style={{ color: '#f59e0b', fontSize: 14 }}>{Number(r.overallRating).toFixed(1)}</strong>
        <Stars n={r.overallRating} />
      </div>
    )},
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} color={statusColor(r.status)} /> },
    {
      key: 'actions', label: 'Actions', render: r => (
        <div style={{ display: 'flex', gap: 5 }}>
          {/* Edit — admin/hr ku mattum */}
          {isAdmin && (
            <Btn size="sm" variant="outline" onClick={() => openEdit(r)}>Edit</Btn>
          )}
          {/* Delete — everyone ku */}
          <Btn size="sm" variant="danger" onClick={() => handleDelete(r._id)}>Del</Btn>
        </div>
      )
    },
  ];

  const TitleIcon = () => (
    <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="0.5" width="20" height="20" style={{ verticalAlign: 'middle', marginRight: 6 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );

  return (
    <div>
      <PageHeader
        title={<span><TitleIcon />Performance Reviews</span>}
        subtitle="Evaluate and track employee performance"
        action={isAdmin ? <Btn onClick={() => { setEditId(null); setShow(true); }}>+ Add Review</Btn> : null}
      />

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} emptyMsg="No performance reviews" />}
      </div>

      {isAdmin && (
        <Modal show={show} onClose={() => setShow(false)} title={editId ? 'Edit Review' : 'Add Review'} width={640}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Employee *</label>
              <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
                value={form.employee} onChange={e => setForm({...form, employee: e.target.value})}>
                <option value="">Select Employee</option>
                {emps.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Reviewer</label>
              <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
                value={form.reviewer} onChange={e => setForm({...form, reviewer: e.target.value})}>
                <option value="">Select Reviewer</option>
                {emps.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <Select label="Period" value={form.period} onChange={e => setForm({...form, period: e.target.value})}
              options={['Q1','Q2','Q3','Q4','H1','H2','Annual'].map(p => ({ value: p, label: p }))} />
            <Input label="Year" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
          </div>

          <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 12 }}>PERFORMANCE RATINGS (1–5)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {METRICS.map(m => (
                <div key={m}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5, textTransform: 'capitalize' }}>{m}</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {RATINGS.map(r => (
                      <button key={r}
                        onClick={() => setForm(f => ({ ...f, ratings: { ...f.ratings, [m]: r } }))}
                        style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid #e2e8f0', background: form.ratings[m] >= r ? '#f59e0b' : '#fff', color: form.ratings[m] >= r ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Strengths</label>
              <textarea rows={2} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
                value={form.strengths} onChange={e => setForm({...form, strengths: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Areas for Improvement</label>
              <textarea rows={2} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
                value={form.improvements} onChange={e => setForm({...form, improvements: e.target.value})} />
            </div>
            <Select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              options={['draft','submitted','acknowledged'].map(s => ({ value: s, label: s.charAt(0).toUpperCase()+s.slice(1) }))} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setShow(false)}>Cancel</Btn>
            <Btn onClick={save}>{editId ? 'Update' : 'Save Review'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}