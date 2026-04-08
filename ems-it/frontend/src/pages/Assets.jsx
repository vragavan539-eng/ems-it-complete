import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Select, Table, Loader, Badge, statusColor } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Assets() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  const [list, setList] = useState([]);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name:'', type:'laptop', brand:'', model:'', serialNumber:'', purchaseDate:'', purchasePrice:'', warrantyTill:'', assignedTo:'', status:'available', condition:'new', notes:'' });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [a, e] = await Promise.all([api.get('/assets'), api.get('/employees')]);
    setList(Array.isArray(a) ? a : []); setEmps(Array.isArray(e) ? e : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return alert('Name required');
    if (editId) await api.put(`/assets/${editId}`, form);
    else await api.post('/assets', form);
    setShow(false); setEditId(null); load();
  };

  const cols = [
    { key: 'assetCode', label: 'Code' },
    { key: 'name', label: 'Asset', render: r => <strong>{r.name}</strong> },
    { key: 'type', label: 'Type', render: r => <Badge label={r.type} color="#6366f1" /> },
    { key: 'brand', label: 'Brand' },
    { key: 'assignedTo', label: 'Assigned To', render: r => r.assignedTo?.name || <span style={{ color: '#94a3b8' }}>Unassigned</span> },
    { key: 'condition', label: 'Condition', render: r => <Badge label={r.condition} color={{ new:'#22c55e', good:'#3b82f6', fair:'#f59e0b', poor:'#ef4444' }[r.condition]} /> },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} color={statusColor(r.status)} /> },
    {
      key: 'actions', label: 'Actions', render: r => (
        <div style={{ display: 'flex', gap: 5 }}>
          {/* Edit — admin/hr ku mattum */}
          {isAdmin && (
            <Btn size="sm" variant="outline" onClick={() => {
              setForm({ name:r.name, type:r.type, brand:r.brand||'', model:r.model||'', serialNumber:r.serialNumber||'', purchaseDate:r.purchaseDate?r.purchaseDate.split('T')[0]:'', purchasePrice:r.purchasePrice||'', warrantyTill:r.warrantyTill?r.warrantyTill.split('T')[0]:'', assignedTo:r.assignedTo?._id||'', status:r.status, condition:r.condition, notes:r.notes||'' });
              setEditId(r._id); setShow(true);
            }}>Edit</Btn>
          )}
          {/* Delete — everyone ku */}
          <Btn size="sm" variant="danger" onClick={async () => { if(!confirm('Delete?'))return; await api.delete(`/assets/${r._id}`); load(); }}>Del</Btn>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="💻 Assets" subtitle="IT Asset Management"
        action={isAdmin ? <Btn onClick={() => { setShow(true); setEditId(null); }}>+ Add Asset</Btn> : null} />
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} emptyMsg="No assets found" />}
      </div>
      {isAdmin && (
        <Modal show={show} onClose={() => setShow(false)} title={editId ? 'Edit Asset' : 'Add Asset'} width={580}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Asset Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="MacBook Pro 14" />
            <Select label="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              options={['laptop','desktop','monitor','mouse','keyboard','phone','other'].map(t => ({ value:t, label: t.charAt(0).toUpperCase()+t.slice(1) }))} />
            <Input label="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Apple" />
            <Input label="Model" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="MNW83HN/A" />
            <Input label="Serial Number" value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} />
            <Input label="Purchase Price (₹)" type="number" value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice: e.target.value})} />
            <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} />
            <Input label="Warranty Till" type="date" value={form.warrantyTill} onChange={e => setForm({...form, warrantyTill: e.target.value})} />
            <Select label="Condition" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}
              options={['new','good','fair','poor'].map(c => ({ value:c, label: c.charAt(0).toUpperCase()+c.slice(1) }))} />
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Assign To</label>
              <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
                <option value="">Unassigned</option>
                {emps.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
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