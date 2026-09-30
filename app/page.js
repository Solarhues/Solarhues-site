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

    if (!pincode || pincode.length !== 6) {
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
          <span className="hue-dots"><span></span><span></span><span></span></span>
          SolarHues
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/calculator" className="pill-status">Calculator</a>
          <a href="/products" className="pill-status">Products</a>
          <a href="/login" className="pill-status" style={{ background: 'rgba(250, 204, 21, 0.1)', borderColor: 'var(--sun)' }}>
            Customer Login →
          </a>
        </div>
      </div>

      <div className="center">
        <div className="kicker">India's solar marketplace</div>
        <h1>Find the right <span className="hue">shade of solar</span><br />for your roof.</h1>
        <p className="sub">Instantly compute your roof's generation capabilities, installation sizing constraints, and financial payback timelines based on regional solar irradiance mapping data.</p>

        <div className="waitlist" style={{ maxWidth: '520px', marginTop: '40px' }}>
          <label style={{ display: 'block', fontSize: '15px', color: '#CBD5E1', marginBottom: '10px', fontWeight: '500' }}>
            Enter your area pin code:
          </label>
          <form onSubmit={handleGoToCalculator} className="waitlist-row" style={{ display: 'flex', gap: '10px', alignItems: 'stretch', width: '100%' }}>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 110001 or 400001"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              style={{ 
                flex: '1', padding: '16px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.22)', 
                background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '18px', outline: 'none', height: '56px'
              }}
            />
            <button 
              type="submit" 
              style={{ 
                padding: '0 28px', borderRadius: '10px', background: 'var(--sun)', color: '#1e293b', 
                fontWeight: '700', fontSize: '16px', whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', height: '56px'
              }}
            >
              Calculator →
            </button>
          </form>
          <div style={msgStyle}>{msgText}</div>
          <p className="waitlist-note" style={{ marginTop: '12px' }}>Get instant localized generation analysis and localized installer quotations.</p>
        </div>

        <div className="features">
          <div><span className="dot"></span> 3,000+ Roofs Mapped</div>
          <div><span className="dot"></span> Verified EPC Vendors</div>
          <div><span className="dot"></span> Instant ROI Estimator</div>
        </div>
      </div>

      <div className="bottom">
        <div>© 2026 SolarHues. All rights reserved.</div>
        <div className="footer-links" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/privacy">Privacy</a>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
          <a 
            href="/admin" 
            style={{ color: '#64748B', fontSize: '11.5px', fontWeight: '500', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--sun)'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            Admin Panel ⚙️
          </a>
        </div>
      </div>
    </>
  );
}
