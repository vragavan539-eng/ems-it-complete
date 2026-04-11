import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://https://ems-it-complete-2.onrender.com:5000';
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const years = [2023, 2024, 2025, 2026];

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ month: new Date().getMonth()+1, year: new Date().getFullYear(), search: '' });

  useEffect(() => { fetch(); }, [filter.month, filter.year]);

  const fetch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/attendance`, {
        params: { month: filter.month, year: filter.year },
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = records.filter(r => {
    const s = filter.search.toLowerCase();
    return !s || r.employee?.name?.toLowerCase().includes(s) || r.employee?.employeeCode?.toLowerCase().includes(s);
  });

  const st = { present: records.filter(r=>r.status==='present').length, absent: records.filter(r=>r.status==='absent').length, late: records.filter(r=>r.status==='late').length };

  const badge = (status) => ({
    present:    { bg:'#d1fae5', color:'#065f46' },
    absent:     { bg:'#fee2e2', color:'#991b1b' },
    late:       { bg:'#fef3c7', color:'#92400e' },
    'half-day': { bg:'#e0f2fe', color:'#075985' },
    holiday:    { bg:'#f3e8ff', color:'#6b21a8' },
    weekend:    { bg:'#f1f5f9', color:'#475569' },
  }[status] || { bg:'#f3f4f6', color:'#374151' });

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div><h1 style={s.title}>Attendance</h1><p style={s.sub}>All employee attendance records</p></div>
        <button onClick={fetch} style={s.btn}>↻ Refresh</button>
      </div>

      <div style={s.statsRow}>
        {[['Total',records.length,'#eef2ff','#4f46e5'],['Present',st.present,'#d1fae5','#059669'],['Absent',st.absent,'#fee2e2','#dc2626'],['Late',st.late,'#fef3c7','#d97706']].map(([l,v,bg,c])=>(
          <div key={l} style={{...s.statCard,background:bg}}>
            <div style={{fontSize:'1.75rem',fontWeight:'700',color:c}}>{v}</div>
            <div style={{fontSize:'0.72rem',fontWeight:'600',color:c,textTransform:'uppercase',letterSpacing:'0.04em',marginTop:'0.2rem'}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={s.filterRow}>
        <div style={s.searchWrap}>
          <svg style={s.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input style={s.searchInput} placeholder="Search by name or code..." value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))} />
        </div>
        <select style={s.select} value={filter.month} onChange={e=>setFilter(f=>({...f,month:+e.target.value}))}>
          {months.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
        </select>
        <select style={s.select} value={filter.year} onChange={e=>setFilter(f=>({...f,year:+e.target.value}))}>
          {years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={s.tableWrap}>
        {loading ? <div style={s.center}><div style={s.spinner}/></div>
        : filtered.length===0 ? <div style={s.center}><p style={{color:'#9ca3af'}}>No records found</p></div>
        : <table style={s.table}>
            <thead><tr style={{background:'#f9fafb'}}>
              {['Employee','Code','Date','Check In','Check Out','Hours','Status','Location'].map(h=><th key={h} style={s.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((r,i)=>{
                const b=badge(r.status);
                return <tr key={r._id} style={{background:i%2===0?'white':'#fafafa'}}>
                  <td style={s.td}><div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                    <div style={s.avatar}>{r.employee?.name?.[0]||'?'}</div>
                    <span style={{fontWeight:'500',color:'#111827'}}>{r.employee?.name||'—'}</span>
                  </div></td>
                  <td style={{...s.td,color:'#6b7280',fontSize:'0.82rem'}}>{r.employee?.employeeCode||'—'}</td>
                  <td style={s.td}>{r.date?new Date(r.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</td>
                  <td style={{...s.td,color:'#059669',fontWeight:'500'}}>{r.checkIn||'—'}</td>
                  <td style={{...s.td,color:'#dc2626',fontWeight:'500'}}>{r.checkOut||'—'}</td>
                  <td style={s.td}>{r.workHours?`${r.workHours}h`:'—'}</td>
                  <td style={s.td}><span style={{padding:'0.22rem 0.65rem',borderRadius:'20px',fontSize:'0.72rem',fontWeight:'600',textTransform:'capitalize',background:b.bg,color:b.color}}>{r.status||'—'}</span></td>
                  <td style={{...s.td,color:'#6b7280',fontSize:'0.8rem',maxWidth:'150px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.location||'—'}</td>
                </tr>;
              })}
            </tbody>
          </table>}
        <div style={s.footer}>{filtered.length} records · {months[filter.month-1]} {filter.year}</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input:focus,select:focus{outline:none;border-color:#6366f1!important} tbody tr:hover td{background:#f5f3ff!important}`}</style>
    </div>
  );
};

const s = {
  page:{padding:'1.5rem',fontFamily:"'DM Sans','Segoe UI',sans-serif",maxWidth:'1200px'},
  header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem'},
  title:{fontSize:'1.5rem',fontWeight:'700',color:'#111827',margin:0},
  sub:{color:'#6b7280',fontSize:'0.83rem',margin:'0.2rem 0 0'},
  btn:{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.5rem 1rem',background:'white',border:'1.5px solid #e5e7eb',borderRadius:'8px',cursor:'pointer',fontSize:'0.83rem',color:'#374151',fontWeight:'500'},
  statsRow:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.25rem'},
  statCard:{borderRadius:'12px',padding:'1rem 1.2rem'},
  filterRow:{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'},
  searchWrap:{position:'relative',flex:1,minWidth:'200px'},
  searchIcon:{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',pointerEvents:'none'},
  searchInput:{width:'100%',boxSizing:'border-box',padding:'0.6rem 0.75rem 0.6rem 2.3rem',border:'1.5px solid #e5e7eb',borderRadius:'8px',fontSize:'0.88rem',color:'#374151'},
  select:{padding:'0.6rem 0.85rem',border:'1.5px solid #e5e7eb',borderRadius:'8px',fontSize:'0.88rem',color:'#374151',background:'white',cursor:'pointer'},
  tableWrap:{background:'white',borderRadius:'12px',border:'1.5px solid #e5e7eb',overflow:'hidden'},
  center:{display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem'},
  spinner:{width:'34px',height:'34px',border:'3px solid #f3f4f6',borderTop:'3px solid #6366f1',borderRadius:'50%',animation:'spin 0.8s linear infinite'},
  table:{width:'100%',borderCollapse:'collapse'},
  th:{padding:'0.7rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:'600',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.05em',borderBottom:'1.5px solid #e5e7eb'},
  td:{padding:'0.78rem 1rem',fontSize:'0.875rem',color:'#374151',borderBottom:'1px solid #f3f4f6'},
  avatar:{width:'30px',height:'30px',borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.78rem',fontWeight:'700',flexShrink:0},
  footer:{padding:'0.65rem 1rem',fontSize:'0.75rem',color:'#9ca3af',borderTop:'1px solid #f3f4f6',background:'#fafafa'},
};
export default Attendance;