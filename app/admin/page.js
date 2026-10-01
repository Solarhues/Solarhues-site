'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, LogOut, Users, FileCheck2, Receipt, Activity, Building2 } from 'lucide-react';
 
const SUPABASE_URL = 'https://qcnvqmomlzvlkquryreb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_heg2iW28ly1fTI5BRJ_0Cg_9lURldPF';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
 
// Sample data — swap for real Supabase queries once the schema is live and populated.
const PENDING_VENDORS = [
  { id: 1, company: 'Sunrise Rooftop Co.', owner: 'Manoj Bhat', phone: '080 4551 2200 / 98450 11223', address: 'No. 14, Industrial Layout, Peenya, Bengaluru — 560058' },
  { id: 2, company: 'Vasavi Solar Works', owner: 'K. Vasavi', phone: '040 2233 5566 / 90000 12121', address: 'Plot 7, Jubilee Hills Road No. 3, Hyderabad — 500033' },
];
const CUSTOMERS = [
  { id: 1, name: 'Anjali Rao', area: '560034, Bengaluru', size: '4.5 kW', vendor: 'Peak Energy Solutions', status: 'Installation in progress' },
  { id: 2, name: 'Deepak Menon', area: '560068, Bengaluru', size: '3.2 kW', vendor: 'EcoBright Solar', status: 'Site survey complete' },
];
const PAYMENTS = [
  { id: 1, pair: 'Anjali Rao → Peak Energy Solutions', total: '₹3,18,000', stages: [['Advance 1', 'ok'], ['Advance 2', 'ok'], ['Tranche 2', 'due'], ['Tranche 3', 'upcoming']] },
  { id: 2, pair: 'Deepak Menon → EcoBright Solar', total: '₹2,05,400', stages: [['Advance 1', 'ok'], ['Advance 2', 'due'], ['Tranche 2', 'upcoming'], ['Tranche 3', 'upcoming']] },
];
 
function StatusPill({ label, tone }) {
  const tones = {
    ok: { bg: 'rgba(5,150,105,0.18)', color: '#6EE7B7' },
    due: { bg: 'rgba(250,204,21,0.18)', color: '#FDE047' },
    upcoming: { bg: 'rgba(255,255,255,0.08)', color: '#94A3B8' },
  };
  const t = tones[tone] || tones.upcoming;
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: t.bg, color: t.color }}>
      {label}
    </span>
  );
}
 
export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState('overview');
  const [vendors, setVendors] = useState(PENDING_VENDORS);
 
  useEffect(() => {
    checkSession();
  }, []);
 
  async function checkSession() {
    setChecking(true);
    const { data: { session: s } } = await sb.auth.getSession();
    if (!s) {
      setSession(null);
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    setSession(s);
    await checkAdminRole(s.user.id);
    setChecking(false);
  }
 
  async function checkAdminRole(userId) {
    const { data, error } = await sb.from('profiles').select('role').eq('id', userId).single();
    if (error || !data || data.role !== 'admin') {
      setIsAdmin(false);
      // Not an admin — don't leave a privileged-looking session hanging around on this page.
      await sb.auth.signOut();
      setSession(null);
      return;
    }
    setIsAdmin(true);
  }
 
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!email || !password) {
      setLoginError('Enter your email and password.');
      return;
    }
    setLoggingIn(true);
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError('Login failed: ' + error.message);
      setLoggingIn(false);
      return;
    }
    await checkAdminRole(data.user.id);
    setSession(data.session);
    setLoggingIn(false);
  };
 
  const handleLogout = async () => {
    await sb.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  };
 
  const decideVendor = (id, decision) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, decided: decision } : v)));
    // TODO: update vendors.status in Supabase ('approved' / 'rejected') once wired up
  };
 
  const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'approvals', label: 'Vendor approvals', icon: FileCheck2 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Proposals & payments', icon: Receipt },
  ];
 
  return (
    <div className="ad-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap');
 
        :root{
          --ad-font-body:'Inter',-apple-system,sans-serif; --ad-font-head:'Space Grotesk','Inter',sans-serif;
        }
        .ad-page{
          min-height:100vh; background:#1e293b; color:#fff; font-family:var(--ad-font-body);
          -webkit-font-smoothing:antialiased; position:relative; overflow-x:hidden;
        }
        .ad-glow{
          position:fixed; inset:-10%;
          background:
            radial-gradient(circle at 15% 20%, rgba(5,150,105,0.25), transparent 45%),
            radial-gradient(circle at 85% 15%, rgba(250,204,21,0.15), transparent 45%);
          filter:blur(60px); z-index:0; pointer-events:none;
        }
        .ad-wrap{ position:relative; z-index:1; }
 
        .ad-header{ display:flex; align-items:center; justify-content:space-between; padding:20px 32px; border-bottom:1px solid rgba(255,255,255,0.08); }
        .ad-brand{ display:flex; align-items:center; gap:9px; font-family:var(--ad-font-head); font-weight:700; font-size:18px; letter-spacing:-0.01em; }
        .ad-dots{ display:flex; gap:4px; }
        .ad-dot{ width:9px; height:9px; border-radius:50%; }
        .ad-badge{ font-size:11px; font-weight:700; color:#94A3B8; border:1px solid rgba(255,255,255,0.15); padding:4px 10px; border-radius:20px; }
        .ad-logout{ background:rgba(239,68,68,0.1); border:1px solid #EF4444; color:#FCA5A5; font-size:12.5px; font-weight:700; padding:8px 14px; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .ad-logout:hover{ background:rgba(239,68,68,0.18); }
 
        /* login screen */
        .ad-login-wrap{ display:flex; justify-content:center; padding:80px 20px; }
        .ad-login-card{ width:100%; max-width:380px; }
        .ad-icon-badge{ width:44px; height:44px; border-radius:12px; background:rgba(5,150,105,0.15); display:flex; align-items:center; justify-content:center; margin-bottom:18px; }
        .ad-title{ font-family:var(--ad-font-head); font-size:24px; font-weight:800; margin:0 0 6px; }
        .ad-sub{ font-size:14px; color:#94A3B8; line-height:1.6; margin-bottom:26px; }
        .ad-field{ margin-bottom:16px; }
        .ad-label{ display:block; font-size:12.5px; font-weight:700; color:#CBD5E1; margin-bottom:6px; }
        .ad-input{ width:100%; padding:12px 14px; border-radius:9px; border:1px solid rgba(255,255,255,0.18); background:rgba(255,255,255,0.06); color:#fff; font-size:14px; font-family:var(--ad-font-body); }
        .ad-input:focus{ outline:2px solid #facc15; outline-offset:1px; }
        .ad-error{ font-size:13px; color:#FCA5A5; background:rgba(239,68,68,0.1); padding:10px 12px; border-radius:8px; margin-bottom:16px; font-weight:600; }
        .ad-submit{ width:100%; padding:13px; border-radius:9px; background:#facc15; color:#1e293b; border:none; font-weight:700; font-size:14.5px; cursor:pointer; font-family:var(--ad-font-body); }
        .ad-submit:hover{ background:#eab308; }
        .ad-submit:disabled{ opacity:0.6; cursor:default; }
        .ad-denied{ font-size:13px; color:#FCA5A5; background:rgba(239,68,68,0.1); padding:12px 14px; border-radius:10px; margin-top:18px; line-height:1.6; }
 
        /* dashboard */
        .ad-main{ max-width:1080px; margin:0 auto; padding:32px 32px 70px; }
        .ad-page-title{ font-family:var(--ad-font-head); font-size:24px; font-weight:800; margin:0 0 4px; }
        .ad-page-sub{ font-size:13.5px; color:#94A3B8; margin-bottom:24px; }
 
        .ad-tabs{ display:flex; gap:4px; border-bottom:1px solid rgba(255,255,255,0.1); margin-bottom:24px; overflow-x:auto; }
        .ad-tab{ font-family:var(--ad-font-body); font-size:13.5px; font-weight:700; color:#94A3B8; background:none; border:none; padding:11px 16px; cursor:pointer; white-space:nowrap; border-bottom:2.5px solid transparent; display:flex; align-items:center; gap:7px; }
        .ad-tab.on{ color:#fff; border-bottom-color:#facc15; }
 
        .ad-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
        @media (max-width:760px){ .ad-stats{ grid-template-columns:1fr 1fr; } }
        .ad-stat-card{ background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:18px; }
        .ad-stat-label{ font-size:11.5px; color:#64748B; text-transform:uppercase; letter-spacing:0.04em; }
        .ad-stat-value{ font-family:var(--ad-font-head); font-size:22px; font-weight:800; margin-top:6px; }
 
        .ad-card{ background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:20px 22px; margin-bottom:14px; }
        .ad-card-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:14px; flex-wrap:wrap; }
        .ad-card-name{ font-family:var(--ad-font-head); font-weight:700; font-size:15.5px; }
        .ad-card-meta{ font-size:12.5px; color:#94A3B8; margin-top:3px; }
        .ad-doc-row{ display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; }
        .ad-doc-btn{ font-size:12px; font-weight:700; color:#CBD5E1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:7px 12px; border-radius:8px; cursor:pointer; }
        .ad-doc-btn:hover{ border-color:#facc15; }
        .ad-decide-row{ display:flex; gap:10px; margin-top:14px; }
        .ad-btn-approve{ background:#facc15; color:#1e293b; border:none; font-weight:700; font-size:12.5px; padding:9px 16px; border-radius:8px; cursor:pointer; }
        .ad-btn-approve:hover{ background:#eab308; }
        .ad-btn-reject{ background:none; border:1px solid #EF4444; color:#FCA5A5; font-weight:700; font-size:12.5px; padding:9px 16px; border-radius:8px; cursor:pointer; }
 
        .ad-payment-pills{ display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
        .ad-feed-item{ font-size:13px; color:#94A3B8; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
        .ad-feed-item:last-child{ border-bottom:none; }
 
        .ad-setup-note{ font-size:12px; color:#64748B; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 14px; margin-top:22px; line-height:1.6; }
 
        @media (max-width:640px){
          .ad-header{ padding:16px 20px; }
          .ad-main{ padding:24px 18px 56px; }
        }
      `}</style>
 
      <div className="ad-glow" />
      <div className="ad-wrap">
        <header className="ad-header">
          <a href="/" className="ad-brand">
            <span className="ad-dots">
              <span className="ad-dot" style={{ background: '#facc15' }} />
              <span className="ad-dot" style={{ background: '#fbbf24' }} />
              <span className="ad-dot" style={{ background: '#059669' }} />
            </span>
            SolarHues <span className="ad-badge">Admin</span>
          </a>
          {session && isAdmin && (
            <button className="ad-logout" onClick={handleLogout}><LogOut size={13} /> Log out</button>
          )}
        </header>
 
        {checking && (
          <div className="ad-login-wrap"><p style={{ color: '#94A3B8' }}>Checking session...</p></div>
        )}
 
        {!checking && (!session || !isAdmin) && (
          <div className="ad-login-wrap">
            <div className="ad-login-card">
              <div className="ad-icon-badge"><ShieldCheck size={22} color="#6EE7B7" /></div>
              <h1 className="ad-title">Admin login</h1>
              <p className="ad-sub">Internal access only. Your account must be approved as an admin in Supabase before you can sign in here.</p>
 
              <form onSubmit={handleLogin}>
                <div className="ad-field">
                  <label className="ad-label">Email</label>
                  <input className="ad-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@solarhues.com" />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Password</label>
                  <input className="ad-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                {loginError && <div className="ad-error">{loginError}</div>}
                <button className="ad-submit" disabled={loggingIn}>{loggingIn ? 'Signing in...' : 'Log in'}</button>
              </form>
 
              {session && !isAdmin && (
                <div className="ad-denied">
                  This account doesn't have admin access. If this is a mistake, check the <code>role</code> column for this user in Supabase's <code>profiles</code> table.
                </div>
              )}
 
              <div className="ad-setup-note">
                <strong>Setup note:</strong> this page checks Supabase's <code>profiles</code> table for <code>role = 'admin'</code>.
                If you haven't already, sign up once through the normal flow, then manually set that row's role to
                <code> admin</code> in Supabase's Table Editor.
              </div>
            </div>
          </div>
        )}
 
        {!checking && session && isAdmin && (
          <main className="ad-main">
            <h1 className="ad-page-title">Admin console</h1>
            <p className="ad-page-sub">Vendor approvals, customers, proposals and payments — all in one place.</p>
 
            <div className="ad-tabs">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} className={`ad-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
                    <Icon size={14} /> {t.label}
                  </button>
                );
              })}
            </div>
 
            {tab === 'overview' && (
              <div>
                <div className="ad-stats">
                  <div className="ad-stat-card"><div className="ad-stat-label">Customers</div><div className="ad-stat-value">1,412</div></div>
                  <div className="ad-stat-card"><div className="ad-stat-label">Verified vendors</div><div className="ad-stat-value">382</div></div>
                  <div className="ad-stat-card"><div className="ad-stat-label">Pending approvals</div><div className="ad-stat-value" style={{ color: '#FDE047' }}>{vendors.filter(v => !v.decided).length}</div></div>
                  <div className="ad-stat-card"><div className="ad-stat-label">Payments processed</div><div className="ad-stat-value" style={{ color: '#6EE7B7' }}>₹4.1 Cr</div></div>
                </div>
                <div className="ad-card">
                  <div className="ad-card-name" style={{ marginBottom: 10 }}>Recent activity</div>
                  <div className="ad-feed-item">Anjali Rao paid Tranche 2 (₹2,01,600) to Peak Energy Solutions</div>
                  <div className="ad-feed-item">New vendor application — Sunrise Rooftop Co. — awaiting review</div>
                  <div className="ad-feed-item">EcoBright Solar completed site survey for Deepak Menon</div>
                </div>
              </div>
            )}
 
            {tab === 'approvals' && (
              <div>
                {vendors.map((v) => (
                  <div key={v.id} className="ad-card" style={{ opacity: v.decided ? 0.5 : 1 }}>
                    <div className="ad-card-top">
                      <div>
                        <div className="ad-card-name"><Building2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />{v.company}</div>
                        <div className="ad-card-meta">Owner: {v.owner} · {v.phone}</div>
                        <div className="ad-card-meta">{v.address}</div>
                      </div>
                      {v.decided ? (
                        <StatusPill label={v.decided === 'approve' ? 'Approved' : 'Rejected'} tone={v.decided === 'approve' ? 'ok' : 'due'} />
                      ) : (
                        <StatusPill label="Pending review" tone="due" />
                      )}
                    </div>
                    {!v.decided && (
                      <>
                        <div className="ad-doc-row">
                          <button className="ad-doc-btn">Company photo</button>
                          <button className="ad-doc-btn">GST certificate</button>
                          <button className="ad-doc-btn">Incorporation certificate</button>
                          <button className="ad-doc-btn">PAN card</button>
                          <button className="ad-doc-btn">Owner Aadhaar</button>
                        </div>
                        <div className="ad-decide-row">
                          <button className="ad-btn-approve" onClick={() => decideVendor(v.id, 'approve')}>Approve vendor</button>
                          <button className="ad-btn-reject" onClick={() => decideVendor(v.id, 'reject')}>Reject</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
 
            {tab === 'customers' && (
              <div>
                {CUSTOMERS.map((c) => (
                  <div key={c.id} className="ad-card">
                    <div className="ad-card-top">
                      <div>
                        <div className="ad-card-name">{c.name}</div>
                        <div className="ad-card-meta">{c.area} · {c.size} · {c.vendor}</div>
                      </div>
                      <StatusPill label={c.status} tone="upcoming" />
                    </div>
                  </div>
                ))}
              </div>
            )}
 
            {tab === 'payments' && (
              <div>
                {PAYMENTS.map((p) => (
                  <div key={p.id} className="ad-card">
                    <div className="ad-card-top">
                      <div className="ad-card-name">{p.pair}</div>
                      <div className="ad-card-meta">{p.total} total</div>
                    </div>
                    <div className="ad-payment-pills">
                      {p.stages.map(([label, tone], i) => (
                        <StatusPill key={i} label={label} tone={tone} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
 
            <div className="ad-setup-note">
              Vendor, customer, and payment lists above are sample data — swap for real Supabase queries
              against <code>vendors</code>, <code>solar_estimates</code>/<code>quotes</code>, and{' '}
              <code>payments</code> once the schema is populated.
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
