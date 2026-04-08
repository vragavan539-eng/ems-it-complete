import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FaceScanner from '../components/facescanner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const canvasRef = useRef(null);
  const [isReg, setIsReg] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'employee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [faceMsg, setFaceMsg] = useState('');

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; createParticles(); };
    const createParticles = () => {
      const count = Math.floor((W * H) / 14000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 2.5, a: 0.15 + Math.random() * 0.6,
        color: ['99,102,241','139,92,246','59,130,246','236,72,153'][Math.floor(Math.random()*4)]
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const { x: mx, y: my } = mouseRef.current;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 130) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(99,102,241,${0.06*(1-dist/130)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
        }
        const mdx = mx - particles[i].x, mdy = my - particles[i].y; const md = Math.sqrt(mdx*mdx + mdy*mdy);
        if (md < 180) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mx, my); ctx.strokeStyle = `rgba(139,92,246,${0.12*(1-md/180)})`; ctx.lineWidth=0.6; ctx.stroke(); }
        const p = particles[i]; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fillStyle = `rgba(${p.color},${p.a})`; ctx.fill();
        p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      animId = requestAnimationFrame(draw);
    };
    const onMouseMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMouseMove); window.addEventListener('resize', resize);
    resize(); draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('resize', resize); };
  }, []);

  const handle = async () => {
    setError('');
    if (!form.email || !form.password) return setError('Please fill in all required fields');
    if (isReg && !form.name) return setError('Please enter your full name');
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/auth/${isReg ? 'register' : 'login'}`;
      const body = isReg ? form : { email: form.email, password: form.password };
      const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data.user, data.token);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 900);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleFaceLogin = async (descriptor) => {
    setFaceMsg('⏳ Verifying face...');
    try {
      const res = await fetch('http://localhost:5000/api/face/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor })
      });
      const data = await res.json();
      if (data.matched) {
        setFaceMsg(`✅ Welcome, ${data.employee.name}!`);
        login(data.employee, data.token);  // ✅
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setFaceMsg('❌ Face not recognized! Use email login.');
      }
    } catch (err) { setFaceMsg('❌ Error: ' + err.message); }
  };

  const MODS = ['employees','payroll','leave','attendance','performance','projects','assets','training','helpdesk','reports','roles','documents'];

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Fira+Code:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .mod:hover{color:#a78bfa!important;border-color:rgba(124,58,237,0.5)!important;background:rgba(124,58,237,0.12)!important;transform:translateY(-2px)!important;box-shadow:0 4px 12px rgba(124,58,237,0.2)!important}
        .inp{width:100%;padding:13px 16px;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.08);border-radius:14px;font-size:14px;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.3s;outline:none}
        .inp:focus{border-color:rgba(99,102,241,0.6)!important;background:rgba(99,102,241,0.06)!important;box-shadow:0 0 0 4px rgba(99,102,241,0.12)!important}
        .inp::placeholder{color:rgba(255,255,255,0.2)}
        .sbtn{transition:all 0.3s cubic-bezier(0.16,1,0.3,1)!important}
        .sbtn:hover{transform:translateY(-3px)!important;box-shadow:0 20px 50px rgba(99,102,241,0.5)!important}
        .sbtn:active{transform:translateY(-1px)!important}
        .face-btn:hover{background:rgba(139,92,246,0.15)!important;border-color:rgba(139,92,246,0.5)!important;transform:translateY(-2px)!important}
        .back-btn:hover{background:rgba(255,255,255,0.08)!important;color:#f1f5f9!important}
        .tab-btn{transition:all 0.3s ease}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(40px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes iconPulse{0%,100%{box-shadow:0 0 30px rgba(99,102,241,0.5)}50%{box-shadow:0 0 60px rgba(99,102,241,0.9),0 0 100px rgba(139,92,246,0.3)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes successPop{0%{transform:scale(0.8);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        .a1{opacity:0;animation:slideUp 0.9s 0.1s cubic-bezier(0.16,1,0.3,1) forwards}
        .a2{opacity:0;animation:slideUp 0.9s 0.25s cubic-bezier(0.16,1,0.3,1) forwards}
        .a3{opacity:0;animation:slideUp 0.9s 0.35s cubic-bezier(0.16,1,0.3,1) forwards}
        .a4{opacity:0;animation:slideUp 0.9s 0.45s cubic-bezier(0.16,1,0.3,1) forwards}
        .a5{opacity:0;animation:slideUp 0.9s 0.55s cubic-bezier(0.16,1,0.3,1) forwards}
        .a6{opacity:0;animation:slideUp 0.9s 0.65s cubic-bezier(0.16,1,0.3,1) forwards}
        .card-anim{opacity:0;animation:cardIn 1.1s 0.2s cubic-bezier(0.16,1,0.3,1) forwards}
        .glow-ring{position:absolute;border-radius:50%;border:1px solid rgba(99,102,241,0.15);animation:float 6s ease-in-out infinite}
        .face-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:center;justify-content:center}
        .face-modal{background:linear-gradient(135deg,#0f172a,#1e1b4b);border:1px solid rgba(99,102,241,0.3);border-radius:24px;padding:32px;width:420px;text-align:center;box-shadow:0 40px 100px rgba(0,0,0,0.8)}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0 }} />

      <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', overflow:'hidden' }}>
        <div className="glow-ring" style={{ width:400, height:400, top:'10%', left:'5%', animationDelay:'0s' }} />
        <div className="glow-ring" style={{ width:250, height:250, top:'60%', left:'2%', animationDelay:'2s' }} />
        <div className="glow-ring" style={{ width:180, height:180, top:'30%', left:'20%', animationDelay:'1s', borderColor:'rgba(139,92,246,0.1)' }} />
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)', top:-100, left:-100 }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 60%)', bottom:0, left:'30%' }} />
      </div>

      <div style={s.wrap}>
        <div style={s.left}>
          <button className="back-btn" onClick={() => navigate('/')}
            style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'8px 16px', color:'rgba(255,255,255,0.5)', fontSize:13, cursor:'pointer', marginBottom:48, alignSelf:'flex-start', transition:'all 0.2s', fontFamily:"'Plus Jakarta Sans'" }}>
            ← Back to Home
          </button>
          <div className="a1" style={s.logoRow}>
            <div style={s.logoIcon}>⚡</div>
            <span style={s.logoName}>TechEMS</span>
            <span style={s.liveBadge}><span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'blink 1.5s infinite' }} />LIVE</span>
          </div>
          <div className="a2" style={s.eyebrow}><span style={s.eyeLine} />IT WORKFORCE PLATFORM<span style={s.eyeLine} /></div>
          <div className="a3" style={s.headline}>
            <span style={{ display:'block', color:'rgba(255,255,255,0.92)' }}>The Smarter</span>
            <span style={{ display:'block', color:'rgba(255,255,255,0.92)' }}>Way to Run</span>
            <span style={{ display:'block', background:'linear-gradient(135deg,#818cf8,#6366f1,#8b5cf6,#a78bfa)', backgroundSize:'200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'gradShift 4s linear infinite' }}>Your IT Team</span>
          </div>
          <p className="a4" style={s.desc}>15 modules. One platform. Built exclusively for modern IT companies that move fast and scale smart.</p>
          <div className="a5" style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:52 }}>
            {MODS.map(m => <span key={m} className="mod" style={s.mod}>{m}</span>)}
          </div>
          <div className="a6" style={{ display:'flex', gap:0 }}>
            {[['15+','MODULES'],['∞','EMPLOYEES'],['24/7','UPTIME']].map(([n,l], i) => (
              <div key={l} style={{ paddingRight:28, marginRight:28, borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div style={{ fontSize:30, fontWeight:900, background:'linear-gradient(135deg,#818cf8,#6366f1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:5, fontFamily:'Fira Code', letterSpacing:'2px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.right}>
          <div className="card-anim" style={s.card}>
            <div style={{ position:'absolute', top:-1, left:'20%', right:'20%', height:1, background:'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)', borderRadius:1 }} />
            <div style={s.tabs}>
              {['Sign In','Create Account'].map((t,i) => (
                <button key={t} className="tab-btn" onClick={() => { setIsReg(i===1); setError(''); }}
                  style={{ ...s.tab, ...(isReg===(i===1) ? s.tabOn : {}) }}>{t}</button>
              ))}
            </div>
            <div style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.5px', marginBottom:6, color:'#f1f5f9' }}>{isReg ? '✨ Create your account' : '👋 Welcome back'}</h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.28)', lineHeight:1.6 }}>{isReg ? 'Join your team workspace today' : 'Access your workspace securely'}</p>
            </div>
            {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5', padding:'12px 16px', borderRadius:12, fontSize:12, fontFamily:'Fira Code', marginBottom:16, animation:'shake 0.4s ease', display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:14 }}>⚠️</span> {error}</div>}
            {success && <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7', padding:'12px 16px', borderRadius:12, fontSize:13, marginBottom:16, animation:'successPop 0.5s ease', display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:16 }}>✅</span> Access granted! Redirecting...</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {isReg && <div><label style={s.lbl}>Full Name <code style={s.code}>// required</code></label><input className="inp" placeholder="John Doe" value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>}
              <div><label style={s.lbl}>Email Address <code style={s.code}>// required</code></label><input className="inp" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></div>
              <div>
                <label style={s.lbl}>Password <code style={s.code}>// required</code></label>
                <div style={{ position:'relative' }}>
                  <input className="inp" style={{ paddingRight:50 }} type={showPass?'text':'password'} placeholder="Enter your password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} onKeyDown={e => e.key==='Enter' && handle()} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:18, padding:4 }}>{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>
            </div>
            <button className="sbtn" onClick={handle} disabled={loading||success}
              style={{ width:'100%', padding:'14px', marginTop:22, color:'#fff', border:'none', borderRadius:14, fontFamily:"'Plus Jakarta Sans'", fontSize:15, fontWeight:700, cursor: loading||success ? 'not-allowed' : 'pointer', letterSpacing:'0.3px', opacity: loading ? 0.75 : 1, background: success ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: success ? '0 8px 24px rgba(16,185,129,0.3)' : '0 8px 24px rgba(99,102,241,0.25)' }}>
              {success ? '✓ Access Granted' : loading ? '⟳ Authenticating...' : isReg ? 'Create Account →' : 'Sign In →'}
            </button>

            {/* ✅ Face Login Button */}
            {!isReg && (
              <button className="face-btn" onClick={() => { setShowFaceLogin(true); setFaceMsg(''); }}
                style={{ width:'100%', padding:'13px', marginTop:10, color:'rgba(167,139,250,0.9)', border:'1.5px solid rgba(139,92,246,0.25)', borderRadius:14, background:'rgba(139,92,246,0.06)', fontFamily:"'Plus Jakarta Sans'", fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.3px', transition:'all 0.3s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                📷 Login with Face Recognition
              </button>
            )}

            <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0' }}>
              <hr style={{ flex:1, border:'none', borderTop:'1px solid rgba(255,255,255,0.06)' }} />
              <span style={{ fontFamily:'Fira Code', fontSize:11, color:'rgba(255,255,255,0.15)' }}>or</span>
              <hr style={{ flex:1, border:'none', borderTop:'1px solid rgba(255,255,255,0.06)' }} />
            </div>
            <p onClick={() => { setIsReg(!isReg); setError(''); }} style={{ textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.25)', cursor:'pointer', lineHeight:1.6 }}>
              {isReg ? 'Already have an account? ' : "Don't have an account? "}
              <span style={{ color:'#818cf8', fontWeight:700, textDecoration:'underline', textUnderlineOffset:3 }}>{isReg ? 'Sign in →' : 'Create one →'}</span>
            </p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:22, paddingTop:18, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontFamily:'Fira Code', fontSize:10, color:'rgba(255,255,255,0.1)', letterSpacing:'0.5px' }}>TechEMS v2.0 · encrypted</span>
              <span style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'Fira Code', fontSize:10, color:'rgba(16,185,129,0.5)' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'blink 2s infinite', boxShadow:'0 0 6px #10b981' }} />All systems online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Face Login Modal — autoScan ON */}
      {showFaceLogin && (
        <div className="face-overlay" onClick={e => e.target.className === 'face-overlay' && setShowFaceLogin(false)}>
          <div className="face-modal">
            <div style={{ fontSize:32, marginBottom:8 }}>🔐</div>
            <h3 style={{ color:'#f1f5f9', fontSize:18, fontWeight:800, marginBottom:6 }}>Face Login</h3>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, marginBottom:20 }}>Camera-ல முகம் வையுங்க — Automatic-ஆ login ஆகும்!</p>
            <FaceScanner
              onDetect={handleFaceLogin}
              autoScan={true}
            />
            {faceMsg && (
              <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, fontSize:13, fontWeight:600, background: faceMsg.includes('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: faceMsg.includes('✅') ? '#6ee7b7' : '#fca5a5', border: `1px solid ${faceMsg.includes('✅') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                {faceMsg}
              </div>
            )}
            <button onClick={() => setShowFaceLogin(false)} style={{ marginTop:16, background:'none', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.3)', padding:'8px 20px', borderRadius:10, cursor:'pointer', fontSize:13, fontFamily:"'Plus Jakarta Sans'" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:{ minHeight:'100vh', background:'linear-gradient(135deg, #020817 0%, #0a0f1e 50%, #050d1a 100%)', fontFamily:"'Plus Jakarta Sans',sans-serif", display:'flex', position:'relative', overflow:'hidden', color:'#fff' },
  wrap:{ position:'relative', zIndex:10, display:'flex', width:'100%', minHeight:'100vh' },
  left:{ flex:1, padding:'48px 64px', display:'flex', flexDirection:'column', justifyContent:'center', maxWidth:640 },
  logoRow:{ display:'flex', alignItems:'center', gap:14, marginBottom:52 },
  logoIcon:{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, animation:'iconPulse 3s ease-in-out infinite', flexShrink:0 },
  logoName:{ fontSize:22, fontWeight:900, letterSpacing:'-0.5px', color:'#f1f5f9' },
  liveBadge:{ display:'flex', alignItems:'center', gap:6, fontFamily:'Fira Code', fontSize:10, color:'#10b981', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', padding:'4px 12px', borderRadius:20, marginLeft:6 },
  eyebrow:{ fontFamily:'Fira Code', fontSize:11, color:'rgba(99,102,241,0.8)', letterSpacing:'3px', marginBottom:22, display:'flex', alignItems:'center', gap:12 },
  eyeLine:{ display:'inline-block', width:24, height:1, background:'rgba(99,102,241,0.4)', flexShrink:0 },
  headline:{ fontSize:56, fontWeight:900, lineHeight:1.05, letterSpacing:'-2.5px', marginBottom:20 },
  desc:{ fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.85, marginBottom:44, maxWidth:440 },
  mod:{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', padding:'5px 12px', borderRadius:8, transition:'all 0.25s', cursor:'default', fontFamily:'Fira Code', letterSpacing:'0.5px' },
  right:{ width:540, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 48px 40px 20px' },
  card:{ width:'100%', maxWidth:440, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:28, padding:'40px 36px', backdropFilter:'blur(40px)', boxShadow:'0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)', position:'relative' },
  tabs:{ display:'flex', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16, padding:5, gap:4, marginBottom:30 },
  tab:{ flex:1, padding:'10px 16px', border:'none', background:'transparent', color:'rgba(255,255,255,0.3)', fontFamily:"'Plus Jakarta Sans'", fontSize:13, fontWeight:600, borderRadius:12, cursor:'pointer' },
  tabOn:{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', boxShadow:'0 4px 20px rgba(99,102,241,0.4)' },
  lbl:{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', marginBottom:8, letterSpacing:'1px', textTransform:'uppercase' },
  code:{ fontFamily:'Fira Code', fontSize:10, color:'rgba(99,102,241,0.5)', fontWeight:400, textTransform:'none', letterSpacing:0 },
};