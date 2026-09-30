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
  const [sel, setSel] = useState(null);

  return (
    <>
      <style>{`
        .ad-box { width: 100%; max-width: 1200px; margin: 0 auto; padding: 40px 24px; text-align: left; }
        .ad-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; margin-top: 32px; }
        .tbl-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; overflow: hidden; }
        .tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
        .tbl th { background: rgba(0, 0, 0, 0.2); padding: 16px; color: #94A3B8; font-family: 'Space Grotesk', sans-serif; }
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
        <div className="pill-status" style={{ borderColor: '#EF4444', color: '#FCA5A5' }}>Ops Panel</div>
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
