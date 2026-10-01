'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SolarHuesHome() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setErr('');
    if (!pin || pin.length !== 6) {
      setErr('Enter a valid 6-digit area pin code.');
      return;
    }
    router.push(`/calculator?pin=${pin}`);
  };

  return (
    <div className="sh-page">
      <div className="top">
        <div className="brand">
          <span className="hue-dots"><span style={{background:'#facc15'}}></span><span style={{background:'#059669'}}></span><span></span></span>
          SolarHues
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/calculator" className="pill-status">Calculator</a>
          <a href="/products" className="pill-status">Products</a>
          <a href="/login" className="pill-status" style={{ background: 'rgba(250, 204, 21, 0.1)', borderColor: '#facc15' }}>Customer Login →</a>
        </div>
      </div>

      <div className="center">
        <div className="kicker">India's Solar Escrow Marketplace</div>
        <h1>Find the right <span className="hue">shade of solar</span><br />for your roof.</h1>
        <p className="sub">Instantly compute generation capabilities, system sizing constraints, and financial payback timelines verified against regional irradiance mapping matrices.</p>

        <div className="waitlist" style={{ maxWidth: '500px', marginTop: '36px' }}>
          <form onSubmit={handleSearch} className="waitlist-row" style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <input
              type="text"
              maxLength={6}
              placeholder="Enter your 6-digit area pin code..."
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              style={{ flex: '1', padding: '16px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '16px', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '0 28px', borderRadius: '10px', background: '#facc15', color: '#1e293b', fontWeight: '700', fontSize: '15px', cursor: 'pointer', border: 'none' }}>Analyze Roof →</button>
          </form>
          {err && <div style={{ color: '#EF4444', fontSize: '13.5px', marginTop: '10px', fontWeight: 'bold' }}>{err}</div>}
        </div>

        <div className="features">
          <div><span className="dot" style={{background:'#059669'}}></span> Verified EPC Vendors</div>
          <div><span className="dot" style={{background:'#facc15'}}></span> Escrow Payment Shield</div>
          <div><span className="dot" style={{background:'#38bdf8'}}></span> Localized Sizing Matrix</div>
        </div>
      </div>

      <div className="bottom">
        <div>© 2026 SolarHues. All rights reserved.</div>
        <div className="footer-links" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
      <style>{`
        .sh-page{min-height:100vh;background:#1e293b;color:#fff;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
        h1{font-family:'Space Grotesk',sans-serif;font-weight:700;}
      `}</style>
    </div>
  );
}
