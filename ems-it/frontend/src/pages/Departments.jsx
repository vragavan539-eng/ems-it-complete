// Departments Page
import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Table, Loader, Card } from '../components/UI';
import api from '../api';

export function Departments() {
  const [list, setList] = useState([]);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name:'', code:'', description:'', budget:'', location:'', head:'' });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [d, e] = await Promise.all([api.get('/departments'), api.get('/employees')]);
    setList(Array.isArray(d) ? d : []);
    setEmps(Array.isArray(e) ? e : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return alert('Name required');
    if (editId) await api.put(`/departments/${editId}`, form);
    else await api.post('/departments', form);
    setShow(false); setForm({ name:'', code:'', description:'', budget:'', location:'', head:'' }); setEditId(null);
    load();
  };

  const del = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/departments/${id}`); load(); };

  const cols = [
    { key: 'name', label: 'Department', render: r => <strong>{r.name}</strong> },
    { key: 'code', label: 'Code' },
    { key: 'head', label: 'Head', render: r => r.head?.name || '—' },
    { key: 'location', label: 'Location' },
    { key: 'budget', label: 'Budget', render: r => r.budget ? '₹' + Number(r.budget).toLocaleString() : '—' },
    { key: 'actions', label: 'Actions', render: r => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Btn size="sm" variant="outline" onClick={() => { setForm({ name:r.name, code:r.code||'', description:r.description||'', budget:r.budget||'', location:r.location||'', head:r.head?._id||'' }); setEditId(r._id); setShow(true); }}>Edit</Btn>
        <Btn size="sm" variant="danger" onClick={() => del(r._id)}>Delete</Btn>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="🏢 Departments" subtitle={`${list.length} departments`}
        action={<Btn onClick={() => { setShow(true); setEditId(null); }}>+ Add Department</Btn>} />
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} />}
      </div>
      <Modal show={show} onClose={() => setShow(false)} title={editId ? 'Edit Department' : 'Add Department'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Department Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <Input label="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="ENG" />
          <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <Input label="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <Input label="Budget (₹)" type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Department Head</label>
            <select style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
              value={form.head} onChange={e => setForm({...form, head: e.target.value})}>
              <option value="">Select Head</option>
              {emps.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setShow(false)}>Cancel</Btn>
          <Btn onClick={save}>{editId ? 'Update' : 'Save'}</Btn>
        </div>
      </Modal>
    </div>
  );
}

export default Departments;
