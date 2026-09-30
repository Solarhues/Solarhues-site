'use client';
import React, { useState } from 'react';

const DATA = [
  {
    id: '101', name: 'Aarav Sharma', email: 'aarav@gmail.com', pin: '110001', req: '5 kW Rooftop Grid', val: '₹2,22,000', date: 'Sep 28',
    miles: [
      { step: 1, title: 'Irradiance Mapped', status: 'completed', desc: 'Satellite solar curves calculated.' },
      { step: 2, title: 'Vendor Assigned', status: 'completed', desc: 'Connected to local installers.' },
      { step: 3, title: 'Feasibility Audit', status: 'active', desc: 'Site load analysis scheduled.' },
      { step: 4, title: 'Net-Metering Approval', status: 'upcoming' },
      { step: 5, title: 'Subsidy Release', status: 'upcoming' }
    ]
  },
  {
    id: '102', name: 'Priya Patel', email: 'priya@yahoo.com', pin: '400001', req: '3 kW Residential', val: '₹1,02,000', date: 'Sep 25',
    miles: [
      { step: 1, title: 'Irradiance Mapped', status: 'completed', desc: 'Satellite solar curves calculated.' },
      { step: 2, title: 'Vendor Assigned', status: 'completed', desc: 'Connected to local installers.' },
      { step: 3, title: 'Feasibility Audit', status: 'completed', desc: 'Structural analysis finalized.' },
      { step: 4, title: 'Net-Metering Approval', status: 'active', desc: 'Queued for board review.' },
      { step: 5, title: 'Subsidy Release', status: 'upcoming' }
    ]
  }
];

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sel, setSel] = useState(null);

  const handleVerifyPasscode = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Secure Master Administrative Access Token Code (Change this string to whatever you want!)
    if (passcode === 'SolarHuesAdmin2026') {
      setIsAuthenticated(true);
    } else {
      setErrorMsg('Access Denied. Invalid System Passcode Token.');
      setPasscode('');
    }
  };

  // 🔐 BOUNCER SCREEN: Render a secure lockout shield if the user hasn't successfully passed verification
  if (!isAuthenticated) {
    return (
      <>
        <div className="top">
          <a href="/" className="brand">
            <span className="hue-dots"><span></span><span></span><span></span></span>SolarHues
          </a>
        </div>
        <div className="center">
          <div className="kicker" style={{ color: '#FCA5A5' }}>Security Gateway</div>
          <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>System Operations Control</h1>
          <p className="sub" style={{ marginBottom: '28px' }}>Restricted administrative layout route. Enter your master terminal validation code to unlock access.</p>
          
          <div style={{ width: '100%', maxWidth: '380px', background: 'rgba(255,255,255,0.02)', padding: '24px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
            <form onSubmit={handleVerifyPasscode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="password" 
                placeholder="Enter admin passcode..." 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '15px', outline: 'none' }}
                required
              />
              <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#EF4444', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
                Verify Key Identity →
              </button>
            </form>
            {errorMsg && <div style={{ color: '#FCA5A5', fontSize: '13px', marginTop: '12px', fontWeight: 'bold', textStyle: 'center' }}>{errorMsg}</div>}
          </div>
        </div>
      </>
    );
  }

  // 🎯 GRANTED ACCESS: Render the fully unlocked administrative database monitoring layout console
  return (
    <>
      <style>{`
        .ad-box { width: 100%; max-width: 1200px; margin: 0 auto; padding: 40px 24px; text-align: left; }
        .ad-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; margin-top: 32px; }
        .tbl-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; overflow: hidden; }
        .tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
        .tbl th { background: rgba(0, 0, 0, 0.2); padding: 16px; color: #94A3B8; font-family: 'Space Grotesk', sans-serif; text-align: left; }
        .tbl td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.04); color: #CBD5E1; cursor: pointer; }
        .tbl tr:hover { background: rgba(255, 255, 255, 0.05); }
        .act { background: rgba(250, 204, 21, 0.06) !important; border-left: 3px solid var(--sun); }
        .side { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 24px; }
        .m-row { display: flex; gap: 14px; margin-bottom: 20px; position: relative; }
        .m-row:not(:last-child)::after { content: ''; position: absolute; left: 11px; top: 24px; bottom: -20px; width: 2px; background: rgba(255,255,255,0.08); }
        .ind { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0; z-index: 2; }
        .s-done { background: var(--emerald); color: #fff; }
        .s-act { background: var(--sun); color: #1e293b; box-shadow: 0 0 12px rgba(250,204,21,0.4); }
        .s-up { background: #334155; color: #94A3B8; }
        @media (max-width: 960px) { .ad-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="top">
        <a href="/" className="brand">
          <span className="hue-dots"><span></span><span></span><span></span></span>SolarHues
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setIsAuthenticated(false)} className="pill-status" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444', color: '#FCA5A5', cursor: 'pointer' }}>
            Lock Console
          </button>
        </div>
      </div>

      <div className="ad-box">
        <div className="kicker">Management</div>
        <h1>Marketplace <span className="hue">Lead Monitor</span></h1>

        <div className="ad-grid">
          <div className="tbl-card">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Location</th>
                  <th>Requirement</th>
                </tr>
              </thead>
              <tbody>
                {DATA.map((c) => (
                  <tr key={c.id} onClick={() => setSel(c)} className={sel?.id === c.id ? 'act' : ''}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{c.email}</div>
                    </td>
                    <td>{c.pin}</td>
                    <td>
                      <div style={{ color: 'var(--sun)', fontWeight: '600' }}>{c.req}</div>
                      <div style={{ fontSize: '12px', color: 'var(--emerald)' }}>{c.val}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="side">
            {sel ? (
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontFamily: 'Space Grotesk' }}>{sel.name}</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>ID: {sel.id}</p>
                <div>
                  {sel.miles.map((m) => (
                    <div className="m-row" key={m.step}>
                      <div className={`ind ${m.status === 'completed' ? 's-done' : m.status === 'active' ? 's-act' : 's-up'}`}>
                        {m.status === 'completed' ? '✓' : m.step}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{m.title}</div>
                        {m.desc && <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>{m.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Select a row to track milestones.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
