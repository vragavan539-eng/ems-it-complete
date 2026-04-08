import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const [scrollY, setScrollY] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [typedText, setTypedText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const words = ['IT Teams', 'HR Ops', 'Workforce', 'IT Company'];

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 200);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [], animId;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * W - W / 2,
        y: Math.random() * H - H / 2,
        z: Math.random() * W,
        pz: 0,
        color: ['99,102,241', '139,92,246', '255,255,255', '59,130,246'][Math.floor(Math.random() * 4)]
      }));
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(2,8,23,0.2)';
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const { x: mx, y: my } = mouseRef.current;
      const speed = 2;
      stars.forEach(s => {
        s.pz = s.z;
        s.z -= speed;
        if (s.z <= 0) { s.z = W; s.x = Math.random() * W - cx; s.y = Math.random() * H - cy; s.pz = s.z; }
        const sx = (s.x / s.z) * W + cx;
        const sy = (s.y / s.z) * H + cy;
        const px = (s.x / s.pz) * W + cx;
        const py = (s.y / s.pz) * H + cy;
        const size = Math.max(0.1, (1 - s.z / W) * 3);
        const alpha = (1 - s.z / W) * 0.8;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(${s.color},${alpha})`; ctx.lineWidth = size; ctx.stroke();
      });
      if (mx > 0) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 300);
        grd.addColorStop(0, 'rgba(99,102,241,0.04)'); grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      }
      animId = requestAnimationFrame(draw);
    };

    window.addEventListener('mousemove', e => { mouseRef.current = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('resize', resize);
    resize(); draw();

    const handleScroll = () => {
      setScrollY(window.scrollY);
      ['home', 'about', 'features', 'contact'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { const r = el.getBoundingClientRect(); if (r.top <= 100 && r.bottom >= 100) setActiveNav(id); }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('scroll', handleScroll); };
  }, []);

  useEffect(() => {
    if (!heroVisible) return;
    let i = 0, del = false, cur = words[wordIdx];
    const t = setInterval(() => {
      if (!del) { setTypedText(cur.slice(0, ++i)); if (i >= cur.length) { del = true; setTimeout(() => {}, 1800); } }
      else { setTypedText(cur.slice(0, --i)); if (i <= 0) { del = false; setWordIdx(p => (p + 1) % words.length); clearInterval(t); } }
    }, del ? 30 : 110);
    return () => clearInterval(t);
  }, [heroVisible, wordIdx]);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // ── ICONS (SVG) ──
  const IcoUsers     = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  const IcoDollar    = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  const IcoCalendar  = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>;
  const IcoClock     = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  const IcoStar      = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  const IcoCheck     = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
  const IcoMonitor   = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
  const IcoGradCap   = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
  const IcoChat      = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  const IcoGrid      = ({ c='#818cf8', s=22 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  const IcoBolt      = ({ c='#818cf8', s=22 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  const IcoBuilding  = ({ c='#818cf8', s=22 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  const IcoShield    = ({ c='#818cf8', s=22 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  const IcoTarget    = ({ c='currentColor', s=38 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  const IcoTelescope = ({ c='currentColor', s=38 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  const IcoZap       = ({ c='currentColor', s=38 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  const IcoLock      = ({ c='currentColor', s=38 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
  const IcoMail      = ({ c='currentColor', s=24 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const IcoPhone     = ({ c='currentColor', s=24 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.44 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>;
  const IcoPin       = ({ c='currentColor', s=24 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

  const features = [
    { icon: <IcoUsers />,    title: 'Employee Hub',     desc: 'Profiles, org charts & role-based access all in one place',         color: '#6366f1', bg: '99,102,241'  },
    { icon: <IcoDollar />,   title: 'Payroll Engine',   desc: 'Automated salary runs, tax calculations & instant payslips',        color: '#8b5cf6', bg: '139,92,246' },
    { icon: <IcoCalendar />, title: 'Leave Portal',     desc: 'One-click leave requests with smart approval workflows',            color: '#3b82f6', bg: '59,130,246'  },
    { icon: <IcoClock />,    title: 'Attendance AI',    desc: 'Real-time tracking with geofencing & analytics dashboard',          color: '#06b6d4', bg: '6,182,212'   },
    { icon: <IcoStar />,     title: 'Performance 360', desc: 'Peer reviews, OKRs and growth tracking in one view',               color: '#f59e0b', bg: '245,158,11'  },
    { icon: <IcoCheck />,    title: 'Project Control',  desc: 'Milestones, assignments & team velocity tracking',                  color: '#ef4444', bg: '239,68,68'   },
    { icon: <IcoMonitor />,  title: 'Asset Registry',   desc: 'Device assignments, warranties & audit trail',                      color: '#10b981', bg: '16,185,129'  },
    { icon: <IcoGradCap />,  title: 'Learning Hub',     desc: 'Course scheduling, completions & skill assessments',               color: '#ec4899', bg: '236,72,153'  },
    { icon: <IcoChat />,     title: 'Pulse Feedback',   desc: 'Anonymous rated feedback with sentiment analysis',                  color: '#a78bfa', bg: '167,139,250' },
  ];

  const stats = [
    { val: '15+',   label: 'Modules',   icon: <IcoGrid /> },
    { val: '99.9%', label: 'Uptime',    icon: <IcoBolt /> },
    { val: '1K+',   label: 'Companies', icon: <IcoBuilding /> },
    { val: '24/7',  label: 'Support',   icon: <IcoShield /> },
  ];

  const aboutItems = [
    { icon: <IcoTarget c="#6366f1" s={38} />, title: 'Laser-Focused Mission', desc: "Simplify every HR operation for IT teams. Cut admin time by 70%, reduce payroll errors to zero, and give your team back hours every week.", border: 'rgba(99,102,241,0.25)', glow: 'rgba(99,102,241,0.08)' },
    { icon: <IcoTelescope c="#8b5cf6" s={38} />, title: 'Long-Term Vision',   desc: "Every IT company on the planet, managed on TechEMS. We're building the infrastructure layer for the modern tech workforce.",              border: 'rgba(139,92,246,0.25)', glow: 'rgba(139,92,246,0.08)' },
    { icon: <IcoZap c="#3b82f6" s={38} />,    title: 'Performance Obsessed', desc: "React + Node.js + MongoDB. Sub-100ms API responses. Real-time everything. Built for teams that can't afford slowness.",                    border: 'rgba(59,130,246,0.25)', glow: 'rgba(59,130,246,0.08)'  },
    { icon: <IcoLock c="#10b981" s={38} />,   title: 'Security First',       desc: "JWT auth, bcrypt hashing, RBAC, rate limiting, input sanitization, and audit logs. Enterprise-grade security, startup-friendly pricing.",  border: 'rgba(16,185,129,0.25)', glow: 'rgba(16,185,129,0.08)'  },
  ];

  const contactItems = [
    { icon: (c) => <IcoMail  c={c} />, label: 'EMAIL',    val: 'support@techems.com',   sub: 'Reply within 2 hours · Always',         color: '#6366f1' },
    { icon: (c) => <IcoPhone c={c} />, label: 'PHONE',    val: '+91 98765 43210',        sub: 'Mon–Sat · 9AM to 8PM IST',              color: '#8b5cf6' },
    { icon: (c) => <IcoPin   c={c} />, label: 'LOCATION', val: 'Chennai, Tamil Nadu',    sub: 'India — Global HQ',                     color: '#3b82f6' },
    { icon: (c) => <IcoChat  c={c} />, label: 'LIVE CHAT',val: 'Available 24 / 7',       sub: 'Average response: 90 seconds',          color: '#10b981' },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#020817', color: '#f1f5f9', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Fira+Code:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes gradFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes floatR { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(5deg)} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2);opacity:0} }
        @keyframes scanLine { 0%{top:0%} 100%{top:100%} }
        @keyframes revealUp { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
        @keyframes iconSpin { 0%{transform:rotate(0deg) scale(1)} 25%{transform:rotate(-10deg) scale(1.1)} 75%{transform:rotate(10deg) scale(1.1)} 100%{transform:rotate(0deg) scale(1)} }
        .cta-primary { position:relative; overflow:hidden; transition:all 0.3s cubic-bezier(0.16,1,0.3,1) !important; }
        .cta-primary::before { content:''; position:absolute; top:0; left:-150%; width:80%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent); transition:left 0.6s ease; }
        .cta-primary:hover::before { left:150%; }
        .cta-primary:hover { transform:translateY(-4px) scale(1.03) !important; box-shadow:0 30px 70px rgba(99,102,241,0.55) !important; }
        .cta-ghost { transition:all 0.3s ease !important; }
        .cta-ghost:hover { background:rgba(99,102,241,0.1) !important; border-color:rgba(99,102,241,0.5) !important; color:#f1f5f9 !important; transform:translateY(-3px) !important; }
        .nav-item { transition:all 0.2s ease; position:relative; }
        .nav-item::after { content:''; position:absolute; bottom:-4px; left:50%; right:50%; height:2px; background:linear-gradient(90deg,#6366f1,#8b5cf6); transition:all 0.3s ease; border-radius:1px; }
        .nav-item.active::after, .nav-item:hover::after { left:0; right:0; }
        .nav-item:hover { color:#f1f5f9 !important; }
        .feat { transition:all 0.4s cubic-bezier(0.16,1,0.3,1); }
        .feat:hover { transform:translateY(-12px) rotateX(5deg) !important; }
        .feat:hover .feat-icon { animation:iconSpin 0.6s ease forwards; }
        .stat-box { transition:all 0.3s ease; }
        .stat-box:hover { transform:translateY(-6px) scale(1.05) !important; }
        .about-item { transition:all 0.4s cubic-bezier(0.16,1,0.3,1); }
        .about-item:hover { transform:translateY(-8px) scale(1.01) !important; }
        .contact-item { transition:all 0.3s ease; border-radius:16px; }
        .contact-item:hover { background:rgba(99,102,241,0.07) !important; transform:translateX(8px); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:linear-gradient(to bottom, #6366f1, #8b5cf6); border-radius:2px; }
      `}</style>

      {/* STARFIELD */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* AMBIENT */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 55%)', top: -400, left: -300, animation: 'float 15s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 55%)', bottom: -200, right: -300, animation: 'float 18s ease-in-out infinite 3s' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.02) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.15),transparent)', animation: 'scanLine 8s linear infinite' }} />
        {[[160,'12%','6%','0s'],[100,'65%','4%','4s'],[200,'80%','70%','2s'],[80,'20%','80%','6s']].map(([size,top,left,delay],i) => (
          <div key={i} style={{ position:'absolute', width:size, height:size, borderRadius:'50%', border:'1px solid rgba(99,102,241,0.06)', top, left, animation:`floatR 10s ease-in-out infinite ${delay}` }} />
        ))}
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{ position:'fixed', top:18, left:'50%', transform:'translateX(-50%)', zIndex:1000, display:'flex', alignItems:'center', height:60, transition:'all 0.4s ease', minWidth:680 }}>
        <div style={{ position:'absolute', inset:0, background: scrollY>50?'rgba(2,8,23,0.92)':'rgba(2,8,23,0.55)', backdropFilter:'blur(30px)', borderRadius:20, border:`1px solid ${scrollY>50?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.06)'}`, boxShadow: scrollY>50?'0 10px 50px rgba(0,0,0,0.5)':'none', transition:'all 0.4s ease' }} />
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', width:'100%', padding:'0 20px', gap:8 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginRight:16 }} onClick={() => scrollTo('home')}>
            <div style={{ position:'relative', width:34, height:34 }}>
              <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:'1.5px solid rgba(99,102,241,0.4)', animation:'pulseRing 2.5s ease-out infinite' }} />
              <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <IcoBolt c="#fff" s={18} />
              </div>
            </div>
            <span style={{ fontWeight:900, fontSize:17, background:'linear-gradient(135deg,#f1f5f9 30%,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'-0.5px' }}>TechEMS</span>
          </div>
          {/* Nav links */}
          <div style={{ display:'flex', gap:2, flex:1, justifyContent:'center' }}>
            {['home','about','features','contact'].map(s => (
              <button key={s} className={`nav-item ${activeNav===s?'active':''}`} onClick={() => scrollTo(s)}
                style={{ background:'none', border:'none', color:activeNav===s?'#f1f5f9':'#475569', fontSize:13, fontWeight:600, cursor:'pointer', padding:'8px 18px', borderRadius:10, textTransform:'capitalize', fontFamily:"'Plus Jakarta Sans'" }}>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          {/* Buttons */}
          <div style={{ display:'flex', gap:8 }}>
            <button className="cta-ghost" onClick={() => navigate('/login')}
              style={{ padding:'8px 20px', background:'transparent', color:'#475569', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans'" }}>
              Sign In
            </button>
            <button className="cta-primary" onClick={() => navigate('/login')}
              style={{ padding:'8px 20px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans'", boxShadow:'0 4px 20px rgba(99,102,241,0.3)' }}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'140px 40px 60px', position:'relative', zIndex:1 }}>
        <div style={{ opacity:heroVisible?1:0, transform:heroVisible?'none':'translateY(20px)', transition:'all 0.8s ease 0.1s', display:'inline-flex', alignItems:'center', gap:10, background:'rgba(2,8,23,0.8)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:30, padding:'7px 20px', marginBottom:36, backdropFilter:'blur(20px)' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block', boxShadow:'0 0 10px #10b981', animation:'blink 1.5s infinite' }} />
          <span style={{ fontFamily:'Fira Code', fontSize:11, color:'#34d399', fontWeight:600, letterSpacing:'1.5px' }}>LIVE PLATFORM</span>
          <span style={{ width:1, height:14, background:'rgba(255,255,255,0.1)' }} />
          <span style={{ fontFamily:'Fira Code', fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:'1px' }}>v2.0 · IT WORKFORCE</span>
        </div>

        <div style={{ opacity:heroVisible?1:0, transform:heroVisible?'none':'translateY(40px)', transition:'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s' }}>
          <h1 style={{ fontSize:'clamp(48px,9vw,96px)', fontWeight:900, lineHeight:0.98, letterSpacing:'-4px', marginBottom:32 }}>
            <span style={{ display:'block', color:'rgba(255,255,255,0.9)' }}>The Smarter</span>
            <span style={{ display:'block', color:'rgba(255,255,255,0.9)' }}>Way to Run</span>
            <span style={{ display:'inline-block', background:'linear-gradient(135deg,#818cf8,#6366f1,#a78bfa,#8b5cf6,#818cf8)', backgroundSize:'300%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'gradFlow 5s ease infinite', minWidth:220 }}>
              {typedText}<span style={{ WebkitTextFillColor:'#818cf8', animation:'blink 1s infinite', fontWeight:300 }}>_</span>
            </span>
          </h1>
        </div>

        <p style={{ opacity:heroVisible?1:0, transform:heroVisible?'none':'translateY(20px)', transition:'all 0.9s ease 0.45s', fontSize:18, color:'rgba(255,255,255,0.3)', maxWidth:480, margin:'0 auto 52px', lineHeight:1.9, fontWeight:400 }}>
          15 modules. One platform. Built exclusively for modern IT companies that move fast and scale smart.
        </p>

        <div style={{ opacity:heroVisible?1:0, transform:heroVisible?'none':'translateY(20px)', transition:'all 0.9s ease 0.55s', display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:72 }}>
          <button className="cta-primary" onClick={() => navigate('/login')}
            style={{ padding:'18px 48px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:18, fontSize:17, fontWeight:800, cursor:'pointer', fontFamily:"'Plus Jakarta Sans'", letterSpacing:'-0.5px', boxShadow:'0 10px 40px rgba(99,102,241,0.4)' }}>
            Start Free Today →
          </button>
          <button className="cta-ghost" onClick={() => scrollTo('features')}
            style={{ padding:'18px 48px', background:'rgba(255,255,255,0.02)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, fontSize:17, fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans'" }}>
            See Features ↓
          </button>
        </div>

        {/* STATS */}
        <div style={{ opacity:heroVisible?1:0, transition:'all 1s ease 0.7s', display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
          {stats.map(({ val, label, icon }, i) => (
            <div key={label} className="stat-box"
              style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:18, padding:'16px 24px', backdropFilter:'blur(20px)', animation:`float ${4+i*0.6}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }}>
              <span style={{ display:'flex', alignItems:'center' }}>{icon}</span>
              <div>
                <div style={{ fontSize:28, fontWeight:900, background:'linear-gradient(135deg,#f1f5f9,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', fontFamily:'Fira Code', letterSpacing:'1.5px', marginTop:3 }}>{label.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:56, opacity:heroVisible?0.35:0, transition:'opacity 1.2s ease 1s' }}>
          <div style={{ width:24, height:40, border:'1.5px solid rgba(99,102,241,0.3)', borderRadius:12, margin:'0 auto', display:'flex', justifyContent:'center', paddingTop:5, animation:'float 2s ease-in-out infinite' }}>
            <div style={{ width:3, height:7, background:'linear-gradient(to bottom, #6366f1, transparent)', borderRadius:2, animation:'float 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding:'120px 60px', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:72, animation:'revealUp 0.9s ease both' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:24, padding:'5px 18px', fontSize:10, color:'#818cf8', fontWeight:700, fontFamily:'Fira Code', letterSpacing:'3px', marginBottom:20 }}>
              ◆ ABOUT TECHEMS
            </div>
            <h2 style={{ fontSize:'clamp(32px,5vw,54px)', fontWeight:900, letterSpacing:'-2.5px', marginBottom:20 }}>
              Built for <span style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>IT Companies</span>,<br />by IT People
            </h2>
            <p style={{ color:'rgba(255,255,255,0.28)', fontSize:16, maxWidth:540, margin:'0 auto', lineHeight:1.9 }}>
              We didn't build a generic HR tool. We built exactly what IT companies need — every module, every feature, every workflow.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:18 }}>
            {aboutItems.map(({ icon, title, desc, border, glow }) => (
              <div key={title} className="about-item"
                style={{ background:`linear-gradient(135deg, ${glow}, rgba(2,8,23,0.9))`, border:`1px solid ${border}`, borderRadius:24, padding:'36px 34px', backdropFilter:'blur(12px)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-30, right:-30, width:150, height:150, borderRadius:'50%', background:glow, filter:'blur(30px)', pointerEvents:'none' }} />
                <div style={{ marginBottom:20, display:'inline-flex' }}>{icon}</div>
                <h3 style={{ fontSize:20, fontWeight:800, marginBottom:12, letterSpacing:'-0.5px', color:'#f1f5f9' }}>{title}</h3>
                <p style={{ color:'rgba(255,255,255,0.35)', fontSize:14, lineHeight:1.85 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:'120px 60px', position:'relative', zIndex:1 }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.02) 50%, transparent 100%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative' }}>
          <div style={{ textAlign:'center', marginBottom:72 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:24, padding:'5px 18px', fontSize:10, color:'#818cf8', fontWeight:700, fontFamily:'Fira Code', letterSpacing:'3px', marginBottom:20 }}>
              ◆ 15+ MODULES
            </div>
            <h2 style={{ fontSize:'clamp(32px,5vw,54px)', fontWeight:900, letterSpacing:'-2.5px', marginBottom:20 }}>
              One Platform.<br /><span style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Infinite Possibilities.</span>
            </h2>
            <p style={{ color:'rgba(255,255,255,0.28)', fontSize:16 }}>Everything your IT workforce needs, beautifully unified</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {features.map(({ icon, title, desc, color, bg }, i) => (
              <div key={title} className="feat"
                onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}
                style={{ background:hoveredCard===i?`rgba(${bg},0.1)`:'rgba(8,16,30,0.8)', border:`1px solid ${hoveredCard===i?color+'60':'rgba(255,255,255,0.04)'}`, borderRadius:22, padding:28, backdropFilter:'blur(12px)', position:'relative', overflow:'hidden', boxShadow:hoveredCard===i?`0 25px 60px rgba(${bg},0.2), inset 0 1px 0 rgba(${bg},0.1)`:'none', cursor:'default' }}>
                {hoveredCard===i && <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1, background:`linear-gradient(90deg,transparent,${color},transparent)` }} />}
                <div className="feat-icon" style={{ width:52, height:52, borderRadius:16, background:`rgba(${bg},0.12)`, border:`1px solid rgba(${bg},0.2)`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18, transition:'all 0.3s', color }}>
                  {icon}
                </div>
                <h3 style={{ fontSize:15, fontWeight:800, marginBottom:10, letterSpacing:'-0.3px', color:hoveredCard===i?'#f1f5f9':'#94a3b8' }}>{title}</h3>
                <p style={{ color:'rgba(255,255,255,0.25)', fontSize:13, lineHeight:1.75 }}>{desc}</p>
                {hoveredCard===i && (
                  <div style={{ marginTop:18, display:'flex', alignItems:'center', gap:6, fontSize:12, color, fontFamily:'Fira Code', fontWeight:600 }}>
                    <span>explore</span><span style={{ animation:'float 1s ease-in-out infinite' }}>→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{ padding:'60px', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1000, margin:'0 auto', position:'relative', borderRadius:36, overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:-2, background:'linear-gradient(135deg,#6366f1,#8b5cf6,#3b82f6,#ec4899,#6366f1)', backgroundSize:'400%', animation:'gradFlow 6s linear infinite', zIndex:-1, borderRadius:38 }} />
          <div style={{ background:'linear-gradient(135deg, #08101e, #060c18)', borderRadius:34, padding:'70px 80px', textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.12),transparent)', pointerEvents:'none' }} />
            <div style={{ fontFamily:'Fira Code', fontSize:11, color:'#818cf8', letterSpacing:'3px', marginBottom:20, fontWeight:600 }}>◆ START TODAY · FREE</div>
            <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:900, letterSpacing:'-2px', marginBottom:20 }}>
              Your IT team deserves<br /><span style={{ background:'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>better tools.</span>
            </h2>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:16, marginBottom:44, lineHeight:1.8 }}>Join hundreds of IT companies managing smarter with TechEMS.</p>
            <button className="cta-primary" onClick={() => navigate('/login')}
              style={{ padding:'18px 56px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:18, fontSize:17, fontWeight:800, cursor:'pointer', fontFamily:"'Plus Jakarta Sans'", boxShadow:'0 10px 40px rgba(99,102,241,0.45)' }}>
              Get Started Free →
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding:'100px 60px 120px', maxWidth:860, margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:24, padding:'5px 18px', fontSize:10, color:'#818cf8', fontWeight:700, fontFamily:'Fira Code', letterSpacing:'3px', marginBottom:20 }}>
            ◆ CONTACT US
          </div>
          <h2 style={{ fontSize:'clamp(32px,5vw,54px)', fontWeight:900, letterSpacing:'-2.5px', marginBottom:18 }}>
            Let's <span style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Talk</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.28)', fontSize:16, lineHeight:1.9 }}>Demo requests, questions, or just want to say hi — we're always on.</p>
        </div>

        <div style={{ background:'linear-gradient(135deg,rgba(12,20,38,0.9),rgba(6,12,24,0.9))', border:'1px solid rgba(30,41,59,0.7)', borderRadius:32, padding:48, backdropFilter:'blur(24px)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.08),transparent)', pointerEvents:'none' }} />
          {contactItems.map(({ icon, label, val, sub, color }) => (
            <div key={label} className="contact-item" style={{ display:'flex', alignItems:'center', gap:20, padding:'16px 14px', marginBottom:8 }}>
              <div style={{ width:56, height:56, borderRadius:18, background:`${color}12`, border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {icon(color)}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Fira Code', fontSize:9, color:'rgba(255,255,255,0.18)', letterSpacing:'2.5px', marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.3px' }}>{val}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.22)', marginTop:2 }}>{sub}</div>
              </div>
              <div style={{ fontSize:16, color:'rgba(255,255,255,0.08)' }}>›</div>
            </div>
          ))}

          <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.15),transparent)', margin:'28px 0' }} />
          <button className="cta-primary" onClick={() => navigate('/login')}
            style={{ width:'100%', padding:'18px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:18, fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:"'Plus Jakarta Sans'", letterSpacing:'-0.3px', boxShadow:'0 10px 40px rgba(99,102,241,0.3)' }}>
            Book a Free Demo →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid rgba(12,20,38,0.8)', padding:'28px 60px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IcoBolt c="#fff" s={14} />
          </div>
          <span style={{ fontWeight:900, fontSize:15, background:'linear-gradient(135deg,#f1f5f9,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>TechEMS</span>
          <span style={{ fontFamily:'Fira Code', fontSize:11, color:'rgba(255,255,255,0.1)', marginLeft:4 }}>© 2026</span>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {['Privacy','Terms','Support','Docs','Status'].map(l => (
            <button key={l} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.18)', fontSize:12, cursor:'pointer', padding:'6px 12px', borderRadius:8, fontFamily:"'Plus Jakarta Sans'", transition:'all 0.2s' }}
              onMouseEnter={e => { e.target.style.color='#818cf8'; e.target.style.background='rgba(99,102,241,0.08)'; }}
              onMouseLeave={e => { e.target.style.color='rgba(255,255,255,0.18)'; e.target.style.background='none'; }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'Fira Code', fontSize:10, color:'rgba(16,185,129,0.5)' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px #10b981', display:'inline-block', animation:'blink 2s infinite' }} />
          ALL SYSTEMS OPERATIONAL
        </div>
      </footer>
    </div>
  );
}