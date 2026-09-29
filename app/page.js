'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SolarhuesHome() {
  const router = useRouter();
  const [pincode, setPincode] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgStyle, setMsgStyle] = useState({ display: 'none' });

  const handleGoToCalculator = (e) => {
    e.preventDefault();
    setMsgText('');
    setMsgStyle({ display: 'none' });

    if (!pincode || !/^\d{6}\$/.test(pincode)) {
      setMsgStyle({ display: 'block', color: '#FCA5A5', fontSize: '13.5px', marginTop: '12px', fontWeight: 'bold' });
      setMsgText('Enter a valid 6-digit area pin code.');
      return;
    }

    router.push(`/calculator?pin=${pincode}`);
  };

  return (
    <>
      <div className="top">
        <div className="brand">
          <span className="hue-dots">
            <span></span><span></span><span></span>
          </span>
          SolarHues
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/calculator" className="pill-status" style={{ transition: 'all 0.2s' }}>
            Calculator
          </a>
          <a href="/products" className="pill-status" style={{ transition: 'all 0.2s' }}>
            Products
          </a>
          <a href="/login" className="pill-status" style={{ background: 'rgba(250, 204, 21, 0.1)', borderColor: 'var(--sun)' }}>
            Customer Login →
          </a>
          <div className="pill-status" style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}>Launching soon</div>
        </div>
      </div>

      <div className="center">
        <div className="kicker">India's solar marketplace</div>
        <h1>Find the right <span className="hue">shade of solar</span><br />for your roof.</h1>
        <p className="sub">Instantly compute your roof's generation capabilities, installation sizing constraints, and financial payback timelines based on regional solar irradiance mapping data.</p>

        <div className="waitlist">
          <label style={{ display: 'block', fontSize: '14px', color: '#CBD5E1', marginBottom: '8px', fontWeight: '500' }}>
            Enter your area pin code:
          </label>
          <form onSubmit={handleGoToCalculator} className="waitlist-row">
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 110001 or 400001"
              value={pincode}
              onChange={(e) => setPincode(e.replace(/\D/g, ''))}
              style={{ flex: '1', padding: '13px 16px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '13px 20px', borderRadius: '9px', background: 'var(--sun)', color: '#1e293b', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', transition: 'background 0.2s' }}>
              Calculator →
            </button>
          </form>
          <div style={msgStyle}>{msgText}</div>
          <p className="waitlist-note">Get instant localized generation analysis and localized installer quotations.</p>
        </div>

        <div className="features">
          <div><span className="dot"></span> 3,000+ Roofs Mapped</div>
          <div><span className="dot"></span> Verified EPC Vendors</div>
          <div><span className="dot"></span> Instant ROI Estimator</div>
        </div>
      </div>

      <div className="bottom">
        <div>© 2026 SolarHues. All rights reserved.</div>
        <div className="footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
    </>
  );
}
