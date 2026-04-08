import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Select, Table, Loader, Badge, statusColor } from '../components/UI';
import api from '../api';
import FaceScanner from '../components/facescanner';
import { useAuth } from '../context/AuthContext';

export default function Attendance() {
  const { user, isAdmin, isHR } = useAuth();
  const isEmployee = !isAdmin && !isHR;

  const [list, setList] = useState([]);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ employee:'', date:'', checkIn:'', checkOut:'', status:'present', location:'', remarks:'' });
  const [month, setMonth] = useState(new Date().getMonth()+1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [faceMsg, setFaceMsg] = useState('');
  const [faceResult, setFaceResult] = useState(null);
  const [checkOutLoading, setCheckOutLoading] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const load = async () => {
    setLoading(true);
    const [a, e] = await Promise.all([
      api.get(`/attendance?month=${month}&year=${year}`),
      api.get('/employees')
    ]);
    const allList = Array.isArray(a) ? a : [];
    const allEmps = Array.isArray(e) ? e : [];

    if (isEmployee) {
      const userId = user?.id || user?._id;
      const userName = user?.name?.toLowerCase().trim();
      const filtered = allList.filter(record => {
        const emp = record.employee;
        if (!emp) return false;
        const empUserId = emp.user?._id || emp.user;
        if (empUserId && empUserId === userId) return true;
        if (userName && emp.name?.toLowerCase().trim() === userName) return true;
        return false;
      });
      setList(filtered);
    } else {
      setList(allList);
    }

    setEmps(allEmps);
    setLoading(false);
  };

  useEffect(() => { load(); }, [month, year]);

  // ✅ Check Out handler
  const handleCheckOut = async (record) => {
    const now = new Date();
    const checkOutTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    // Calculate work hours
    let workHours = null;
    if (record.checkIn) {
      const [inH, inM] = record.checkIn.split(':').map(Number);
      const [outH, outM] = checkOutTime.split(':').map(Number);
      const diff = (outH * 60 + outM) - (inH * 60 + inM);
      if (diff > 0) workHours = +(diff / 60).toFixed(1);
    }

    // Get location
    let location = record.location || '';
    if (!location && navigator.geolocation) {
      try {
        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
        location = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      } catch { location = 'Office'; }
    }

    setCheckOutLoading(record._id);
    try {
      await api.patch(`/attendance/${record._id}`, {
        checkOut: checkOutTime,
        workHours,
        location: location || 'Office'
      });
      load();
    } catch (err) {
      alert('Check Out failed: ' + err.message);
    }
    setCheckOutLoading(null);
  };

  const save = async () => {
    if (!form.employee || !form.date) return alert('Employee and date required');
    await api.post('/attendance', form);
    setShow(false);
    setForm({ employee:'', date:'', checkIn:'', checkOut:'', status:'present', location:'', remarks:'' });
    load();
  };

  const handleFaceScan = async (descriptor) => {
    setFaceMsg('⏳ Verifying...');
    setFaceResult(null);
    try {
      const res = await api.post('/face/verify', { descriptor });
      if (res.matched) {
        setFaceResult(res);
        setFaceMsg(res.alreadyMarked
          ? `⚠️ ${res.employee.name} — Already marked today!`
          : `✅ ${res.employee.name} — Attendance Marked Successfully!`);
        load();
      } else {
        setFaceMsg('❌ Face not recognized! Please register first.');
      }
    } catch (err) { setFaceMsg('❌ Error: ' + err.message); }
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ✅ Check if a record is today's and has no checkout
  const isToday = (dateStr) => {
    const d = new Date(dateStr).toISOString().split('T')[0];
    return d === today;
  };

  const cols = [
    { key: 'employee', label: 'Employee', render: r => <strong>{r.employee?.name || '—'}</strong> },
    { key: 'date', label: 'Date', render: r => new Date(r.date).toLocaleDateString() },
    { key: 'checkIn', label: 'Check In', render: r => r.checkIn || '—' },
    {
      key: 'checkOut', label: 'Check Out', render: r => {
        if (r.checkOut) return <span style={{ color: '#0f172a' }}>{r.checkOut}</span>;
        // ✅ Show "Check Out" button for today's present record with no checkout
        if (isToday(r.date) && r.status === 'present' && !r.checkOut) {
          return (
            <Btn
              size="sm"
              variant="outline"
              onClick={() => handleCheckOut(r)}
              disabled={checkOutLoading === r._id}
              style={{ fontSize: 11, padding: '3px 10px', borderColor: '#6366f1', color: '#6366f1' }}
            >
              {checkOutLoading === r._id ? '⏳' : '⏹ Check Out'}
            </Btn>
          );
        }
        return <span style={{ color: '#94a3b8' }}>—</span>;
      }
    },
    { key: 'workHours', label: 'Hours', render: r => r.workHours ? <span style={{ fontWeight: 600, color: '#22c55e' }}>{r.workHours}h</span> : '—' },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} color={statusColor(r.status)} /> },
    {
      key: 'location', label: 'Location', render: r => {
        if (!r.location) return <span style={{ color: '#94a3b8' }}>—</span>;
        // If coords, show map link
        if (r.location.includes(',') && r.location.match(/^-?\d/)) {
          const [lat, lng] = r.location.split(',').map(s => s.trim());
          return (
            <a href={`https://maps.google.com/?q=${lat},${lng}`} target="_blank" rel="noreferrer"
              style={{ color: '#6366f1', fontSize: 12, textDecoration: 'none' }}>
              📍 View Map
            </a>
          );
        }
        return <span>{r.location}</span>;
      }
    },
  ];

  const summary = {
    present: list.filter(a => a.status==='present').length,
    absent: list.filter(a => a.status==='absent').length,
    late: list.filter(a => a.status==='late').length
  };

  return (
    <div>
      <PageHeader title="🕐 Attendance" subtitle="Track employee attendance"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="outline" onClick={() => { setShowFaceScan(true); setFaceMsg(''); setFaceResult(null); }}>
              📷 Face Scan
            </Btn>
            {!isEmployee && <Btn onClick={() => setShow(true)}>+ Mark Attendance</Btn>}
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[['Present', summary.present, '#22c55e'], ['Absent', summary.absent, '#ef4444'], ['Late', summary.late, '#f59e0b']].map(([l,v,c]) => (
          <div key={l} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${c}` }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 14, display: 'flex', gap: 12 }}>
        <select style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} value={month} onChange={e => setMonth(e.target.value)}>
          {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} value={year} onChange={e => setYear(e.target.value)}>
          {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* ✅ Today's status banner for employee */}
      {isEmployee && (() => {
        const todayRecord = list.find(r => isToday(r.date) && r.status === 'present');
        if (!todayRecord) return null;
        return (
          <div style={{ background: todayRecord.checkOut ? '#f0fdf4' : '#fffbeb', border: `1px solid ${todayRecord.checkOut ? '#bbf7d0' : '#fde68a'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, color: todayRecord.checkOut ? '#15803d' : '#d97706', fontSize: 14 }}>
                {todayRecord.checkOut ? '✅ Checked Out Today' : '🟡 Checked In — Not yet checked out'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Check In: {todayRecord.checkIn}
                {todayRecord.checkOut && ` · Check Out: ${todayRecord.checkOut}`}
                {todayRecord.workHours && ` · ${todayRecord.workHours}h worked`}
              </div>
            </div>
            {!todayRecord.checkOut && (
              <Btn onClick={() => handleCheckOut(todayRecord)} disabled={checkOutLoading === todayRecord._id}
                style={{ background: '#f59e0b', border: 'none', color: '#fff' }}>
                {checkOutLoading === todayRecord._id ? '⏳ Checking out...' : '⏹ Check Out Now'}
              </Btn>
            )}
          </div>
        );
      })()}

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} emptyMsg="No attendance records" />}
      </div>

      {!isEmployee && (
        <Modal show={show} onClose={() => setShow(false)} title="Mark Attendance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Employee *</label>
              <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
                value={form.employee} onChange={e => setForm({...form, employee: e.target.value})}>
                <option value="">Select Employee</option>
                {emps.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            <Select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              options={['present','absent','half-day','late','holiday','weekend'].map(s => ({ value: s, label: s.charAt(0).toUpperCase()+s.slice(1) }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Check In" type="time" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} />
              <Input label="Check Out" type="time" value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} />
            </div>
            <Input label="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Office / WFH / Field" />
            <Input label="Remarks" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setShow(false)}>Cancel</Btn>
            <Btn onClick={save}>Save</Btn>
          </div>
        </Modal>
      )}

      <Modal show={showFaceScan} onClose={() => setShowFaceScan(false)} title="📷 Face Attendance" width={420}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            Camera-ல முகம் வையுங்க — <strong>Automatic-ஆ</strong> attendance mark ஆகும்!
          </p>
          {faceResult?.matched && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {faceResult.employee.photo
                  ? <img src={`http://localhost:5000${faceResult.employee.photo}`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : '👤'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: '#15803d' }}>{faceResult.employee.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{faceResult.employee.employeeCode}</div>
              </div>
            </div>
          )}
          <FaceScanner onDetect={handleFaceScan} autoScan={true} />
          {faceMsg && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: faceMsg.includes('✅') ? '#f0fdf4' : faceMsg.includes('⚠️') ? '#fffbeb' : '#fef2f2', color: faceMsg.includes('✅') ? '#16a34a' : faceMsg.includes('⚠️') ? '#d97706' : '#dc2626', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
              {faceMsg}
            </div>
          )}
          {(faceMsg.includes('✅') || faceMsg.includes('⚠️')) && (
            <Btn style={{ marginTop: 12 }} onClick={() => setShowFaceScan(false)}>Done ✓</Btn>
          )}
        </div>
      </Modal>
    </div>
  );
}