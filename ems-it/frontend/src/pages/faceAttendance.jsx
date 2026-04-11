import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://https://ems-it-complete-2.onrender.com:5000';
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const years = [2023, 2024, 2025, 2026];

const FaceAttendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ month: new Date().getMonth()+1, year: new Date().getFullYear() });
  const now = new Date();

  useEffect(() => { fetchRecords(); }, [filter.month, filter.year]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/attendance`, {
        params: { month: filter.month, year: filter.year },
        headers: { Authorization: `Bearer ${token}` }
      });
      const all = res.data || [];
      const mine = all.filter(r => r.employee?._id === user?._id || r.employee === user?._id);
      setRecords(mine);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const badge = (status) => ({
    present:    { bg:'#d1fae5', color:'#065f46' },
    absent:     { bg:'#fee2e2', color:'#991b1b' },
    late:       { bg:'#fef3c7', color:'#92400e' },
    'half-day': { bg:'#e0f2fe', color:'#075985' },
    holiday:    { bg:'#f3e8ff', color:'#6b21a8' },
    weekend:    { bg:'#f1f5f9', color:'#475569' },
  }[status] || { bg:'#f3f4f6', color:'#374151' });

  const present = records.filter(r=>r.status==='present'||r.status==='late').length;
  const absent  = records.filter(r=>r.status==='absent').length;
  const late    = records.filter(r=>r.status==='late').length;

  const todayRecord = records.find(r => {
    const d = new Date(r.date);
    return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  });

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>My Attendance</h1>
          <p style={s.sub}>Attendance is marked automatically when you log in with Face ID</p>
        </div>
        <button onClick={fetchRecords} style={s.btn}>↻ Refresh</button>
      </div>

      {/* Today banner */}
      <div style={{...s.banner, background: todayRecord?'#d1fae5':'#fef3c7', borderColor: todayRecord?'#6ee7b7':'#fcd34d'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
          {todayRecord
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          <div>
            <p style={{margin:0,fontWeight:'600',fontSize:'0.9rem',color:todayRecord?'#065f46':'#92400e'}}>
              {todayRecord ? `Today marked ✓  Check-in: ${todayRecord.checkIn}` : 'Not marked today — Login with Face ID to mark attendance'}
            </p>
            <p style={{margin:0,fontSize:'0.78rem',color:todayRecord?'#047857':'#b45309'}}>
              {now.toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
            </p>
          </div>
        </div>
        {todayRecord && (
          <span style={{padding:'0.2rem 0.65rem',borderRadius:'20px',fontSize:'0.72rem',fontWeight:'600',background:badge(todayRecord.status).bg,color:badge(todayRecord.status).color}}>
            {todayRecord.status}
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[['Present Days',present,'#d1fae5','#059669'],['Absent Days',absent,'#fee2e2','#dc2626'],['Late Days',late,'#fef3c7','#d97706'],['Total',records.length,'#eef2ff','#4f46e5']].map(([l,v,bg,c])=>(
          <div key={l} style={{...s.statCard,background:bg}}>
            <div style={{fontSize:'1.75rem',fontWeight:'700',color:c}}>{v}</div>
            <div style={{fontSize:'0.72rem',fontWeight:'600',color:c,textTransform:'uppercase',letterSpacing:'0.04em',marginTop:'0.2rem'}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={s.filterRow}>
        <select style={s.select} value={filter.month} onChange={e=>setFilter(f=>({...f,month:+e.target.value}))}>
          {months.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
        </select>
        <select style={s.select} value={filter.year} onChange={e=>setFilter(f=>({...f,year:+e.target.value}))}>
          {years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{fontSize:'0.82rem',color:'#9ca3af',marginLeft:'auto'}}>{records.length} records</span>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        {loading ? <div style={s.center}><div style={s.spinner}/></div>
        : records.length===0 ? <div style={s.center}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <p style={{color:'#9ca3af',marginTop:'0.75rem',fontSize:'0.85rem'}}>No records for {months[filter.month-1]} {filter.year}</p>
          </div>
        : <table style={s.table}>
            <thead><tr style={{background:'#f9fafb'}}>
              {['Date','Day','Check In','Check Out','Hours','Status','Location'].map(h=><th key={h} style={s.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {records.map((r,i)=>{
                const b=badge(r.status); const d=new Date(r.date);
                return <tr key={r._id} style={{background:i%2===0?'white':'#fafafa'}}>
                  <td style={{...s.td,fontWeight:'500'}}>{d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                  <td style={{...s.td,color:'#6b7280'}}>{d.toLocaleDateString('en-IN',{weekday:'short'})}</td>
                  <td style={{...s.td,color:'#059669',fontWeight:'500'}}>{r.checkIn||'—'}</td>
                  <td style={{...s.td,color:'#dc2626',fontWeight:'500'}}>{r.checkOut||'—'}</td>
                  <td style={s.td}>{r.workHours?`${r.workHours}h`:'—'}</td>
                  <td style={s.td}><span style={{padding:'0.22rem 0.65rem',borderRadius:'20px',fontSize:'0.72rem',fontWeight:'600',textTransform:'capitalize',background:b.bg,color:b.color}}>{r.status||'—'}</span></td>
                  <td style={{...s.td,color:'#6b7280',fontSize:'0.8rem',maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.location||'—'}</td>
                </tr>;
              })}
            </tbody>
          </table>}
        <div style={s.footer}>{months[filter.month-1]} {filter.year} · {records.length} records</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} select:focus{outline:none;border-color:#6366f1!important} tbody tr:hover td{background:#f5f3ff!important}`}</style>
    </div>
  );
};

const s = {
  page:{padding:'1.5rem',fontFamily:"'DM Sans','Segoe UI',sans-serif",maxWidth:'1100px'},
  header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'},
  title:{fontSize:'1.5rem',fontWeight:'700',color:'#111827',margin:0},
  sub:{color:'#6b7280',fontSize:'0.83rem',margin:'0.2rem 0 0'},
  btn:{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.5rem 1rem',background:'white',border:'1.5px solid #e5e7eb',borderRadius:'8px',cursor:'pointer',fontSize:'0.83rem',color:'#374151',fontWeight:'500'},
  banner:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.85rem 1.1rem',borderRadius:'10px',border:'1.5px solid',marginBottom:'1.25rem'},
  statsRow:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.25rem'},
  statCard:{borderRadius:'12px',padding:'1rem 1.2rem'},
  filterRow:{display:'flex',gap:'0.75rem',marginBottom:'1rem',alignItems:'center'},
  select:{padding:'0.6rem 0.85rem',border:'1.5px solid #e5e7eb',borderRadius:'8px',fontSize:'0.88rem',color:'#374151',background:'white',cursor:'pointer'},
  tableWrap:{background:'white',borderRadius:'12px',border:'1.5px solid #e5e7eb',overflow:'hidden'},
  center:{display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem'},
  spinner:{width:'34px',height:'34px',border:'3px solid #f3f4f6',borderTop:'3px solid #6366f1',borderRadius:'50%',animation:'spin 0.8s linear infinite'},
  table:{width:'100%',borderCollapse:'collapse'},
  th:{padding:'0.7rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:'600',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.05em',borderBottom:'1.5px solid #e5e7eb'},
  td:{padding:'0.78rem 1rem',fontSize:'0.875rem',color:'#374151',borderBottom:'1px solid #f3f4f6'},
  footer:{padding:'0.65rem 1rem',fontSize:'0.75rem',color:'#9ca3af',borderTop:'1px solid #f3f4f6',background:'#fafafa'},
};
export default FaceAttendance;