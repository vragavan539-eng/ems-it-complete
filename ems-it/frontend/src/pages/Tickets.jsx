import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Select, Table, Loader, Badge, statusColor } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Tickets() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  const [list, setList] = useState([]);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', category:'other', priority:'medium', raisedBy:'' });
  const [filter, setFilter] = useState('');
  const [editId, setEditId] = useState(null);

  const load = async () => { setLoading(true); const [t, e] = await Promise.all([api.get('/tickets'+(filter?`?status=${filter}`:'')), api.get('/employees')]); setList(Array.isArray(t)?t:[]); setEmps(Array.isArray(e)?e:[]); setLoading(false); };
  useEffect(() => { load(); }, [filter]);

  const save = async () => {
    if (!form.title || !form.raisedBy) return alert('Title and raised by required');
    if (editId) await api.put(`/tickets/${editId}`, form);
    else await api.post('/tickets', form);
    setShow(false); setEditId(null); load();
  };

  const updateStatus = async (id, status) => { await api.put(`/tickets/${id}`, { status }); load(); };

  const PRIORITY_COLORS = { low:'#22c55e', medium:'#f59e0b', high:'#ef4444', critical:'#7c3aed' };

  const cols = [
    { key: 'title', label: 'Title', render: r => <strong>{r.title}</strong> },
    { key: 'category', label: 'Category', render: r => <Badge label={r.category} color="#6366f1" /> },
    { key: 'raisedBy', label: 'Raised By', render: r => r.raisedBy?.name || '—' },
    { key: 'assignedTo', label: 'Assigned To', render: r => r.assignedTo?.name || <span style={{ color: '#94a3b8', fontSize: 12 }}>Unassigned</span> },
    { key: 'priority', label: 'Priority', render: r => <Badge label={r.priority} color={PRIORITY_COLORS[r.priority]} /> },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} color={statusColor(r.status)} /> },
    { key: 'createdAt', label: 'Raised On', render: r => new Date(r.createdAt).toLocaleDateString() },
    {
      key: 'actions', label: 'Actions', render: r => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Status buttons — admin/hr ku mattum */}
          {isAdmin && r.status === 'open' && <Btn size="sm" variant="warning" onClick={() => updateStatus(r._id, 'in-progress')}>Start</Btn>}
          {isAdmin && r.status === 'in-progress' && <Btn size="sm" variant="success" onClick={() => updateStatus(r._id, 'resolved')}>Resolve</Btn>}
          {isAdmin && r.status === 'resolved' && <Btn size="sm" variant="ghost" onClick={() => updateStatus(r._id, 'closed')}>Close</Btn>}
          {/* Delete — everyone ku */}
          <Btn size="sm" variant="danger" onClick={async () => { if(!confirm('Delete?'))return; await api.delete(`/tickets/${r._id}`); load(); }}>Del</Btn>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="🎫 IT Helpdesk" subtitle="Support ticket management"
        action={<Btn onClick={() => { setShow(true); setEditId(null); }}>+ Raise Ticket</Btn>} />

      <div style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 14, display: 'flex', gap: 8 }}>
        {['','open','in-progress','resolved','closed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid #e2e8f0', background: filter===s ? '#6366f1' : '#fff', color: filter===s ? '#fff' : '#64748b', fontSize: 12, fontWeight: 600 }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} emptyMsg="No tickets found" />}
      </div>

      <Modal show={show} onClose={() => setShow(false)} title="Raise Ticket">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Brief description of issue" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              options={['hardware','software','network','access','hr','other'].map(c => ({ value:c, label: c.charAt(0).toUpperCase()+c.slice(1) }))} />
            <Select label="Priority" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
              options={['low','medium','high','critical'].map(p => ({ value:p, label: p.charAt(0).toUpperCase()+p.slice(1) }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Raised By *</label>
            <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} value={form.raisedBy} onChange={e => setForm({...form, raisedBy: e.target.value})}>
              <option value="">Select Employee</option>
              {emps.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Description *</label>
            <textarea rows={4} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Detailed description of the issue..." />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setShow(false)}>Cancel</Btn>
          <Btn onClick={save}>Submit Ticket</Btn>
        </div>
      </Modal>
    </div>
  );
}