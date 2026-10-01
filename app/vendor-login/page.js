'use client';
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
 
export default function VendorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
 
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
 
    setLoading(true);
    // TODO: replace with real Supabase auth:
    // const { error } = await sb.auth.signInWithPassword({ email, password });
    // Then check the vendors table for status === 'approved' before allowing access.
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/vendor-dashboard';
    }, 600);
  };
 
  return (
    <div className="vl-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap');
 
        :root{
          --vl-font-body:'Inter',-apple-system,sans-serif; --vl-font-head:'Space Grotesk','Inter',sans-serif;
        }
        .vl-page{ min-height:100vh; background:#1e293b; color:#fff; font-family:var(--vl-font-body); -webkit-font-smoothing:antialiased; position:relative; overflow-x:hidden; }
        .vl-glow{
          position:fixed; inset:-10%;
          background:
            radial-gradient(circle at 15% 20%, rgba(5,150,105,0.22), transparent 45%),
            radial-gradient(circle at 85% 15%, rgba(250,204,21,0.14), transparent 45%);
          filter:blur(60px); z-index:0; pointer-events:none;
        }
        .vl-wrap{ position:relative; z-index:1; }
 
        .vl-header{ border-bottom:1px solid rgba(255,255,255,0.08); padding:18px 32px; display:flex; align-items:center; justify-content:space-between; }
        .vl-brand{ display:flex; align-items:center; gap:9px; font-family:var(--vl-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; text-decoration:none; color:#fff; }
        .vl-dots{ display:flex; gap:4px; }
        .vl-dot{ width:9px; height:9px; border-radius:50%; }
        .vl-nav a{ font-size:13.5px; font-weight:600; color:#94A3B8; text-decoration:none; }
        .vl-nav a:hover{ color:#fff; }
 
        .vl-content-wrap{ display:flex; justify-content:center; padding:70px 20px; }
        .vl-card{ width:100%; max-width:400px; }
 
        .vl-icon-badge{
          width:44px; height:44px; border-radius:12px; background:rgba(5,150,105,0.15); display:flex;
          align-items:center; justify-content:center; margin-bottom:18px;
        }
        .vl-title{ font-family:var(--vl-font-head); font-size:24px; font-weight:800; letter-spacing:-0.01em; margin:0 0 6px; color:#fff; }
        .vl-sub{ font-size:14px; color:#94A3B8; line-height:1.6; margin-bottom:28px; }
 
        .vl-field{ margin-bottom:16px; }
        .vl-label{ display:block; font-size:12.5px; font-weight:700; color:#CBD5E1; margin-bottom:6px; }
        .vl-input{ width:100%; padding:12px 14px; border:1px solid rgba(255,255,255,0.18); border-radius:9px; font-size:14px; font-family:var(--vl-font-body); background:rgba(255,255,255,0.06); color:#fff; }
        .vl-input::placeholder{ color:#64748B; }
        .vl-input:focus{ outline:2px solid #facc15; outline-offset:1px; border-color:transparent; }
 
        .vl-error{ font-size:13px; color:#FCA5A5; font-weight:600; background:rgba(239,68,68,0.12); padding:10px 12px; border-radius:8px; margin-bottom:16px; }
 
        .vl-submit{
          width:100%; padding:13px; border-radius:9px; background:#facc15; color:#1e293b; border:none;
          font-family:var(--vl-font-body); font-weight:700; font-size:14.5px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .vl-submit:hover{ background:#eab308; }
        .vl-submit:disabled{ opacity:0.6; cursor:default; }
 
        .vl-footnote{
          margin-top:22px; font-size:12.5px; color:#94A3B8; line-height:1.6;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px 16px;
        }
        .vl-footnote strong{ color:#fff; }
        .vl-apply-link{ margin-top:18px; text-align:center; font-size:13.5px; color:#94A3B8; }
        .vl-apply-link a{ color:#6EE7B7; font-weight:700; text-decoration:none; }
        .vl-apply-link a:hover{ text-decoration:underline; }
 
        @media (max-width:640px){
          .vl-header{ padding:16px 20px; }
          .vl-content-wrap{ padding:44px 20px; }
        }
      `}</style>
 
      <div className="vl-glow" />
      <div className="vl-wrap">
        <header className="vl-header">
          <a href="/" className="vl-brand">
            <span className="vl-dots">
              <span className="vl-dot" style={{ background: '#facc15' }} />
              <span className="vl-dot" style={{ background: '#fbbf24' }} />
              <span className="vl-dot" style={{ background: '#059669' }} />
            </span>
            SolarHues
          </a>
          <nav className="vl-nav">
            <a href="/">Home</a>
          </nav>
        </header>
 
        <div className="vl-content-wrap">
          <div className="vl-card">
            <div className="vl-icon-badge">
              <ShieldCheck size={22} color="#6EE7B7" />
            </div>
            <h1 className="vl-title">Vendor login</h1>
            <p className="vl-sub">Access your leads, site visits, proposals, and active projects.</p>
 
            <form onSubmit={handleLogin}>
              <div className="vl-field">
                <label className="vl-label">Registered email</label>
                <input
                  type="email"
                  className="vl-input"
                  placeholder="ops@yourcompany.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="vl-field">
                <label className="vl-label">Password</label>
                <input
                  type="password"
                  className="vl-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
 
              {error && <div className="vl-error">{error}</div>}
 
              <button type="submit" className="vl-submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Log in'} <ArrowRight size={16} />
              </button>
            </form>
 
            <div className="vl-footnote">
              <strong>Approved vendors only.</strong> Access is granted after SolarHues verifies your GST
              certificate, incorporation certificate, and owner ID documents.
            </div>
 
            <div className="vl-apply-link">
              Not a partner yet? <a href="/vendor-apply">Apply to join</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
