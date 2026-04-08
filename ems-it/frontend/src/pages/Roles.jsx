import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Table, Loader, Badge } from '../components/UI';
import api from '../api';

const MODULES = ['Employees','Departments','Payroll','Leave','Attendance','Performance','Projects','Assets','Training','Documents','Announcements','Tickets','Reports'];
const ACTIONS = ['view','create','edit','delete'];

export default function Roles() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', permissions: MODULES.map(m => ({ module:m, actions:['view'] })) });
  const [editId, setEditId] = useState(null);

  const load = async () => { setLoading(true); const d = await api.get('/roles'); setList(Array.isArray(d) ? d : []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const toggleAction = (module, action) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.map(p => p.module === module
        ? { ...p, actions: p.actions.includes(action) ? p.actions.filter(a => a !== action) : [...p.actions, action] }
        : p
      )
    }));
  };

  const save = async () => {
    if (!form.name) return alert('Name required');
    if (editId) await api.put(`/roles/${editId}`, form);
    else await api.post('/roles', form);
    setShow(false); setEditId(null);
    load();
  };

  const del = async (id) => { if (!confirm('Delete role?')) return; await api.delete(`/roles/${id}`); load(); };

  const cols = [
    { key: 'name', label: 'Role Name', render: r => <strong style={{ color: '#6366f1' }}>{r.name}</strong> },
    { key: 'description', label: 'Description' },
    { key: 'permissions', label: 'Modules', render: r => <span style={{ color: '#64748b', fontSize: 12 }}>{(r.permissions||[]).length} modules</span> },
    { key: 'actions', label: 'Actions', render: r => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Btn size="sm" variant="outline" onClick={() => {
          setForm({ name: r.name, description: r.description||'',
            permissions: MODULES.map(m => { const p = (r.permissions||[]).find(x => x.module===m); return { module:m, actions: p?.actions||[] }; })
          });
          setEditId(r._id); setShow(true);
        }}>Edit</Btn>
        <Btn size="sm" variant="danger" onClick={() => del(r._id)}>Delete</Btn>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="🔐 Roles & Access Control" subtitle="Manage user roles and permissions"
        action={<Btn onClick={() => { setShow(true); setEditId(null); setForm({ name:'', description:'', permissions: MODULES.map(m => ({ module:m, actions:['view'] })) }); }}>+ Add Role</Btn>} />
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} />}
      </div>
      <Modal show={show} onClose={() => setShow(false)} title={editId ? 'Edit Role' : 'Add Role'} width={680}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <Input label="Role Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Senior Developer" />
          <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>MODULE PERMISSIONS</div>
        <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Module</th>
              {ACTIONS.map(a => <th key={a} style={{ padding: '8px 12px', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>{a.charAt(0).toUpperCase()+a.slice(1)}</th>)}
            </tr></thead>
            <tbody>
              {form.permissions.map(p => (
                <tr key={p.module} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '7px 12px', fontWeight: 500 }}>{p.module}</td>
                  {ACTIONS.map(a => (
                    <td key={a} style={{ textAlign: 'center', padding: '7px 12px' }}>
                      <input type="checkbox" checked={p.actions.includes(a)} onChange={() => toggleAction(p.module, a)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setShow(false)}>Cancel</Btn>
          <Btn onClick={save}>{editId ? 'Update' : 'Save Role'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
