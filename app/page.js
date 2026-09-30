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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :root{
          --vl-slate:#1e293b; --vl-slate-soft:#64748B; --vl-line:#E2E8F0; --vl-paper:#F8FAFC;
          --vl-emerald:#059669; --vl-emerald-soft:#D1FAE5; --vl-sun:#facc15; --vl-sun-dark:#EAB308;
          --vl-font-body:'Inter',-apple-system,sans-serif; --vl-font-head:'Plus Jakarta Sans','Inter',sans-serif;
        }
        .vl-page{ min-height:100vh; background:var(--vl-paper); color:var(--vl-slate); font-family:var(--vl-font-body); -webkit-font-smoothing:antialiased; }

        .vl-header{ background:#fff; border-bottom:1px solid var(--vl-line); padding:18px 32px; display:flex; align-items:center; justify-content:space-between; }
        .vl-brand{ display:flex; align-items:center; gap:9px; font-family:var(--vl-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; text-decoration:none; color:var(--vl-slate); }
        .vl-dots{ display:flex; gap:4px; }
        .vl-dot{ width:9px; height:9px; border-radius:50%; }
        .vl-nav a{ font-size:13.5px; font-weight:600; color:var(--vl-slate-soft); text-decoration:none; }
        .vl-nav a:hover{ color:var(--vl-slate); }

        .vl-wrap{ display:flex; justify-content:center; padding:70px 20px; }
        .vl-card{ width:100%; max-width:400px; }

        .vl-icon-badge{
          width:44px; height:44px; border-radius:12px; background:var(--vl-emerald-soft); display:flex;
          align-items:center; justify-content:center; margin-bottom:18px;
        }
        .vl-title{ font-family:var(--vl-font-head); font-size:24px; font-weight:800; letter-spacing:-0.01em; margin:0 0 6px; }
        .vl-sub{ font-size:14px; color:var(--vl-slate-soft); line-height:1.6; margin-bottom:28px; }

        .vl-field{ margin-bottom:16px; }
        .vl-label{ display:block; font-size:12.5px; font-weight:700; color:var(--vl-slate); margin-bottom:6px; }
        .vl-input{ width:100%; padding:12px 14px; border:1px solid var(--vl-line); border-radius:9px; font-size:14px; font-family:var(--vl-font-body); background:#fff; color:var(--vl-slate); }
        .vl-input:focus{ outline:2px solid var(--vl-emerald); outline-offset:1px; border-color:transparent; }

        .vl-error{ font-size:13px; color:#DC2626; font-weight:600; background:#FEE2E2; padding:10px 12px; border-radius:8px; margin-bottom:16px; }

        .vl-submit{
          width:100%; padding:13px; border-radius:9px; background:var(--vl-slate); color:#fff; border:none;
          font-family:var(--vl-font-body); font-weight:700; font-size:14.5px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .vl-submit:hover{ background:#0f172a; }
        .vl-submit:disabled{ opacity:0.6; cursor:default; }

        .vl-footnote{
          margin-top:22px; font-size:12.5px; color:var(--vl-slate-soft); line-height:1.6;
          background:#fff; border:1px solid var(--vl-line); border-radius:10px; padding:14px 16px;
        }
        .vl-footnote strong{ color:var(--vl-slate); }
        .vl-apply-link{ margin-top:18px; text-align:center; font-size:13.5px; color:var(--vl-slate-soft); }
        .vl-apply-link a{ color:var(--vl-emerald); font-weight:700; text-decoration:none; }
        .vl-apply-link a:hover{ text-decoration:underline; }

        @media (max-width:640px){
          .vl-header{ padding:16px 20px; }
          .vl-wrap{ padding:44px 20px; }
        }
      `}</style>

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

      <div className="vl-wrap">
        <div className="vl-card">
          <div className="vl-icon-badge">
            <ShieldCheck size={22} color="#059669" />
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
  );
}
