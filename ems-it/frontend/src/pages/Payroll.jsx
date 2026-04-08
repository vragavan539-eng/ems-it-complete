import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Select, Table, Loader, Badge, statusColor } from '../components/UI';
import api from '../api';

const EMPTY = { employee:'', month: new Date().getMonth()+1, year: new Date().getFullYear(), basicSalary:'', hra:'', ta:'', da:'', otherAllowances:'', pf:'', esi:'', tds:'', otherDeductions:'', bonus:'', lopDays:'', lop:'', remarks:'' };

export default function Payroll() {
  const [list, setList] = useState([]);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth()+1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const load = async () => {
    setLoading(true);
    const [p, e] = await Promise.all([
      api.get(`/payroll?month=${filterMonth}&year=${filterYear}`),
      api.get('/employees')
    ]);
    setList(Array.isArray(p) ? p : []);
    setEmps(Array.isArray(e) ? e : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterMonth, filterYear]);

  const f = (k) => Number(form[k] || 0);
  const gross = f('basicSalary') + f('hra') + f('ta') + f('da') + f('otherAllowances') + f('bonus');
  const deductions = f('pf') + f('esi') + f('tds') + f('otherDeductions') + f('lop');
  const net = gross - deductions;

  const save = async () => {
    if (!form.employee) return alert('Select employee');
    const payload = { ...form, grossSalary: gross, netSalary: net };
    if (editId) await api.put(`/payroll/${editId}`, payload);
    else await api.post('/payroll', payload);
    setShow(false); setForm(EMPTY); setEditId(null); load();
  };

  const markPaid = async (id) => {
    await api.patch(`/payroll/${id}/status`, { status: 'paid' }); load();
  };

  const del = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/payroll/${id}`); load(); };

  const cols = [
    { key: 'employee', label: 'Employee', render: r => <strong>{r.employee?.name || '—'}</strong> },
    { key: 'code', label: 'Code', render: r => r.employee?.employeeCode || '—' },
    { key: 'month', label: 'Month/Year', render: r => `${r.month}/${r.year}` },
    { key: 'grossSalary', label: 'Gross', render: r => '₹' + r.grossSalary?.toLocaleString() },
    { key: 'netSalary', label: 'Net', render: r => <strong style={{ color: '#22c55e' }}>₹{r.netSalary?.toLocaleString()}</strong> },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} color={statusColor(r.status)} /> },
    { key: 'actions', label: 'Actions', render: r => (
      <div style={{ display: 'flex', gap: 5 }}>
        {r.status === 'pending' && <Btn size="sm" variant="success" onClick={() => markPaid(r._id)}>Mark Paid</Btn>}
        <Btn size="sm" variant="danger" onClick={() => del(r._id)}>Del</Btn>
      </div>
    )},
  ];

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      <PageHeader title="💰 Payroll" subtitle="Manage employee salaries"
        action={<Btn onClick={() => { setShow(true); setForm(EMPTY); setEditId(null); }}>+ Generate Payroll</Btn>} />

      <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Filter:</span>
        <select style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{ fontSize: 13, color: '#64748b', marginLeft: 'auto' }}>Total: <strong style={{ color: '#22c55e' }}>₹{list.reduce((s, p) => s + (p.netSalary || 0), 0).toLocaleString()}</strong></span>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} emptyMsg="No payroll records" />}
      </div>

      <Modal show={show} onClose={() => setShow(false)} title="Generate Payroll" width={640}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Employee *</label>
            <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
              value={form.employee} onChange={e => { const emp = emps.find(x => x._id === e.target.value); setForm({...form, employee: e.target.value, basicSalary: emp?.salary || ''}); }}>
              <option value="">Select Employee</option>
              {emps.map(e => <option key={e._id} value={e._id}>{e.name} ({e.employeeCode})</option>)}
            </select>
          </div>
          <Select label="Month" value={form.month} onChange={e => setForm({...form, month: e.target.value})}
            options={MONTHS.map((m,i) => ({ value: i+1, label: m }))} />
          <Input label="Year" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />

          <div style={{ gridColumn: 'span 2', background: '#f8fafc', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>ALLOWANCES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['basicSalary','Basic Salary'],['hra','HRA'],['ta','Travel Allowance'],['da','DA'],['bonus','Bonus'],['otherAllowances','Other Allowances']].map(([k,l]) => (
                <Input key={k} label={l} type="number" value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} placeholder="0" />
              ))}
            </div>
          </div>

          <div style={{ gridColumn: 'span 2', background: '#fff5f5', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>DEDUCTIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['pf','PF'],['esi','ESI'],['tds','TDS'],['lop','LOP Amount'],['otherDeductions','Other Deductions']].map(([k,l]) => (
                <Input key={k} label={l} type="number" value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} placeholder="0" />
              ))}
            </div>
          </div>

          <div style={{ gridColumn: 'span 2', background: '#f0fdf4', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Gross: <strong>₹{gross.toLocaleString()}</strong></span>
            <span style={{ fontSize: 13, color: '#ef4444' }}>Deductions: <strong>₹{deductions.toLocaleString()}</strong></span>
            <span style={{ fontSize: 14, color: '#22c55e', fontWeight: 700 }}>Net Pay: ₹{net.toLocaleString()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setShow(false)}>Cancel</Btn>
          <Btn onClick={save}>Generate</Btn>
        </div>
      </Modal>
    </div>
  );
}
