import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Select, Table, Loader, Badge, statusColor } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  const [list, setList] = useState([]);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name:'', code:'', description:'', client:'', techStack:'', startDate:'', endDate:'', status:'planning', priority:'medium', progress:0, manager:'', team:[] });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [p, e] = await Promise.all([api.get('/projects'), api.get('/employees')]);
    setList(Array.isArray(p) ? p : []); setEmps(Array.isArray(e) ? e : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return alert('Name required');
    const payload = { ...form, techStack: form.techStack ? form.techStack.split(',').map(s=>s.trim()) : [] };
    if (editId) await api.put(`/projects/${editId}`, payload);
    else await api.post('/projects', payload);
    setShow(false); setEditId(null); load();
  };

  const openEdit = (p) => {
    setForm({ name:p.name, code:p.code||'', description:p.description||'', client:p.client||'', techStack:(p.techStack||[]).join(', '), startDate:p.startDate?p.startDate.split('T')[0]:'', endDate:p.endDate?p.endDate.split('T')[0]:'', status:p.status, priority:p.priority, progress:p.progress, manager:p.manager?._id||'', team:(p.team||[]).map(t=>t._id||t) });
    setEditId(p._id); setShow(true);
  };

  const cols = [
    { key: 'name', label: 'Project', render: r => <strong>{r.name}</strong> },
    { key: 'client', label: 'Client' },
    { key: 'manager', label: 'Manager', render: r => r.manager?.name || '—' },
    { key: 'team', label: 'Team', render: r => <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>{(r.team||[]).length} members</span> },
    { key: 'progress', label: 'Progress', render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 80, height: 6, background: '#e2e8f0', borderRadius: 3 }}>
          <div style={{ width: `${r.progress}%`, height: '100%', background: '#6366f1', borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 11, color: '#64748b' }}>{r.progress}%</span>
      </div>
    )},
    { key: 'priority', label: 'Priority', render: r => <Badge label={r.priority} color={{ low:'#22c55e', medium:'#f59e0b', high:'#ef4444', critical:'#7c3aed' }[r.priority]} /> },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} color={statusColor(r.status)} /> },
    {
      key: 'actions', label: 'Actions', render: r => (
        <div style={{ display: 'flex', gap: 5 }}>
          {/* Edit — admin/hr ku mattum */}
          {isAdmin && <Btn size="sm" variant="outline" onClick={() => openEdit(r)}>Edit</Btn>}
          {/* Delete — everyone ku */}
          <Btn size="sm" variant="danger" onClick={async () => { if(!confirm('Delete?'))return; await api.delete(`/projects/${r._id}`); load(); }}>Del</Btn>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="🚀 Projects" subtitle="IT Project Management"
        action={isAdmin ? <Btn onClick={() => { setShow(true); setEditId(null); setForm({ name:'', code:'', description:'', client:'', techStack:'', startDate:'', endDate:'', status:'planning', priority:'medium', progress:0, manager:'', team:[] }); }}>+ New Project</Btn> : null} />
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} emptyMsg="No projects found" />}
      </div>
      {isAdmin && (
        <Modal show={show} onClose={() => setShow(false)} title={editId ? 'Edit Project' : 'New Project'} width={640}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Project Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <Input label="Project Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="PRJ001" />
            <Input label="Client" value={form.client} onChange={e => setForm({...form, client: e.target.value})} />
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Manager</label>
              <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} value={form.manager} onChange={e => setForm({...form, manager: e.target.value})}>
                <option value="">Select Manager</option>
                {emps.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <Select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              options={['planning','active','on-hold','completed','cancelled'].map(s => ({ value: s, label: s }))} />
            <Select label="Priority" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
              options={['low','medium','high','critical'].map(s => ({ value: s, label: s }))} />
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Progress: {form.progress}%</label>
              <input type="range" min={0} max={100} value={form.progress} onChange={e => setForm({...form, progress: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <Input label="Tech Stack (comma separated)" value={form.techStack} onChange={e => setForm({...form, techStack: e.target.value})} placeholder="React, Node.js, MongoDB" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Team Members</label>
              <select multiple style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, height: 100 }}
                value={form.team} onChange={e => setForm({...form, team: [...e.target.selectedOptions].map(o => o.value)})}>
                {emps.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Hold Ctrl/Cmd to select multiple</p>
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