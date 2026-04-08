import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Select, Table, Loader, Badge, statusColor } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Training() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', category:'technical', trainer:'', startDate:'', endDate:'', mode:'online', venue:'', link:'', status:'upcoming', certificate:false });
  const [editId, setEditId] = useState(null);

  const load = async () => { setLoading(true); const d = await api.get('/training'); setList(Array.isArray(d)?d:[]); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) return alert('Title required');
    if (editId) await api.put(`/training/${editId}`, form);
    else await api.post('/training', form);
    setShow(false); setEditId(null); load();
  };

  const cols = [
    { key: 'title', label: 'Training', render: r => <strong>{r.title}</strong> },
    { key: 'category', label: 'Category', render: r => <Badge label={r.category} color="#6366f1" /> },
    { key: 'trainer', label: 'Trainer' },
    { key: 'mode', label: 'Mode', render: r => <Badge label={r.mode} color="#3b82f6" /> },
    { key: 'startDate', label: 'Start', render: r => r.startDate ? new Date(r.startDate).toLocaleDateString() : '—' },
    { key: 'participants', label: 'Participants', render: r => (r.participants||[]).length },
    { key: 'certificate', label: 'Cert', render: r => r.certificate ? '✅' : '—' },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} color={statusColor(r.status)} /> },
    {
      key: 'actions', label: 'Actions', render: r => (
        <div style={{ display: 'flex', gap: 5 }}>
          {/* Edit — admin/hr ku mattum */}
          {isAdmin && (
            <Btn size="sm" variant="outline" onClick={() => {
              setForm({ title:r.title, description:r.description||'', category:r.category, trainer:r.trainer||'', startDate:r.startDate?r.startDate.split('T')[0]:'', endDate:r.endDate?r.endDate.split('T')[0]:'', mode:r.mode, venue:r.venue||'', link:r.link||'', status:r.status, certificate:r.certificate });
              setEditId(r._id); setShow(true);
            }}>Edit</Btn>
          )}
          {/* Delete — everyone ku */}
          <Btn size="sm" variant="danger" onClick={async () => { if(!confirm('Delete?'))return; await api.delete(`/training/${r._id}`); load(); }}>Del</Btn>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="🎓 Training" subtitle="Manage employee training programs"
        action={isAdmin ? <Btn onClick={() => { setShow(true); setEditId(null); }}>+ Add Training</Btn> : null} />
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} emptyMsg="No training programs" />}
      </div>
      {isAdmin && (
        <Modal show={show} onClose={() => setShow(false)} title={editId ? 'Edit Training' : 'Add Training'} width={580}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <Input label="Training Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="React Advanced Concepts" />
            </div>
            <Select label="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              options={['technical','soft-skills','compliance','onboarding','other'].map(c => ({ value:c, label: c }))} />
            <Select label="Mode" value={form.mode} onChange={e => setForm({...form, mode: e.target.value})}
              options={['online','offline','hybrid'].map(m => ({ value:m, label: m.charAt(0).toUpperCase()+m.slice(1) }))} />
            <Input label="Trainer" value={form.trainer} onChange={e => setForm({...form, trainer: e.target.value})} placeholder="Trainer name" />
            <Select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              options={['upcoming','ongoing','completed','cancelled'].map(s => ({ value:s, label: s }))} />
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
            {form.mode !== 'offline' && <div style={{ gridColumn: 'span 2' }}><Input label="Meeting Link" value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://meet.google.com/..." /></div>}
            {form.mode !== 'online' && <div style={{ gridColumn: 'span 2' }}><Input label="Venue" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} placeholder="Conference Room A" /></div>}
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="cert" checked={form.certificate} onChange={e => setForm({...form, certificate: e.target.checked})} />
              <label htmlFor="cert" style={{ fontSize: 13, fontWeight: 500 }}>Certificate will be provided</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setShow(false)}>Cancel</Btn>
            <Btn onClick={save}>{editId ? 'Update' : 'Save'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}