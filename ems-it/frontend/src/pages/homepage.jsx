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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const words = ['IT Teams', 'HR Ops', 'Workforce', 'IT Company'];

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 200);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [], animId;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      stars = Array.from({ length: 150 }, () => ({
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
      stars.forEach(s => {
        s.pz = s.z;
        s.z -= 2;
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
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!heroVisible) return;
    let i = 0, del = false, cur = words[wordIdx];
    const t = setInterval(() => {
      if (!del) { setTypedText(cur.slice(0, ++i)); if (i >= cur.length) { del = true; } }
      else { setTypedText(cur.slice(0, --i)); if (i <= 0) { del = false; setWordIdx(p => (p + 1) % words.length); clearInterval(t); } }
    }, del ? 30 : 110);
    return () => clearInterval(t);
  }, [heroVisible, wordIdx]);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  const IcoBolt = ({ c='#818cf8', s=22 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  const IcoUsers = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  const IcoDollar = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  const IcoCalendar = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
  const IcoClock = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  const IcoStar = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  const IcoCheck = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
  const IcoMonitor = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
  const IcoGradCap = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
  const IcoChat = ({ c='currentColor', s=26 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  const IcoGrid = ({ c='#818cf8', s=22 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  const IcoBuilding = ({ c='#818cf8', s=22 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  const IcoShield = ({ c='#818cf8', s=22 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  const IcoMail = ({ c='currentColor', s=24 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const IcoPhone = ({ c='currentColor', s=24 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.44 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>;
  const IcoPin = ({ c='currentColor', s=24 }) => <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

  const features = [
    { icon: <IcoUsers />, title: 'Employee Hub', desc: 'Profiles, org charts & role-based access', color: '#6366f1', bg: '99,102,241' },
    { icon: <IcoDollar />, title: 'Payroll Engine', desc: 'Automated salary runs & instant payslips', color: '#8b5cf6', bg: '139,92,246' },
    { icon: <IcoCalendar />, title: 'Leave Portal', desc: 'One-click leave requests with approvals', color: '#3b82f6', bg: '59,130,246' },
    { icon: <IcoClock />, title: 'Attendance AI', desc: 'Real-time tracking with analytics', color: '#06b6d4', bg: '6,182,212' },
    { icon: <IcoStar />, title: 'Performance 360', desc: 'Peer reviews, OKRs and growth tracking', color: '#f59e0b', bg: '245,158,11' },
    { icon: <IcoCheck />, title: 'Project Control', desc: 'Milestones, assignments & velocity', color: '#ef4444', bg: '239,68,68' },
    { icon: <IcoMonitor />, title: 'Asset Registry', desc: 'Device assignments & audit trail', color: '#10b981', bg: '16,185,129' },
    { icon: <IcoGradCap />, title: 'Learning Hub', desc: 'Course scheduling & skill assessments', color: '#ec4899', bg: '236,72,153' },
    { icon: <IcoChat />, title: 'Pulse Feedback', desc: 'Anonymous feedback with sentiment', color: '#a78bfa', bg: '167,139,250' },
  ];

  const stats = [
    { val: '15+', label: 'Modules', icon: <IcoGrid /> },
    { val: '99.9%', label: 'Uptime', icon: <IcoBolt /> },
    { val: '1K+', label: 'Companies', icon: <IcoBuilding /> },
    { val: '24/7', label: 'Support', icon: <IcoShield /> },
  ];

  const contactItems = [
    { icon: (c) => <IcoMail c={c} />, label: 'EMAIL', val: 'support@techems.com', sub: 'Reply within 2 hours', color: '#6366f1' },
    { icon: (c) => <IcoPhone c={c} />, label: 'PHONE', val: '+91 98765 43210', sub: 'Mon–Sat · 9AM to 8PM IST', color: '#8b5cf6' },
    { icon: (c) => <IcoPin c={c} />, label: 'LOCATION', val: 'Chennai, Tamil Nadu', sub: 'India — Global HQ', color: '#3b82f6' },
    { icon: (c) => <IcoChat c={c} />, label: 'LIVE CHAT', val: 'Available 24/7', sub: 'Average response: 90 seconds', color: '#10b981' },
  ];

  const px = isMobile ? '1.25rem' : '60px';

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#020817', color: '#f1f5f9', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes gradFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes revealUp { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
        .cta-primary { transition: all 0.3s ease !important; }
        .cta-primary:hover { transform: translateY(-3px) !important; box-shadow: 0 20px 50px rgba(99,102,241,0.5) !important; }
        .cta-ghost:hover { background: rgba(99,102,241,0.1) !important; border-color: rgba(99,102,241,0.5) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #6366f1, #8b5cf6); border-radius: 2px; }
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: isMobile ? 'calc(100% - 24px)' : 'auto', minWidth: isMobile ? 'auto' : 640 }}>
        <div style={{ background: scrollY > 50 ? 'rgba(2,8,23,0.95)' : 'rgba(2,8,23,0.7)', backdropFilter: 'blur(20px)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.15)', padding: isMobile ? '10px 16px' : '0 20px', height: isMobile ? 'auto' : 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => scrollTo('home')}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IcoBolt c="#fff" s={16} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 16, background: 'linear-gradient(135deg,#f1f5f9,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TechEMS</span>
          </div>

          {/* Desktop nav */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: 2 }}>
              {['home', 'about', 'features', 'contact'].map(s => (
                <button key={s} onClick={() => scrollTo(s)} style={{ background: 'none', border: 'none', color: activeNav === s ? '#f1f5f9' : '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 16px', borderRadius: 10, textTransform: 'capitalize', fontFamily: "'Plus Jakarta Sans'" }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Desktop buttons / Mobile hamburger */}
          {!isMobile ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="cta-ghost" onClick={() => navigate('/login')} style={{ padding: '7px 18px', background: 'transparent', color: '#475569', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans'" }}>Sign In</button>
              <button className="cta-primary" onClick={() => navigate('/login')} style={{ padding: '7px 18px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans'" }}>Get Started →</button>
            </div>
          ) : (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f1f5f9', padding: 4, display: 'flex', alignItems: 'center' }}>
              {menuOpen
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          )}
        </div>

        {/* Mobile menu dropdown */}
        {isMobile && menuOpen && (
          <div style={{ background: 'rgba(2,8,23,0.97)', backdropFilter: 'blur(20px)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)', marginTop: 8, padding: '12px 8px' }}>
            {['home', 'about', 'features', 'contact'].map(s => (
              <button key={s} onClick={() => scrollTo(s)} style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: activeNav === s ? '#818cf8' : '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '12px 16px', borderRadius: 10, textAlign: 'left', textTransform: 'capitalize', fontFamily: "'Plus Jakarta Sans'" }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <div style={{ borderTop: '1px solid rgba(99,102,241,0.1)', marginTop: 8, paddingTop: 8, display: 'flex', gap: 8, padding: '8px 8px 0' }}>
              <button onClick={() => navigate('/login')} style={{ flex: 1, padding: '10px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Sign In</button>
              <button onClick={() => navigate('/login')} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Get Started →</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: isMobile ? '100px 1.25rem 60px' : '140px 40px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(20px)', transition: 'all 0.8s ease', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(2,8,23,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 30, padding: '6px 16px', marginBottom: 28, backdropFilter: 'blur(20px)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'blink 1.5s infinite' }} />
          <span style={{ fontSize: 10, color: '#34d399', fontWeight: 600, letterSpacing: '1.5px' }}>LIVE PLATFORM</span>
          <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>v2.0 · IT WORKFORCE</span>
        </div>

        <div style={{ opacity: heroVisible ? 1 : 0, transition: 'all 1s ease 0.2s' }}>
          <h1 style={{ fontSize: isMobile ? '2.8rem' : 'clamp(48px,9vw,96px)', fontWeight: 900, lineHeight: 1, letterSpacing: isMobile ? '-2px' : '-4px', marginBottom: 24 }}>
            <span style={{ display: 'block', color: 'rgba(255,255,255,0.9)' }}>The Smarter</span>
            <span style={{ display: 'block', color: 'rgba(255,255,255,0.9)' }}>Way to Run</span>
            <span style={{ display: 'inline-block', background: 'linear-gradient(135deg,#818cf8,#6366f1,#a78bfa)', backgroundSize: '300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradFlow 5s ease infinite', minWidth: isMobile ? 160 : 220 }}>
              {typedText}<span style={{ WebkitTextFillColor: '#818cf8', animation: 'blink 1s infinite' }}>_</span>
            </span>
          </h1>
        </div>

        <p style={{ opacity: heroVisible ? 1 : 0, transition: 'all 0.9s ease 0.4s', fontSize: isMobile ? 15 : 18, color: 'rgba(255,255,255,0.3)', maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.9 }}>
          15 modules. One platform. Built exclusively for modern IT companies that move fast and scale smart.
        </p>

        <div style={{ opacity: heroVisible ? 1 : 0, transition: 'all 0.9s ease 0.5s', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <button className="cta-primary" onClick={() => navigate('/login')} style={{ padding: isMobile ? '14px 32px' : '16px 44px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 16, fontSize: isMobile ? 15 : 17, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 40px rgba(99,102,241,0.4)' }}>
            Start Free Today →
          </button>
          <button className="cta-ghost" onClick={() => scrollTo('features')} style={{ padding: isMobile ? '14px 32px' : '16px 44px', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, fontSize: isMobile ? 15 : 17, fontWeight: 600, cursor: 'pointer' }}>
            See Features ↓
          </button>
        </div>

        {/* Stats */}
        <div style={{ opacity: heroVisible ? 1 : 0, transition: 'all 1s ease 0.7s', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,auto)', gap: 10, justifyContent: 'center', width: '100%', maxWidth: 600 }}>
          {stats.map(({ val, label, icon }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '14px 18px', backdropFilter: 'blur(20px)' }}>
              <span>{icon}</span>
              <div>
                <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, background: 'linear-gradient(135deg,#f1f5f9,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '1.5px', marginTop: 2 }}>{label.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: isMobile ? '60px 1.25rem' : '100px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 24, padding: '5px 16px', fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: '3px', marginBottom: 16 }}>◆ ABOUT TECHEMS</div>
            <h2 style={{ fontSize: isMobile ? '1.8rem' : 'clamp(32px,5vw,54px)', fontWeight: 900, letterSpacing: '-2px', marginBottom: 16 }}>
              Built for <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IT Companies</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 15, maxWidth: 500, margin: '0 auto', lineHeight: 1.9 }}>We didn't build a generic HR tool. We built exactly what IT companies need.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 16 }}>
            {[
              { icon: '🎯', title: 'Laser-Focused Mission', desc: 'Simplify every HR operation for IT teams. Cut admin time by 70%, reduce payroll errors to zero.', border: 'rgba(99,102,241,0.25)' },
              { icon: '🔭', title: 'Long-Term Vision', desc: 'Every IT company on the planet, managed on TechEMS. Building the infrastructure layer for modern tech workforce.', border: 'rgba(139,92,246,0.25)' },
              { icon: '⚡', title: 'Performance Obsessed', desc: 'React + Node.js + MongoDB. Sub-100ms API responses. Real-time everything. Built for teams that can\'t afford slowness.', border: 'rgba(59,130,246,0.25)' },
              { icon: '🔒', title: 'Security First', desc: 'JWT auth, bcrypt hashing, RBAC, rate limiting, and audit logs. Enterprise-grade security, startup-friendly pricing.', border: 'rgba(16,185,129,0.25)' },
            ].map(({ icon, title, desc, border }) => (
              <div key={title} style={{ background: 'rgba(8,16,30,0.8)', border: `1px solid ${border}`, borderRadius: 20, padding: '28px 24px', backdropFilter: 'blur(12px)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#f1f5f9' }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, lineHeight: 1.8 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: isMobile ? '60px 1.25rem' : '100px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 24, padding: '5px 16px', fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: '3px', marginBottom: 16 }}>◆ 15+ MODULES</div>
            <h2 style={{ fontSize: isMobile ? '1.8rem' : 'clamp(32px,5vw,54px)', fontWeight: 900, letterSpacing: '-2px', marginBottom: 16 }}>
              One Platform. <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Infinite Possibilities.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 12 }}>
            {features.map(({ icon, title, desc, color, bg }, i) => (
              <div key={title} onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}
                style={{ background: hoveredCard === i ? `rgba(${bg},0.1)` : 'rgba(8,16,30,0.8)', border: `1px solid ${hoveredCard === i ? color + '60' : 'rgba(255,255,255,0.04)'}`, borderRadius: 18, padding: isMobile ? '18px 14px' : '24px 20px', backdropFilter: 'blur(12px)', transition: 'all 0.3s ease', cursor: 'default' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `rgba(${bg},0.12)`, border: `1px solid rgba(${bg},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, marginBottom: 8, color: '#94a3b8' }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: isMobile ? 12 : 13, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? '40px 1.25rem' : '60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', background: 'linear-gradient(135deg, #08101e, #060c18)', borderRadius: 28, padding: isMobile ? '40px 24px' : '60px 80px', textAlign: 'center', border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontSize: isMobile ? '1.6rem' : 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-2px', marginBottom: 16 }}>
            Your IT team deserves <span style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>better tools.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15, marginBottom: 32, lineHeight: 1.8 }}>Join hundreds of IT companies managing smarter with TechEMS.</p>
          <button className="cta-primary" onClick={() => navigate('/login')} style={{ padding: '16px 48px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 40px rgba(99,102,241,0.4)' }}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: isMobile ? '60px 1.25rem 80px' : '80px 60px 100px', maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: isMobile ? '1.8rem' : 'clamp(32px,5vw,54px)', fontWeight: 900, letterSpacing: '-2px', marginBottom: 14 }}>
            Let's <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Talk</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 15 }}>Demo requests, questions, or just want to say hi — we're always on.</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg,rgba(12,20,38,0.9),rgba(6,12,24,0.9))', border: '1px solid rgba(30,41,59,0.7)', borderRadius: 24, padding: isMobile ? '24px 20px' : '40px', backdropFilter: 'blur(24px)' }}>
          {contactItems.map(({ icon, label, val, sub, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 12px', marginBottom: 8, borderRadius: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${color}12`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon(color)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '2.5px', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>{sub}</div>
              </div>
            </div>
          ))}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.15),transparent)', margin: '20px 0' }} />
          <button className="cta-primary" onClick={() => navigate('/login')} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 40px rgba(99,102,241,0.3)' }}>
            Book a Free Demo →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(12,20,38,0.8)', padding: isMobile ? '20px 1.25rem' : '24px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcoBolt c="#fff" s={13} />
          </div>
          <span style={{ fontWeight: 900, fontSize: 14, background: 'linear-gradient(135deg,#f1f5f9,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TechEMS</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.1)' }}>© 2026</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(16,185,129,0.5)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'blink 2s infinite' }} />
          ALL SYSTEMS OPERATIONAL
        </div>
      </footer>
    </div>
  );
}